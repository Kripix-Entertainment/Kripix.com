// =====================================================================
//  KRIPIX SHOWREEL — Scena 3D "La Pagoda"
//  Vista dal basso: Stefano Valenti attraversa la strada bagnata ed
//  entra nel ristorante. Tutto è funzione del tempo locale `s` (secondi
//  dall'inizio della scena): nessuno stato, ogni frame è riproducibile.
// =====================================================================
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ---------- utilità deterministiche ----------
export function rng(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };

// ---------- coreografia (condivisa con la colonna sonora) ----------
export const SCENE = {
    FRONT_Z: -10,          // facciata del ristorante
    STEP_Z: -8.7,          // primo gradino
    STRIDE: 0.8,           // metri per passo
    DOOR_OPEN: [4.75, 5.75],
    DOOR_CLOSE: [7.0, 7.48],   // lo sbattere della porta cade a 7.48
    SHADOW_PASS: [7.75, 8.35], // sagoma con le corna dietro il vetro
    DURATION: 9.0,
};

// velocità (m/s) del personaggio in funzione del tempo locale
function speedAt(s) {
    if (s < 4.4) return 1.6;
    if (s < 5.0) return lerp(1.6, 0, smooth(4.4, 5.0, s));
    if (s < 5.4) return 0;
    if (s < 5.85) return lerp(0, 1.3, smooth(5.4, 5.85, s));
    return 1.3;
}
// tabella integrata: distanza percorsa e fase della camminata
const DT = 1 / 1000;
const WALK = (() => {
    const n = Math.ceil(SCENE.DURATION / DT) + 2;
    const dist = new Float32Array(n), phase = new Float32Array(n);
    let d = 0, p = 0;
    for (let i = 0; i < n; i++) {
        dist[i] = d; phase[i] = p;
        const v = speedAt(i * DT);
        d += v * DT; p += (v / SCENE.STRIDE) * DT;
    }
    return { dist, phase };
})();
function walkSample(s) {
    const f = clamp(s, 0, SCENE.DURATION) / DT, i = Math.floor(f), k = f - i;
    return {
        dist: lerp(WALK.dist[i], WALK.dist[i + 1], k),
        phase: lerp(WALK.phase[i], WALK.phase[i + 1], k),
        v: speedAt(s),
    };
}
const Z_START = -1.0;
function floorAt(z) {
    return 0.15 * smooth(SCENE.STEP_Z + 0.06, SCENE.STEP_Z - 0.06, z)
         + 0.15 * smooth(SCENE.STEP_Z - 0.24, SCENE.STEP_Z - 0.36, z);
}
export function charState(s) {
    const w = walkSample(s);
    const z = Z_START - w.dist;
    const x = lerp(0.55, 0.0, smooth(0, 4.5, s));
    return { x, z, y: floorAt(z), phase: w.phase, v: w.v };
}
// istanti in cui un piede tocca terra (per i passi nell'audio)
export function footstepTimes() {
    const out = [];
    let prev = walkSample(0).phase;
    for (let s = DT; s < SCENE.DURATION; s += DT) {
        const p = walkSample(s).phase;
        if (Math.floor(p) !== Math.floor(prev)) {
            const z = charState(s).z;
            out.push({ s, surface: z < SCENE.STEP_Z ? 'stone' : 'wet', inside: z < SCENE.FRONT_Z - 0.3 });
        }
        prev = p;
    }
    return out;
}
export function doorOpenAmount(s) {
    const o = smooth(SCENE.DOOR_OPEN[0], SCENE.DOOR_OPEN[1], s);
    const k = clamp((s - SCENE.DOOR_CLOSE[0]) / (SCENE.DOOR_CLOSE[1] - SCENE.DOOR_CLOSE[0]));
    return o * (1 - k * k * k); // chiusura che accelera: sbatte
}
// sfarfallio del neon (1 = acceso)
export function neonAt(s) {
    let n = 1;
    const blink = (a, b, depth) => { if (s > a && s < b) n *= depth; };
    blink(2.10, 2.16, 0.15); blink(2.24, 2.29, 0.4);
    blink(7.50, 7.62, 0.05); blink(7.70, 7.74, 0.3); blink(7.80, 8.05, 0.12);
    blink(8.12, 8.16, 0.4);
    n *= 0.94 + 0.06 * Math.sin(s * 91.0) * Math.sin(s * 37.0);
    return n;
}

// ---------- texture procedurali ----------
function canvasTex(w, h, draw, { repeat = null, srgb = true } = {}) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    return t;
}
function latticeDraw(g, w, h, { glow = '#ffb36b', frame = '#1a0705', cells = 6, lineW = 0.06, sil = null } = {}) {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    grd.addColorStop(0, glow); grd.addColorStop(1, '#5a1d0c');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    if (sil) sil(g, w, h);
    g.strokeStyle = frame; g.lineCap = 'square';
    const lw = Math.min(w, h) * lineW * 0.5;
    g.lineWidth = lw;
    const cw = w / cells, ch = h / Math.round(cells * h / w);
    for (let x = 0; x <= w + 1; x += cw) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h + 1; y += ch) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    // motivo a "fret" cinese dentro ogni cella
    g.lineWidth = lw * 0.55;
    for (let x = 0; x < w - 1; x += cw) for (let y = 0; y < h - 1; y += ch) {
        const m = cw * 0.22;
        g.strokeRect(x + m, y + m, cw - 2 * m, ch - 2 * m);
        g.beginPath(); g.moveTo(x + cw / 2, y + m); g.lineTo(x + cw / 2, y + ch / 2); g.lineTo(x + cw - m, y + ch / 2); g.stroke();
    }
    g.lineWidth = lw * 2.2; g.strokeRect(0, 0, w, h);
}

// ---------- tetti a pagoda ----------
// Superficie con profilo concavo e angoli rialzati. Il lato di sotto
// (quello che vediamo dal basso) ha una sua texture dipinta con travetti.
function pagodaRoof({ w, d, eaveY, topW, topD, topY, lift = 0.7, segs = 28, rows = 10 }, mats) {
    const top = [], under = [], fascia = [];
    const sides = [
        // [eave start, eave end, top start, top end]
        [[-w / 2, d / 2], [w / 2, d / 2], [-topW / 2, topD / 2], [topW / 2, topD / 2]],
        [[w / 2, d / 2], [w / 2, -d / 2], [topW / 2, topD / 2], [topW / 2, -topD / 2]],
        [[w / 2, -d / 2], [-w / 2, -d / 2], [topW / 2, -topD / 2], [-topW / 2, -topD / 2]],
        [[-w / 2, -d / 2], [-w / 2, d / 2], [-topW / 2, -topD / 2], [-topW / 2, d / 2]],
    ];
    const H = topY - eaveY;
    const point = (side, u, v) => {
        const [e0, e1, t0, t1] = side;
        const ex = lerp(e0[0], e1[0], u), ez = lerp(e0[1], e1[1], u);
        const tx = lerp(t0[0], t1[0], u), tz = lerp(t0[1], t1[1], u);
        const sN = Math.abs(u * 2 - 1);
        const y = eaveY + H * Math.pow(v, 1.75) + lift * Math.pow(sN, 5) * Math.pow(1 - v, 1.6);
        return [lerp(ex, tx, v), y, lerp(ez, tz, v)];
    };
    const build = (offset, flip) => {
        const pos = [], uv = [], idx = [];
        let base = 0;
        for (const side of sides) {
            for (let j = 0; j <= rows; j++) for (let i = 0; i <= segs; i++) {
                const u = i / segs, v = j / rows;
                const p = point(side, u, v);
                pos.push(p[0], p[1] - offset, p[2]);
                const len = Math.hypot(side[1][0] - side[0][0], side[1][1] - side[0][1]);
                uv.push(u * len / 1.2, v * 3);
            }
            for (let j = 0; j < rows; j++) for (let i = 0; i < segs; i++) {
                const a = base + j * (segs + 1) + i, b = a + 1, c = a + segs + 1, dd = c + 1;
                if (flip) idx.push(a, b, c, b, dd, c); else idx.push(a, c, b, b, c, dd);
            }
            base += (rows + 1) * (segs + 1);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx); g.computeVertexNormals();
        return g;
    };
    const group = new THREE.Group();
    group.add(new THREE.Mesh(build(0, false), mats.tiles));
    group.add(new THREE.Mesh(build(0.14, true), mats.soffit));
    // fascia (bordo dell'aggetto) — rossa con filo d'oro
    const fpos = [], fuv = [], fidx = []; let b = 0;
    for (const side of sides) {
        for (let i = 0; i <= segs; i++) {
            const p = point(side, i / segs, 0);
            fpos.push(p[0], p[1] + 0.02, p[2], p[0], p[1] - 0.26, p[2]);
            fuv.push(i / segs * 8, 1, i / segs * 8, 0);
        }
        for (let i = 0; i < segs; i++) { const a = b + i * 2; fidx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        b += (segs + 1) * 2;
    }
    const fg = new THREE.BufferGeometry();
    fg.setAttribute('position', new THREE.Float32BufferAttribute(fpos, 3));
    fg.setAttribute('uv', new THREE.Float32BufferAttribute(fuv, 2));
    fg.setIndex(fidx); fg.computeVertexNormals();
    group.add(new THREE.Mesh(fg, mats.fascia));
    // creste angolari (lungo le diagonali) e punte rialzate
    for (const side of sides) {
        const pts = [];
        for (let k = 0; k <= 12; k++) {
            const p = point(side, 0, k / 12);
            pts.push(new THREE.Vector3(p[0], p[1] + 0.06, p[2]));
        }
        const tip = pts[0].clone();
        const out = new THREE.Vector3(tip.x, 0, tip.z).normalize();
        pts.unshift(tip.clone().add(out.multiplyScalar(0.45)).add(new THREE.Vector3(0, 0.5, 0)));
        group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.07, 6), mats.ridge));
        const orn = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), mats.gold);
        orn.position.copy(pts[0]); group.add(orn);
    }
    return group;
}

// ---------- il personaggio: Stefano Valenti ----------
function buildStefano(mats) {
    const root = new THREE.Group();
    const pelvis = new THREE.Group(); pelvis.position.y = 0.93; root.add(pelvis);
    const cap = (r, len, mat) => {
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), mat);
        m.position.y = -len / 2; m.castShadow = true; return m;
    };
    // cappotto (trench) — lathe ellittico
    const prof = [[0.0, 0.5], [0.285, 0.5], [0.25, 0.68], [0.215, 0.9], [0.198, 1.0], [0.21, 1.18], [0.222, 1.36], [0.2, 1.43], [0.13, 1.49], [0.075, 1.53], [0.0, 1.53]]
        .map(([r, y]) => new THREE.Vector2(r, y - 0.93));
    const coat = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), mats.coat);
    coat.scale.set(1.22, 1, 0.78); coat.castShadow = true;
    const torso = new THREE.Group(); pelvis.add(torso); torso.add(coat);
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.045, 28, 1, true), mats.belt);
    belt.scale.set(1.22, 1, 0.78); belt.position.y = 1.0 - 0.93; torso.add(belt);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 0.11, 16, 1, true), mats.coat);
    collar.position.y = 1.56 - 0.93; collar.castShadow = true; torso.add(collar);
    // spacco posteriore del trench
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.3, 0.01), mats.belt);
    vent.position.set(0, 0.66 - 0.93, 0.205); torso.add(vent);
    // testa e cappello
    const head = new THREE.Group(); head.position.y = 1.56 - 0.93; torso.add(head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.102, 18, 14), mats.skin);
    skull.position.y = 0.1; skull.scale.set(0.95, 1.08, 1); skull.castShadow = true; head.add(skull);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.106, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), mats.hair);
    hair.position.y = 0.1; hair.rotation.x = -0.5; head.add(hair);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.2, 0.014, 32), mats.hat);
    brim.position.y = 0.178; brim.rotation.x = 0.07; brim.castShadow = true; head.add(brim);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.118, 0.13, 24), mats.hat);
    crown.position.y = 0.245; crown.castShadow = true; head.add(crown);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.119, 0.121, 0.026, 24), mats.band);
    band.position.y = 0.198; head.add(band);
    const dent = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 6, 0, Math.PI * 2, 0, 0.6), mats.hat);
    dent.position.y = 0.27; dent.scale.set(1, 0.4, 1.15); head.add(dent);
    // braccia
    const arm = (side) => {
        const sh = new THREE.Group(); sh.position.set(side * 0.235, 1.4 - 0.93, 0); torso.add(sh);
        sh.add(cap(0.062, 0.26, mats.coat));
        const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
        el.add(cap(0.056, 0.22, mats.coat));
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mats.skin);
        hand.position.y = -0.3; hand.castShadow = true; el.add(hand);
        return { sh, el, hand };
    };
    const armL = arm(-1), armR = arm(1);
    // la macchina fotografica anni '40 nella mano destra
    const cam = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.07), mats.camera); cam.add(body);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.06, 16), mats.gold);
    lens.rotation.x = Math.PI / 2; lens.position.z = -0.06; cam.add(lens);
    const flash = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.02, 0.05, 16), mats.chrome);
    flash.rotation.x = Math.PI / 2; flash.position.set(0.08, 0.06, -0.03); cam.add(flash);
    cam.position.set(-0.03, -0.32, -0.03); armR.el.add(cam);
    // gambe
    const leg = (side) => {
        const hip = new THREE.Group(); hip.position.set(side * 0.1, 0, 0); pelvis.add(hip);
        hip.add(cap(0.075, 0.33, mats.trousers));
        const knee = new THREE.Group(); knee.position.y = -0.43; hip.add(knee);
        knee.add(cap(0.058, 0.34, mats.trousers));
        const foot = new THREE.Group(); foot.position.y = -0.43; knee.add(foot);
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.075, 0.28), mats.shoe);
        shoe.position.set(0, -0.035, -0.07); shoe.castShadow = true; foot.add(shoe);
        return { hip, knee, foot };
    };
    const legL = leg(-1), legR = leg(1);

    function pose(st, s) {
        const amp = clamp(st.v / 1.3);
        const th = Math.PI * st.phase;
        const L = Math.cos(th), R = -L;
        legL.hip.rotation.x = 0.42 * amp * L;
        legR.hip.rotation.x = 0.42 * amp * R;
        legL.knee.rotation.x = -(0.08 + 0.85 * Math.max(0, -Math.sin(th))) * amp;
        legR.knee.rotation.x = -(0.08 + 0.85 * Math.max(0, Math.sin(th))) * amp;
        legL.foot.rotation.x = -(legL.hip.rotation.x + legL.knee.rotation.x) * 0.7;
        legR.foot.rotation.x = -(legR.hip.rotation.x + legR.knee.rotation.x) * 0.7;
        pelvis.position.y = 0.93 - 0.035 * amp * (1 - Math.abs(Math.sin(th)));
        torso.rotation.z = 0.035 * amp * Math.sin(th);
        torso.rotation.y = 0.06 * amp * L;
        torso.rotation.x = 0.06 * amp; // leggermente curvo in avanti
        armL.sh.rotation.x = -0.38 * amp * L; armL.sh.rotation.z = -0.08;
        armL.el.rotation.x = 0.25 + 0.15 * amp;
        armR.sh.rotation.x = 0.35; armR.sh.rotation.z = 0.12; // stringe la fotocamera
        armR.el.rotation.x = 1.25;
        // si ferma e guarda in alto l'insegna, poi riabbassa lo sguardo
        const look = smooth(4.5, 5.0, s) * (1 - smooth(5.5, 6.0, s));
        head.rotation.x = 0.05 + 0.42 * look;
        head.rotation.y = -0.18 * look + 0.04 * Math.sin(s * 1.3);
        // respiro affannoso (asmatico): spalle che si alzano
        torso.scale.y = 1 + 0.008 * Math.sin(s * 9.0) * (1 - amp * 0.5);
        coat.scale.x = 1.22 + 0.015 * amp * Math.sin(th * 2);
    }
    return { root, pose };
}

// ---------- il Maître: due metri di eleganza e una maschera da cervo ----------
function buildMaitre(mats) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.24, 1.55, 16), mats.tux);
    body.position.y = 1.05; g.add(body);
    const shirt = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.5), mats.bone);
    shirt.position.set(0, 1.5, 0.215); g.add(shirt);
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.35, 12), mats.tux);
    legs.position.y = 0.17; g.add(legs);
    for (const sx of [-1, 1]) {
        const a = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.95, 8), mats.tux);
        a.position.set(sx * 0.26, 1.25, 0); a.rotation.z = sx * 0.06; g.add(a);
    }
    const head = new THREE.Group(); head.position.y = 1.95; g.add(head);
    const skull = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.38, 12), mats.bone);
    skull.rotation.x = Math.PI / 2 + 0.35; skull.position.set(0, 0.02, 0.1); head.add(skull);
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), mats.bone);
    cranium.position.y = 0.06; head.add(cranium);
    const tube = (pts, r) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 16, r, 5), mats.antler);
    for (const sx of [-1, 1]) {
        head.add(tube([[sx * 0.06, 0.12, 0], [sx * 0.2, 0.3, -0.03], [sx * 0.3, 0.55, -0.05], [sx * 0.33, 0.85, 0]], 0.018));
        head.add(tube([[sx * 0.22, 0.34, -0.03], [sx * 0.35, 0.42, 0.05], [sx * 0.45, 0.5, 0.06]], 0.012));
        head.add(tube([[sx * 0.29, 0.52, -0.05], [sx * 0.42, 0.68, -0.02], [sx * 0.5, 0.75, 0.02]], 0.011));
        head.add(tube([[sx * 0.31, 0.7, -0.03], [sx * 0.24, 0.88, -0.04], [sx * 0.2, 0.98, -0.02]], 0.01));
    }
    return { root: g, head };
}

// =====================================================================
export function createPagoda(renderer, W, H) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060b);
    scene.fog = new THREE.FogExp2(0x070a12, 0.028);
    const R = rng(1977);

    const camera = new THREE.PerspectiveCamera(68, W / H, 0.05, 260);

    // ---------- materiali ----------
    const tilesTex = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#16191d'; g.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 16) {
            const gr = g.createLinearGradient(x, 0, x + 16, 0);
            gr.addColorStop(0, '#0b0d10'); gr.addColorStop(0.5, '#2a2f36'); gr.addColorStop(1, '#0b0d10');
            g.fillStyle = gr; g.fillRect(x, 0, 16, h);
        }
        g.fillStyle = 'rgba(0,0,0,0.5)';
        for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 3);
    }, { repeat: [1, 1] });
    const soffitTex = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#0f3b39'; g.fillRect(0, 0, w, h);   // verde-acqua dipinto
        for (let x = 0; x < w; x += 32) {
            g.fillStyle = '#5d1410'; g.fillRect(x + 6, 0, 18, h); // travetti laccati
            g.fillStyle = '#b8913e'; g.fillRect(x + 12, h * 0.05, 6, 10); // testa dorata
        }
        g.fillStyle = 'rgba(184,145,62,0.55)'; g.fillRect(0, h * 0.47, w, 4);
    }, { repeat: [1, 1] });
    const fasciaTex = canvasTex(256, 64, (g, w, h) => {
        g.fillStyle = '#5a1210'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#c9a24b'; g.fillRect(0, 6, w, 4); g.fillRect(0, h - 12, w, 3);
        for (let x = 0; x < w; x += 32) { g.beginPath(); g.arc(x + 16, h / 2, 8, 0, Math.PI * 2); g.fillStyle = '#c9a24b'; g.fill(); }
    }, { repeat: [1, 1] });
    const beamTex = canvasTex(512, 64, (g, w, h) => {
        g.fillStyle = '#0f3b39'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#5a1210'; g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8);
        for (let x = 0; x < w; x += 128) {
            g.fillStyle = '#c9a24b'; g.beginPath(); g.ellipse(x + 64, h / 2, 40, 16, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#1d5a8a'; g.beginPath(); g.ellipse(x + 64, h / 2, 28, 10, 0, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#c9a24b'; g.fillRect(x, 14, 4, h - 28); g.fillRect(x + 124, 14, 4, h - 28);
        }
    }, { repeat: [4, 1] });
    const wallTex = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#2b201c'; g.fillRect(0, 0, w, h);
        const r = rng(7);
        for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? 0 : 80},${r() < 0.5 ? 0 : 60},${r() < 0.5 ? 0 : 50},0.08)`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); }
        for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(r() * w, 0, 1 + r() * 3, h); } // colature di pioggia
    }, { repeat: [3, 1] });
    const stoneTex = canvasTex(256, 256, (g, w, h) => {
        g.fillStyle = '#3a3a3c'; g.fillRect(0, 0, w, h);
        const r = rng(11);
        for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.1})`; g.fillRect(r() * w, r() * h, 2, 2); }
        g.strokeStyle = '#151516'; g.lineWidth = 3;
        for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 64) % 2 * 64; x < w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } }
    }, { repeat: [4, 1] });

    const std = (o) => new THREE.MeshStandardMaterial(o);
    const mats = {
        tiles: std({ map: tilesTex, roughness: 0.55, metalness: 0.2 }),
        soffit: std({ map: soffitTex, roughness: 0.75 }),
        fascia: std({ map: fasciaTex, roughness: 0.5 }),
        ridge: std({ color: 0x15171a, roughness: 0.5 }),
        gold: std({ color: 0xc9a24b, roughness: 0.32, metalness: 0.85 }),
        lacquer: std({ color: 0x6a120e, roughness: 0.38, metalness: 0.05 }),
        darkwood: std({ color: 0x1b0e09, roughness: 0.7 }),
        beam: std({ map: beamTex, roughness: 0.6 }),
        wall: std({ map: wallTex, roughness: 0.92 }),
        stone: std({ map: stoneTex, roughness: 0.55 }),
        coat: std({ color: 0x3a3127, roughness: 0.82 }),
        belt: std({ color: 0x1d1813, roughness: 0.7 }),
        trousers: std({ color: 0x17171b, roughness: 0.85 }),
        shoe: std({ color: 0x0c0a09, roughness: 0.25, metalness: 0.1 }),
        hat: std({ color: 0x24211e, roughness: 0.8 }),
        band: std({ color: 0x0b0a09, roughness: 0.6 }),
        skin: std({ color: 0x8b6a58, roughness: 0.7 }),
        hair: std({ color: 0x151210, roughness: 0.9 }),
        camera: std({ color: 0x111111, roughness: 0.4, metalness: 0.3 }),
        chrome: std({ color: 0xbbbbbb, roughness: 0.15, metalness: 1.0 }),
        tux: std({ color: 0x060606, roughness: 0.6 }),
        bone: std({ color: 0xd8d2c0, roughness: 0.6 }),
        antler: std({ color: 0x3b3128, roughness: 0.8 }),
        corridor: std({ color: 0x7a1712, roughness: 0.7, side: THREE.BackSide }),
        carpet: std({ color: 0x2a0606, roughness: 0.9 }),
    };

    // ---------- cielo, luna, nuvole ----------
    const skyTex = canvasTex(64, 512, (g, w, h) => {
        const gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, '#020308'); gr.addColorStop(0.55, '#0b1222'); gr.addColorStop(1, '#16141a');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(420, 260), new THREE.MeshBasicMaterial({ map: skyTex, fog: false }));
    sky.position.set(0, 70, -120); scene.add(sky);
    const moonTex = canvasTex(256, 256, (g, w, h) => {
        const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        gr.addColorStop(0, 'rgba(255,248,230,1)'); gr.addColorStop(0.16, 'rgba(240,232,210,1)');
        gr.addColorStop(0.19, 'rgba(180,190,220,0.35)'); gr.addColorStop(0.45, 'rgba(90,110,160,0.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const moon = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), new THREE.MeshBasicMaterial({ map: moonTex, transparent: true, fog: false, depthWrite: false, color: new THREE.Color(1.6, 1.6, 1.6) }));
    moon.position.set(-58, 82, -112); moon.lookAt(0, 0, 0); scene.add(moon);
    const cloudTex = canvasTex(1024, 512, (g, w, h) => {
        const r = rng(99);
        for (let i = 0; i < 260; i++) {
            const x = r() * w, y = h * (0.25 + r() * 0.6), rad = 30 + r() * 110;
            const gr = g.createRadialGradient(x, y, 0, x, y, rad);
            gr.addColorStop(0, `rgba(40,46,62,${0.10 + r() * 0.12})`); gr.addColorStop(1, 'rgba(40,46,62,0)');
            g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
    }, { repeat: [1, 1] });
    cloudTex.wrapS = THREE.RepeatWrapping;
    const clouds = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, fog: false, depthWrite: false }));
    clouds.position.set(0, 66, -100); scene.add(clouds);

    // ---------- terreno bagnato: specchio + asfalto con pozzanghere ----------
    const mirror = new Reflector(new THREE.PlaneGeometry(80, 80), {
        textureWidth: Math.round(W * 0.6), textureHeight: Math.round(H * 0.6), color: 0x5d6168, clipBias: 0.003,
    });
    mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, 0, -20); scene.add(mirror);
    const asphaltTex = canvasTex(1024, 1024, (g, w, h) => {
        g.fillStyle = '#121316'; g.fillRect(0, 0, w, h);
        const r = rng(3);
        for (let i = 0; i < 40000; i++) { const v = Math.floor(r() * 40); g.fillStyle = `rgba(${v},${v},${v + 4},0.35)`; g.fillRect(r() * w, r() * h, 2, 2); }
        g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2;
        for (let i = 0; i < 12; i++) { g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 90; y += (r() - 0.5) * 90; g.lineTo(x, y); } g.stroke(); }
    }, { repeat: [10, 10] });
    const puddleTex = canvasTex(512, 512, (g, w, h) => {
        g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
        const r = rng(5);
        for (let i = 0; i < 34; i++) {
            const x = r() * w, y = r() * h, rad = 14 + r() * 70;
            const gr = g.createRadialGradient(x, y, 0, x, y, rad);
            gr.addColorStop(0, 'rgba(0,0,0,0.95)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rad, rad * (0.5 + r() * 0.5), r() * 3, 0, Math.PI * 2); g.fill();
        }
    }, { repeat: [5, 5], srgb: false });
    const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), std({ map: asphaltTex, alphaMap: puddleTex, transparent: true, opacity: 0.9, roughness: 0.32, metalness: 0.0, depthWrite: false }));
    asphalt.rotation.x = -Math.PI / 2; asphalt.position.set(0, 0.004, -20); asphalt.receiveShadow = true; scene.add(asphalt);
    // ---------- l'edificio ----------
    const F = SCENE.FRONT_Z;
    const bld = new THREE.Group(); scene.add(bld);
    const add = (geo, mat, x, y, z, cast = false) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; bld.add(m); return m; };
    // basamento e gradino
    add(new THREE.BoxGeometry(16, 0.3, 12), mats.stone, 0, 0.15, F - 5.0);
    add(new THREE.BoxGeometry(4.2, 0.15, 0.6), mats.stone, 0, 0.075, SCENE.STEP_Z - 0.15);
    // parete frontale con porta e finestre a luna
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-7, 0); wallShape.lineTo(7, 0); wallShape.lineTo(7, 4.5); wallShape.lineTo(-7, 4.5); wallShape.closePath();
    const doorHole = new THREE.Path(); doorHole.moveTo(-1.1, 0.3); doorHole.lineTo(1.1, 0.3); doorHole.lineTo(1.1, 3.05); doorHole.lineTo(-1.1, 3.05); doorHole.closePath();
    wallShape.holes.push(doorHole);
    for (const sx of [-1, 1]) { const p = new THREE.Path(); p.absarc(sx * 3.3, 2.05, 0.78, 0, Math.PI * 2, true); wallShape.holes.push(p); }
    const wallGeo = new THREE.ExtrudeGeometry(wallShape, { depth: 0.3, bevelEnabled: false, curveSegments: 40 });
    const wall = add(wallGeo, mats.wall, 0, 0, F - 0.3);
    // muri laterali e retro (chiudono il volume)
    add(new THREE.BoxGeometry(0.3, 4.5, 11), mats.wall, -7, 2.25, F - 5.6);
    add(new THREE.BoxGeometry(0.3, 4.5, 11), mats.wall, 7, 2.25, F - 5.6);
    // colonne laccate con basi in pietra
    for (const x of [-6.5, -4.6, -1.65, 1.65, 4.6, 6.5]) {
        add(new THREE.CylinderGeometry(0.2, 0.22, 4.25, 20), mats.lacquer, x, 0.3 + 2.125, F + 0.45, true);
        add(new THREE.CylinderGeometry(0.3, 0.32, 0.22, 16), mats.stone, x, 0.41, F + 0.45);
        // mensole (dougong) in cima
        add(new THREE.BoxGeometry(0.62, 0.14, 0.62), mats.darkwood, x, 4.42, F + 0.45);
        add(new THREE.BoxGeometry(0.9, 0.12, 0.3), mats.lacquer, x, 4.55, F + 0.45);
        add(new THREE.BoxGeometry(0.3, 0.12, 0.9), mats.lacquer, x, 4.55, F + 0.6);
    }
    // trave dipinta sopra il portico
    const beam = add(new THREE.BoxGeometry(14.2, 0.42, 0.34), mats.beam, 0, 4.13, F + 0.45);
    beam.material = [mats.lacquer, mats.lacquer, mats.lacquer, mats.lacquer, mats.beam, mats.beam];
    // cornice della porta
    add(new THREE.BoxGeometry(0.22, 2.9, 0.42), mats.darkwood, -1.21, 1.75, F + 0.02);
    add(new THREE.BoxGeometry(0.22, 2.9, 0.42), mats.darkwood, 1.21, 1.75, F + 0.02);
    add(new THREE.BoxGeometry(2.64, 0.26, 0.44), mats.darkwood, 0, 3.15, F + 0.02);
    // insegna laccata "LA PAGODA" sopra la porta
    const plaqueTex = canvasTex(1024, 256, (g, w, h) => {
        g.fillStyle = '#16090a'; g.fillRect(0, 0, w, h);
        g.strokeStyle = '#c9a24b'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
        g.lineWidth = 3; g.strokeRect(34, 34, w - 68, h - 68);
        g.fillStyle = '#e3c66c'; g.font = '900 120px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.letterSpacing = '18px'; g.fillText('LA PAGODA', w / 2 + 9, h / 2 + 6);
    });
    const plaque = add(new THREE.BoxGeometry(2.9, 0.72, 0.12), std({ map: plaqueTex, emissiveMap: plaqueTex, emissive: new THREE.Color(0.55, 0.45, 0.25), roughness: 0.35, metalness: 0.3 }), 0, 3.72, F + 0.12);
    plaque.material = [mats.darkwood, mats.darkwood, mats.darkwood, mats.darkwood, plaque.material, mats.darkwood];

    // finestre a luna: grata luminosa + cornice
    const moonWinTex = canvasTex(256, 256, (g, w, h) => latticeDraw(g, w, h, { glow: '#ff9a52', cells: 7 }));
    const moonWinMat = std({ map: moonWinTex, emissiveMap: moonWinTex, emissive: new THREE.Color(1.1, 0.7, 0.45), roughness: 0.8 });
    for (const sx of [-1, 1]) {
        add(new THREE.CircleGeometry(0.8, 40), moonWinMat, sx * 3.3, 2.05, F - 0.18);
        add(new THREE.TorusGeometry(0.8, 0.07, 10, 48), mats.darkwood, sx * 3.3, 2.05, F + 0.01);
        add(new THREE.TorusGeometry(0.88, 0.03, 8, 48), mats.gold, sx * 3.3, 2.05, F + 0.02);
    }

    // ---------- le ante della porta (si aprono da sole) ----------
    const doorTexBase = (sil) => canvasTex(256, 384, (g, w, h) => latticeDraw(g, w, h, { glow: '#ffc27a', cells: 4, sil }));
    // silhouette con le corna (frame-dipendente): una texture per anta, così
    // la sagoma attraversa la porta da un vetro all'altro come un'unica figura
    const silDraw = (x0) => (gg, w, h) => {
        const x = x0 * w, y = h * 0.62;
        gg.save(); gg.translate(x, y); gg.fillStyle = 'rgba(18,3,2,0.94)';
        gg.beginPath(); gg.ellipse(0, 0, w * 0.2, h * 0.16, 0, 0, Math.PI * 2); gg.fill();
        gg.fillRect(-w * 0.3, h * 0.12, w * 0.6, h * 0.5);
        gg.lineWidth = w * 0.035; gg.strokeStyle = 'rgba(18,3,2,0.94)'; gg.lineCap = 'round';
        for (const sx of [-1, 1]) {
            gg.beginPath(); gg.moveTo(sx * w * 0.06, -h * 0.1); gg.quadraticCurveTo(sx * w * 0.28, -h * 0.3, sx * w * 0.22, -h * 0.55); gg.stroke();
            gg.beginPath(); gg.moveTo(sx * w * 0.2, -h * 0.26); gg.lineTo(sx * w * 0.42, -h * 0.36); gg.stroke();
            gg.beginPath(); gg.moveTo(sx * w * 0.25, -h * 0.42); gg.lineTo(sx * w * 0.4, -h * 0.55); gg.stroke();
        }
        gg.restore();
    };
    const doorMats = [-1, 1].map((side) => {
        const c = document.createElement('canvas'); c.width = 256; c.height = 384;
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
        const mat = std({ map: tex, emissiveMap: tex, emissive: new THREE.Color(1, 0.75, 0.5), roughness: 0.7 });
        let last = 'init';
        const draw = (k) => {
            // k in [0,1]: posizione della figura lungo la larghezza delle due ante
            const x0 = k === null ? null : (side < 0 ? lerp(-0.5, 2.6, k) : lerp(-1.9, 1.2, k));
            const key = x0 === null ? 'none' : x0.toFixed(3);
            if (key === last) return; last = key;
            latticeDraw(c.getContext('2d'), 256, 384, { glow: '#ffc27a', cells: 4, sil: x0 === null ? null : silDraw(x0) });
            tex.needsUpdate = true;
        };
        draw(null);
        return { mat, draw };
    });
    const drawSil = (k) => doorMats.forEach(d => d.draw(k));
    const studs = new THREE.SphereGeometry(0.028, 8, 6);
    const makeLeaf = (side) => {
        const pivot = new THREE.Group(); pivot.position.set(side * 1.1, 0.3, F - 0.1); bld.add(pivot);
        const leaf = new THREE.Group(); leaf.position.x = -side * 0.55; pivot.add(leaf);
        const slab = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.75, 0.08), mats.lacquer); slab.position.y = 1.375; slab.castShadow = true; leaf.add(slab);
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.05), doorMats[side < 0 ? 0 : 1].mat); panel.position.set(0, 2.05, 0.045); leaf.add(panel);
        const panelB = new THREE.Mesh(panel.geometry, mats.darkwood); panelB.rotation.y = Math.PI; panelB.position.set(0, 2.05, -0.045); leaf.add(panelB);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24), mats.gold); ring.position.set(-side * 0.42, 1.35, 0.06); leaf.add(ring);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
            const st = new THREE.Mesh(studs, mats.gold); st.position.set(-0.3 + i * 0.2, 0.25 + j * 0.2, 0.05); leaf.add(st);
        }
        return pivot;
    };
    const leafL = makeLeaf(-1), leafR = makeLeaf(1);

    // ---------- interno: corridoio liminale ----------
    const corr = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.0, 16), mats.corridor);
    corr.position.set(0, 1.8, F - 8.3); scene.add(corr);
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 16), mats.carpet);
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.31, F - 8.3); scene.add(carpet);
    for (let k = 1; k <= 5; k++) {
        const z = F - 0.4 - k * 2.8;
        for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3, 0.16), mats.darkwood); p.position.set(sx * 1.2, 1.8, z); scene.add(p); }
        const l = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 0.16), mats.darkwood); l.position.set(0, 3.1, z); scene.add(l);
        const lan = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.3, 0.1) }));
        lan.scale.y = 1.3; lan.position.set(0, 2.75, z + 1.4); scene.add(lan);
    }
    const inLights = [];
    for (const [z, c, i] of [[F - 3.0, 0xffa060, 7], [F - 7.5, 0xff4a2a, 6], [F - 12.5, 0xff3020, 5]]) {
        const pl = new THREE.PointLight(c, i, 7.5, 2); pl.position.set(0, 2.5, z); scene.add(pl); inLights.push([pl, i]);
    }
    // fondo del corridoio: bagliore rosso, il Maître vi si staglia contro
    const endTex = canvasTex(256, 256, (g, w, h) => {
        const gr = g.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.6);
        gr.addColorStop(0, '#ff6a3a'); gr.addColorStop(0.5, '#9a1a0c'); gr.addColorStop(1, '#2a0504');
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const endWall = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.0), new THREE.MeshBasicMaterial({ map: endTex, color: new THREE.Color(1.2, 1.2, 1.2) }));
    endWall.position.set(0, 1.8, F - 16.2); scene.add(endWall);
    const maitre = buildMaitre(mats);
    maitre.root.position.set(0.15, 0.3, F - 13.5); scene.add(maitre.root);

    // ---------- piani superiori e tetti ----------
    add(new THREE.BoxGeometry(10.5, 3.3, 8), std({ map: (() => {
        const t = canvasTex(1024, 320, (g, w, h) => {
            g.fillStyle = '#2a0b09'; g.fillRect(0, 0, w, h);
            for (let i = 0; i < 6; i++) {
                const x = 40 + i * 165;
                const lit = i === 2 || i === 5;
                const gr = g.createLinearGradient(0, 80, 0, 260);
                gr.addColorStop(0, lit ? '#ffb070' : '#3a1208'); gr.addColorStop(1, lit ? '#c0501f' : '#1a0604');
                g.fillStyle = gr; g.fillRect(x, 80, 120, 180);
                g.strokeStyle = '#120403'; g.lineWidth = 6;
                for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(x + k * 30, 80); g.lineTo(x + k * 30, 260); g.stroke(); }
                for (let k = 0; k <= 6; k++) { g.beginPath(); g.moveTo(x, 80 + k * 30); g.lineTo(x + 120, 80 + k * 30); g.stroke(); }
                g.fillStyle = '#6a120e'; g.fillRect(x - 22, 40, 12, 260);
            }
            g.fillStyle = '#c9a24b'; g.fillRect(0, 26, w, 6);
        });
        return t;
    })(), emissive: new THREE.Color(0.7, 0.45, 0.3), roughness: 0.8 }), 0, 4.85 + 1.65, F - 6 + 0.5);
    // l'emissive usa la stessa mappa dei colori del piano superiore
    bld.children[bld.children.length - 1].material.emissiveMap = bld.children[bld.children.length - 1].material.map;

    const roofA = pagodaRoof({ w: 17.6, d: 15.4, eaveY: 4.72, topW: 10.5, topD: 8, topY: 5.75, lift: 0.9 }, mats);
    roofA.position.set(0, 0, F - 6 + 0.5); bld.add(roofA);
    const roofB = pagodaRoof({ w: 13.4, d: 11.2, eaveY: 8.0, topW: 7.4, topD: 5.6, topY: 8.95, lift: 0.75 }, mats);
    roofB.position.set(0, 0, F - 6 + 0.5); bld.add(roofB);
    add(new THREE.BoxGeometry(7.4, 2.8, 5.6), std({ map: (() => canvasTex(512, 256, (g, w, h) => {
        g.fillStyle = '#2a0b09'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 3; i++) {
            const x = 50 + i * 150, lit = i === 1;
            g.fillStyle = lit ? '#e07a3a' : '#2a0e07'; g.fillRect(x, 70, 110, 140);
            g.strokeStyle = '#120403'; g.lineWidth = 5;
            for (let k = 0; k <= 3; k++) { g.beginPath(); g.moveTo(x + k * 37, 70); g.lineTo(x + k * 37, 210); g.stroke(); }
            for (let k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(x, 70 + k * 35); g.lineTo(x + 110, 70 + k * 35); g.stroke(); }
        }
        g.fillStyle = '#c9a24b'; g.fillRect(0, 20, w, 5);
    }))(), roughness: 0.8 }), 0, 8.9 + 1.4, F - 6 + 0.5);
    {
        const m = bld.children[bld.children.length - 1].material;
        m.emissiveMap = m.map; m.emissive = new THREE.Color(0.6, 0.38, 0.25);
    }
    const roofC = pagodaRoof({ w: 10.2, d: 8.4, eaveY: 11.45, topW: 0.5, topD: 0.4, topY: 13.9, lift: 0.7 }, mats);
    roofC.position.set(0, 0, F - 6 + 0.5); bld.add(roofC);
    // pinnacolo
    const fin = new THREE.Group(); fin.position.set(0, 13.8, F - 5.5); bld.add(fin);
    [[0.25, 0.3, 0.3], [0.18, 0.22, 0.75], [0.13, 0.15, 1.1], [0.1, 0.12, 1.4]].forEach(([r, h, y]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mats.gold); m.position.y = y; m.scale.y = h / r; fin.add(m);
    });
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.06, 1.4, 10), mats.gold); spire.position.y = 2.1; fin.add(spire);

    // lanterne rosse appese all'aggetto
    const lanterns = [];
    const lanternMat = (k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5 * k, 0.16 * k, 0.05 * k) });
    for (const [x, y, z, sw] of [[-2.75, 3.25, F + 0.95, 0], [2.75, 3.25, F + 0.95, 1.7], [-8.4, 3.8, F + 2.2, 0.6], [8.4, 3.8, F + 2.2, 2.4]]) {
        const pivot = new THREE.Group(); pivot.position.set(x, y + 1.2, z); bld.add(pivot);
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7), mats.darkwood); cord.position.y = -0.35; pivot.add(cord);
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), lanternMat(1)); body.scale.y = 1.15; body.position.y = -1.05; pivot.add(body);
        for (const dy of [-0.7, -1.4]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16), mats.gold); cap.position.y = dy; pivot.add(cap); }
        const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.35, 8), lanternMat(0.6)); tassel.position.y = -1.6; pivot.add(tassel);
        const light = new THREE.PointLight(0xff5a28, 7, 9, 2); light.position.y = -1.05; pivot.add(light);
        lanterns.push({ pivot, sw, body, light });
    }

    // insegna al neon verticale "RISTORANTE"
    const neonCanvas = document.createElement('canvas'); neonCanvas.width = 160; neonCanvas.height = 1280;
    const neonTex = new THREE.CanvasTexture(neonCanvas); neonTex.colorSpace = THREE.SRGBColorSpace;
    {
        const g = neonCanvas.getContext('2d'), w = 160, h = 1280;
        g.fillStyle = '#0a0506'; g.fillRect(0, 0, w, h);
        g.strokeStyle = '#ffb347'; g.lineWidth = 6; g.shadowColor = '#ff9a2a'; g.shadowBlur = 18; g.strokeRect(12, 12, w - 24, h - 24);
        g.font = '900 100px Montserrat'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.shadowColor = '#ff2a2a'; g.shadowBlur = 28; g.fillStyle = '#ff5050';
        'RISTORANTE'.split('').forEach((c, i) => g.fillText(c, w / 2, 90 + i * 115));
        g.shadowBlur = 0; g.fillStyle = '#ffd6d0';
        g.font = '900 92px Montserrat';
        'RISTORANTE'.split('').forEach((c, i) => g.fillText(c, w / 2, 90 + i * 115));
        neonTex.needsUpdate = true;
    }
    const neonMat = new THREE.MeshBasicMaterial({ map: neonTex, color: new THREE.Color(2.2, 2.2, 2.2) });
    const neon = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.36, 0.1), [mats.darkwood, mats.darkwood, mats.darkwood, mats.darkwood, neonMat, mats.darkwood]);
    neon.position.set(5.55, 2.35, F + 0.85); bld.add(neon);
    const brk = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), mats.darkwood); brk.position.set(5.55, 4.0, F + 0.65); bld.add(brk);
    const neonLight = new THREE.PointLight(0xff2a2a, 14, 14, 2); neonLight.position.set(5.2, 2.4, F + 1.6); scene.add(neonLight);

    // ---------- contesto urbano ----------
    const sideBldTex = (seed) => canvasTex(512, 1024, (g, w, h) => {
        g.fillStyle = '#121216'; g.fillRect(0, 0, w, h);
        const r = rng(seed);
        for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(0,0,0,${0.1 + r() * 0.2})`; g.fillRect(r() * w, r() * h, 3 + r() * 20, 2 + r() * 4); }
        for (let y = 30; y < h - 40; y += 64) {
            g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(0, y + 44, w, 6);
            for (let x = 22; x < w - 40; x += 56) {
                const on = r() < 0.09;
                const c = r() < 0.6 ? ['#a8652a', '#5a2a10'] : ['#5f7590', '#1d2633'];
                const gr = g.createLinearGradient(0, y, 0, y + 36);
                gr.addColorStop(0, on ? c[0] : '#0b0c0f'); gr.addColorStop(1, on ? c[1] : '#060608');
                g.fillStyle = gr; g.fillRect(x, y, 22, 36);
                g.fillStyle = '#050506'; g.fillRect(x + 10, y, 2, 36);
            }
        }
    });
    for (const [x, z, wdt, hgt, seed] of [[-15.5, -12, 12, 26, 21], [15.5, -12, 12, 22, 22], [-14, 0, 9, 18, 23], [14.5, 1, 10, 30, 24]]) {
        const t = sideBldTex(seed);
        const m = std({ map: t, emissiveMap: t, emissive: new THREE.Color(0.55, 0.55, 0.55), roughness: 0.9 });
        const b = new THREE.Mesh(new THREE.BoxGeometry(wdt, hgt, 10), m); b.position.set(x, hgt / 2, z); scene.add(b);
    }
    // lampione
    const lampGroup = new THREE.Group(); lampGroup.position.set(-5.2, 0, -4.2); scene.add(lampGroup);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 5.2, 12), mats.ridge); post.position.y = 2.6; lampGroup.add(post);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), mats.ridge); arm.rotation.z = Math.PI / 2; arm.position.set(0.4, 5.1, 0); lampGroup.add(arm);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.3, 14, 1, true), mats.ridge); head.position.set(0.8, 4.95, 0); lampGroup.add(head);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 2.6, 1.3) })); bulb.position.set(0.8, 4.84, 0); lampGroup.add(bulb);
    const lampLight = new THREE.PointLight(0xffaa66, 22, 16, 2); lampLight.position.set(0.8, 4.7, 0); lampGroup.add(lampLight);

    // ---------- luci globali ----------
    scene.add(new THREE.HemisphereLight(0x223355, 0x080606, 0.55));
    const moonLight = new THREE.DirectionalLight(0x9ab0e0, 0.55); moonLight.position.set(-20, 40, -50); scene.add(moonLight);
    const fill = new THREE.DirectionalLight(0x40507a, 0.35); fill.position.set(6, 4, 14); scene.add(fill);
    // la luce che esce dalla porta: proietta l'ombra di Stefano verso di noi
    const doorSpot = new THREE.SpotLight(0xffb070, 0, 30, 0.62, 0.75, 1.3);
    doorSpot.position.set(0, 2.75, F - 0.55); doorSpot.target.position.set(0, 0, 2); scene.add(doorSpot, doorSpot.target);
    doorSpot.castShadow = true; doorSpot.shadow.mapSize.set(1024, 1024); doorSpot.shadow.bias = -0.0015; doorSpot.shadow.camera.near = 0.5;

    // ---------- personaggio ----------
    const stefano = buildStefano(mats);
    scene.add(stefano.root);

    // ---------- pioggia ----------
    const RAIN = 4200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(RAIN * 6);
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainSeed = [];
    for (let i = 0; i < RAIN; i++) rainSeed.push([R() * 22 - 11, R() * 18, -R() * 16 + 2.0, 9 + R() * 4, 0.25 + R() * 0.35]);
    const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0x9fb2cc, transparent: true, opacity: 0.22, fog: true }));
    rain.frustumCulled = false; scene.add(rain);
    // gocce che cadono dall'aggetto (rivoli)
    // increspature sulle pozzanghere
    const ripples = [];
    const ringGeo = new THREE.RingGeometry(0.95, 1.0, 40);
    for (let i = 0; i < 70; i++) {
        const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xb8c6dc, transparent: true, depthWrite: false }));
        m.rotation.x = -Math.PI / 2;
        ripples.push({ m, x: R() * 9 - 4.5, z: -0.5 - R() * 8.5, per: 0.7 + R() * 0.8, ph: R() });
        scene.add(m);
    }
    const stepRings = [];
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xc8d6ec, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; scene.add(m); stepRings.push(m); }
    const steps = footstepTimes();

    // ---------- post-processing ----------
    const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, rt);
    composer.setSize(W, H);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.75, 0.55, 0.85);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ---------- camera ----------
    function cameraAt(s) {
        // carrello basso che insegue Stefano, poi rallenta davanti alla porta
        const tau = 1.2;
        const v = 0.68;
        const z = s <= 4.6 ? 0.6 - v * s : 0.6 - v * 4.6 - v * tau * (1 - Math.exp(-(s - 4.6) / tau));
        camera.position.set(
            lerp(0.42, 0.04, smooth(0, 6, s)) + 0.012 * Math.sin(s * 1.7) + 0.006 * Math.sin(s * 4.3),
            lerp(0.2, 0.3, smooth(0, 9, s)) + 0.008 * Math.sin(s * 2.3 + 1),
            z,
        );
        camera.rotation.order = 'YXZ';
        camera.rotation.y = 0.04 * Math.sin(s * 0.7) - 0.02 + 0.006 * Math.sin(s * 3.1);
        camera.rotation.x = lerp(0.26, 0.5, smooth(0.0, 8.6, s)) + 0.004 * Math.sin(s * 2.9);
        camera.rotation.z = -0.035 + 0.01 * Math.sin(s * 0.5); // leggera inquadratura olandese
        camera.fov = lerp(72, 66, smooth(0, 9, s));
        camera.updateProjectionMatrix();
    }

    function update(s, t) {
        cameraAt(s);
        const st = charState(s);
        stefano.root.position.set(st.x, st.y, st.z);
        stefano.pose(st, s);
        const open = doorOpenAmount(s);
        leafL.rotation.y = open * 1.5;
        leafR.rotation.y = -open * 1.5;
        doorSpot.intensity = 90 * open;
        doorSpot.castShadow = open > 0.02;
        for (const [pl, i] of inLights) pl.intensity = i * (0.25 + 0.75 * open);
        // pannelli della porta: luce interna + sagoma che passa dopo lo sbattere
        const sp = (s - SCENE.SHADOW_PASS[0]) / (SCENE.SHADOW_PASS[1] - SCENE.SHADOW_PASS[0]);
        drawSil(sp > 0 && sp < 1 ? sp : null);
        const slam = s > SCENE.DOOR_CLOSE[1] ? Math.exp(-(s - SCENE.DOOR_CLOSE[1]) * 6) : 0;
        doorMats.forEach(d => { d.mat.emissiveIntensity = 0.75 + 0.25 * open + 0.9 * slam; });
        // il Maître inclina la testa mentre lo guardiamo
        maitre.head.rotation.z = 0.32 * smooth(5.6, 6.3, s);
        maitre.root.visible = s < SCENE.DOOR_CLOSE[1] + 0.2;
        // neon
        const n = neonAt(s);
        neonMat.color.setScalar(0.25 + 2.2 * n);
        neonLight.intensity = 14 * n;
        // lanterne che oscillano nel vento
        for (const l of lanterns) {
            l.pivot.rotation.z = 0.06 * Math.sin(s * 1.6 + l.sw);
            l.pivot.rotation.x = 0.04 * Math.sin(s * 1.1 + l.sw * 2);
        }
        const fl = s > 7.5 && s < 7.62 ? 0.3 : 1; // anche le lanterne tremano allo sbattere
        lanterns.forEach(l => { l.light.intensity = 7 * fl; });
        // nuvole e luna
        cloudTex.offset.x = (t * 0.004) % 1;
        // pioggia
        for (let i = 0; i < RAIN; i++) {
            const [x, y0, z, v, len] = rainSeed[i];
            let y = (y0 - v * t) % 18; if (y < 0) y += 18;
            const dx = 0.045 * len;
            rainPos[i * 6] = x; rainPos[i * 6 + 1] = y; rainPos[i * 6 + 2] = z;
            rainPos[i * 6 + 3] = x - dx; rainPos[i * 6 + 4] = y - len; rainPos[i * 6 + 5] = z;
        }
        rainGeo.attributes.position.needsUpdate = true;
        for (const r of ripples) {
            const f = ((t / r.per + r.ph) % 1);
            r.m.position.set(r.x + Math.floor(t / r.per + r.ph) * 0.37 % 1.5, 0.008, r.z);
            r.m.scale.setScalar(0.02 + 0.2 * f);
            r.m.material.opacity = 0.32 * (1 - f) * (1 - f);
        }
        // anelli d'acqua sotto i passi
        stepRings.forEach(m => { m.visible = false; });
        let k = 0;
        for (const fs of steps) {
            const age = s - fs.s;
            if (age < 0 || age > 0.9 || fs.surface !== 'wet' || k >= stepRings.length) continue;
            const p = charState(fs.s);
            const m = stepRings[k++];
            const side = Math.round(fs.s * 2) % 2 ? 1 : -1;
            m.visible = true; m.position.set(p.x + side * 0.1, 0.009, p.z - 0.1);
            m.scale.setScalar(0.08 + age * 0.7);
            m.material.opacity = 0.7 * (1 - age / 0.9);
        }
    }

    return {
        render(s, t) { update(s, t); composer.render(); },
        camera, scene,
    };
}
