// =====================================================================
//  KRIPIX ENTERTAINMENT — SHOWREEL
//  Ogni fotogramma è una funzione pura del tempo: renderAt(t).
//  Così lo stesso codice serve sia la riproduzione dal vivo nel browser
//  sia il rendering fotogramma per fotogramma in MP4 (tools/render.mjs).
// =====================================================================
import * as THREE from 'three';
import { createPagoda, footstepTimes, SCENE, rng } from './pagoda3d.js';

export const W = 1920, H = 1080;
export const DURATION = 33.5;
export const BPM = 120;

// Sezioni (secondi). Le transizioni cadono sui battiti (120 BPM = 0.5s).
export const T = {
    BOOT: 0, LOGO: 3.0, STUDIO: 7.0, GAMES: 11.0, PAGODA: 13.0,
    LAUNCHER: 22.0, ECO: 26.0, END: 29.0,
};
export const SITE_URL = 'kripixent.netlify.app';

// Palette del sito (style.css)
const C = {
    bg: '#05070a', deep: '#020202', ivory: '#e8e6d9', muted: '#888888',
    gold: '#e3c66c', red: '#8b2323', redHi: '#c43a3a', line: '#222222',
};

// ---------- matematica ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
    outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
    inExpo: (k) => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10)),
    outCubic: (k) => 1 - Math.pow(1 - k, 3),
    inCubic: (k) => k * k * k,
    inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    outBack: (k) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
    smooth: (k) => k * k * (3 - 2 * k),
};
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- testi digitati (condivisi con la colonna sonora) ----------
const TYPE = {
    boot1: { text: '> KRIPIX NETWORK // NODO OPERATIVO v2.0.4', t: 0.22, cps: 64 },
    boot2: { text: '> handshake crittografato ......... [OK]', t: 0.98, cps: 64 },
    boot3: { text: '> intercettazione segnale', t: 1.72, cps: 52 },
    tagline: { text: 'A different way to see pixels.', t: 5.05, cps: 36 },
    pagodaTag: { text: 'LIMINAL SURVIVAL HORROR', t: T.PAGODA + 1.95, cps: 38 },
    pagodaCap: { text: 'La luce è la tua unica arma.', t: T.PAGODA + 7.72, cps: 46 },
    endTag: { text: 'A different way to see pixels.', t: T.END + 0.95, cps: 36 },
};
const typed = (k, t) => { const s = TYPE[k]; return s.text.slice(0, clamp(Math.floor((t - s.t) * s.cps), 0, s.text.length)); };
const typingDone = (k) => TYPE[k].t + TYPE[k].text.length / TYPE[k].cps;

const PILLARS = [
    ['01', 'ATMOSFERA', 'È REGINA.', 'Ogni ombra, ogni suono costruisce un mondo credibile.'],
    ['02', 'GAMEPLAY', 'HA UN SENSO.', 'Ogni azione del giocatore ha conseguenze tangibili.'],
    ['03', 'NARRAZIONE', 'INTERATTIVA.', 'Non raccontiamo una storia: ti diamo gli strumenti per scoprirla.'],
    ['04', 'QUALITÀ', 'SULLA QUANTITÀ.', '10 ore indimenticabili, non 100 ore ripetitive.'],
];
const ECO = [
    { icon: 'cube', title: 'PIXEL OTROS', body: ['Il nostro motore proprietario:', 'streaming SSD e Nanovoxel.'], tag: '> ENGINE' },
    { icon: 'ai', title: 'KRIPIX AI', body: ['L’assistente intelligente', 'integrato nel portale.'], tag: '> ASSISTENTE · BETA' },
    { icon: 'net', title: 'NETWORK AGENTI', body: ['Chat live, dossier personale', 'e server Discord ufficiale.'], tag: '> COMMUNITY' },
    { icon: 'key', title: 'KRIPIX STORE', body: ['Chiavi Kripix, Deluxe Edition', 'e zero DRM.'], tag: '> STORE' },
];
const SECTIONS = [
    [T.BOOT, '00 — SEGNALE'], [T.LOGO, '01 — KRIPIX'], [T.STUDIO, '02 — STUDIO'], [T.GAMES, '03 — GIOCHI'],
    [T.PAGODA, '04 — LA PAGODA'], [T.LAUNCHER, '05 — LAUNCHER'], [T.ECO, '06 — ECOSISTEMA'], [T.END, '07 — KRIPIX'],
];

// =====================================================================
export async function createReel(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;

    // ---------- WebGL condiviso (Pagoda + finestra del launcher) ----------
    const glCanvas = document.createElement('canvas');
    glCanvas.width = W; glCanvas.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1); renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const pagoda = createPagoda(renderer, W, H);

    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
    const [tmp, tctx] = mk(W, H);
    const [tmp2, t2ctx] = mk(W, H);

    // istantanee della Pagoda per il poster e per il banner del launcher
    const snap = (s) => {
        renderer.setClearColor(0x000000, 1);
        pagoda.render(s, T.PAGODA + s);
        const [c, g] = mk(W, H); g.drawImage(glCanvas, 0, 0); return c;
    };
    const posterImg = snap(0.35);
    const bannerImg = snap(5.55);

    // ---------- risorse pre-calcolate ----------
    const grid = (() => {
        const [c, g] = mk(W + 400, H + 400);
        g.strokeStyle = 'rgba(255,255,255,0.055)'; g.lineWidth = 1;
        for (let x = 0; x <= c.width; x += 50) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, c.height); g.stroke(); }
        for (let y = 0; y <= c.height; y += 50) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(c.width, y + 0.5); g.stroke(); }
        g.globalCompositeOperation = 'destination-in';
        const r = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width * 0.5);
        r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(0.4, 'rgba(0,0,0,1)'); r.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = r; g.fillRect(0, 0, c.width, c.height);
        return c;
    })();
    const grains = Array.from({ length: 8 }, (_, i) => {
        const [c, g] = mk(W / 2, H / 2);
        const img = g.createImageData(c.width, c.height); const R = rng(100 + i);
        for (let p = 0; p < img.data.length; p += 4) { const v = R() * 255; img.data[p] = img.data[p + 1] = img.data[p + 2] = v; img.data[p + 3] = 255; }
        g.putImageData(img, 0, 0); return c;
    });
    const vignette = (() => {
        const [c, g] = mk(W, H);
        const r = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.68);
        r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,0.78)');
        g.fillStyle = r; g.fillRect(0, 0, W, H); return c;
    })();
    const noiseTex = (() => {
        const [c, g] = mk(400, 440); const R = rng(77);
        g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, 400, 440);
        for (let i = 0; i < 9000; i++) { const v = Math.floor(R() * 50); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(R() * 400, R() * 440, 2, 2); }
        return c;
    })();

    // ---------- helper di disegno ----------
    const font = (w, px, fam = 'Montserrat') => `${w} ${px}px "${fam}"`;
    function text(str, x, y, o = {}) {
        ctx.save();
        ctx.font = o.font || font(o.weight || 900, o.size || 40, o.family);
        ctx.letterSpacing = `${o.spacing || 0}px`;
        ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.baseline || 'alphabetic';
        ctx.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha);
        let dx = 0;
        if ((o.align === 'center') && o.spacing) dx = o.spacing / 2; // compensa lo spazio finale
        if ((o.align === 'right') && o.spacing) dx = o.spacing;
        if (o.glow) { ctx.shadowColor = o.glowColor || o.color; ctx.shadowBlur = o.glow; }
        if (o.stroke) { ctx.lineWidth = o.lineWidth || 2; ctx.strokeStyle = o.stroke; ctx.strokeText(str, x + dx, y); }
        if (o.color) { ctx.fillStyle = o.color; ctx.fillText(str, x + dx, y); }
        ctx.restore();
    }
    function measure(str, o = {}) {
        ctx.save(); ctx.font = o.font || font(o.weight || 900, o.size || 40, o.family); ctx.letterSpacing = `${o.spacing || 0}px`;
        const w = ctx.measureText(str).width - (o.spacing || 0); ctx.restore(); return w;
    }
    function drawGrid(alpha, zoom = 1, oy = 0) {
        if (alpha <= 0) return;
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.translate(W / 2, H / 2 + oy); ctx.scale(zoom, zoom);
        ctx.drawImage(grid, -grid.width / 2, -grid.height / 2); ctx.restore();
    }
    function bg(color = C.bg) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }
    function glow(x, y, r, color, a) {
        if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }
    function cursor(x, y, h, t, color = C.gold) {
        if (Math.floor(t * 4) % 2 === 0) { ctx.fillStyle = color; ctx.fillRect(x + 4, y - h * 0.8, h * 0.5, h * 0.95); }
    }
    // testo che sale dentro una maschera (reveal tipografico)
    function reveal(str, x, y, k, o) {
        const size = o.size || 100;
        ctx.save();
        ctx.beginPath(); ctx.rect(-50, y - size * 1.0, W + 100, size * 1.22); ctx.clip();
        text(str, x, y + (1 - E.outExpo(k)) * size * 1.1, o);
        ctx.restore();
    }
    // glitch: fette spostate + aberrazione cromatica
    function glitch(amount, seed) {
        if (amount <= 0) return;
        tctx.globalCompositeOperation = 'copy'; tctx.drawImage(canvas, 0, 0); tctx.globalCompositeOperation = 'source-over';
        const shift = Math.round(4 + 26 * amount);
        // canali separati: R spostato a sinistra, GB a destra
        t2ctx.globalCompositeOperation = 'copy'; t2ctx.drawImage(tmp, 0, 0);
        t2ctx.globalCompositeOperation = 'multiply'; t2ctx.fillStyle = '#ff0000'; t2ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.globalCompositeOperation = 'copy'; ctx.drawImage(tmp, 0, 0);
        ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#00ffff'; ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(tmp2, -shift, 0);
        ctx.restore();
        const n = Math.floor(3 + amount * 14);
        for (let i = 0; i < n; i++) {
            const y = Math.floor(hash(seed * 13.1 + i * 7.7) * H);
            const h = Math.floor(4 + hash(seed * 3.3 + i) * 70 * amount);
            const dx = Math.floor((hash(seed * 9.1 + i * 1.3) - 0.5) * 220 * amount);
            ctx.drawImage(tmp, 0, y, W, h, dx, y, W, h);
        }
        if (amount > 0.5) {
            ctx.save(); ctx.globalAlpha = (amount - 0.5) * 0.5; ctx.fillStyle = hash(seed) > 0.5 ? C.gold : '#ffffff';
            ctx.fillRect(0, Math.floor(hash(seed * 5.5) * H), W, 2 + Math.floor(hash(seed * 2.2) * 6)); ctx.restore();
        }
    }
    function flash(a, color = '255,250,240') {
        if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = `rgb(${color})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    // schermo che si spegne come un vecchio CRT (apertura e chiusura del reel)
    function crtSquash(sx, sy, bright) {
        tctx.globalCompositeOperation = 'copy'; tctx.drawImage(canvas, 0, 0); tctx.globalCompositeOperation = 'source-over';
        bg('#000');
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(Math.max(sx, 0.001), Math.max(sy, 0.002));
        ctx.drawImage(tmp, -W / 2, -H / 2);
        if (bright > 0) { ctx.globalAlpha = bright; ctx.fillStyle = '#fff6dc'; ctx.fillRect(-W / 2, -H / 2, W, H); }
        ctx.restore();
    }
    function goldDot(a, r = 4) {
        glow(W / 2, H / 2, 120 * r / 4, 'rgba(227,198,108,0.9)', a * 0.6);
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff3c8'; ctx.fillRect(W / 2 - r, H / 2 - r, r * 2, r * 2); ctx.restore();
    }

    // ---------- il logo fatto di pixel ----------
    const LOGO = { y: 545, size: 236, spacing: 8 };
    const logoMetrics = (() => {
        const wK = measure('KRIPIX', { size: LOGO.size, spacing: LOGO.spacing });
        const w0 = measure('ENTERTAINMENT', { weight: 300, size: 50, spacing: 0 });
        return { wK, entSpacing: (wK - w0) / 12 };
    })();
    const logoPixels = (() => {
        const [c, g] = mk(W, H);
        g.font = font(900, LOGO.size); g.letterSpacing = `${LOGO.spacing}px`; g.textAlign = 'center'; g.fillStyle = '#fff';
        g.fillText('KRIPIX', W / 2 + LOGO.spacing / 2, LOGO.y);
        const d = g.getImageData(0, 0, W, H).data; const cell = 10; const pts = [];
        let minX = W, maxX = 0;
        for (let y = 0; y < H; y += cell) for (let x = 0; x < W; x += cell) {
            if (d[((y + cell / 2) * W + x + cell / 2) * 4 + 3] > 120) { pts.push({ x, y }); minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
        }
        const R = rng(42);
        return pts.map((p) => {
            const a = R() * Math.PI * 2, r = 160 + Math.pow(R(), 0.7) * 820;
            const col = R(); const delay = 0.32 * (p.x - minX) / (maxX - minX) + 0.08 * R();
            return {
                tx: p.x, ty: p.y, sx: W / 2 + Math.cos(a) * r * 1.25, sy: H / 2 + Math.sin(a) * r * 0.55,
                size: 4 + R() * 7, color: col < 0.62 ? C.ivory : col < 0.9 ? C.gold : C.redHi, delay, spin: (R() - 0.5) * 6,
            };
        });
    })();
    const PIX_SCATTER = 0.45, PIX_FLY = 0.6;
    function logoParticles(l, alpha = 1) {
        ctx.save();
        for (const p of logoPixels) {
            let x, y, sz = p.size, col = p.color;
            if (l < PIX_SCATTER) {
                const k = E.outExpo(l / PIX_SCATTER);
                x = lerp(W / 2, p.sx, k); y = lerp(H / 2, p.sy, k);
            } else {
                const k = E.inOutCubic(prog(l, PIX_SCATTER + p.delay, PIX_SCATTER + p.delay + PIX_FLY));
                const drift = (1 - k) * 18;
                x = lerp(p.sx, p.tx, k) + Math.sin(l * 3 + p.spin) * drift; y = lerp(p.sy, p.ty, k) + Math.cos(l * 2.6 + p.spin) * drift;
                sz = lerp(p.size, 9.2, k); if (k >= 1) col = C.ivory;
            }
            ctx.globalAlpha = alpha; ctx.fillStyle = col;
            ctx.fillRect(x - sz / 2 + 5, y - sz / 2 + 5, sz, sz);
        }
        ctx.restore();
    }
    function logoText(o) {
        const a = o.alpha === undefined ? 1 : o.alpha;
        text('KRIPIX', W / 2, LOGO.y + (o.dy || 0), { size: LOGO.size, spacing: LOGO.spacing, align: 'center', color: o.kColor || C.ivory, alpha: a, glow: o.glow, glowColor: o.glowColor });
        if (o.entK !== undefined) {
            const sp = lerp(logoMetrics.entSpacing + 34, logoMetrics.entSpacing, E.outExpo(o.entK));
            text('ENTERTAINMENT', W / 2, LOGO.y + 78 + (o.dy || 0), { weight: 300, size: 50, spacing: sp, align: 'center', color: '#a83030', alpha: a * clamp(o.entK * 1.6) });
        }
    }
    function glint(k, y0, y1) {
        if (k <= 0 || k >= 1) return;
        // banda di luce che attraversa il logo (solo sopra il testo)
        tctx.globalCompositeOperation = 'copy'; tctx.clearRect(0, 0, W, H);
        tctx.globalCompositeOperation = 'source-over';
        tctx.font = font(900, LOGO.size); tctx.letterSpacing = `${LOGO.spacing}px`; tctx.textAlign = 'center'; tctx.fillStyle = '#fff';
        tctx.fillText('KRIPIX', W / 2 + LOGO.spacing / 2, LOGO.y);
        tctx.globalCompositeOperation = 'source-in';
        const x = lerp(300, 1620, E.inOutCubic(k));
        const g = tctx.createLinearGradient(x - 180, y0, x + 180, y1);
        g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, 'rgba(255,245,215,0.95)'); g.addColorStop(1, 'rgba(255,240,200,0)');
        tctx.fillStyle = g; tctx.fillRect(0, 0, W, H);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(tmp, 0, 0); ctx.restore();
    }

    // ---------- icone line-art ----------
    function icon(kind, x, y, s, k) {
        ctx.save();
        ctx.beginPath(); ctx.rect(x - 4, y - 4, (s + 8) * clamp(k), s + 8); ctx.clip();
        ctx.translate(x, y); ctx.scale(s / 64, s / 64);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        const P = (pts, close) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); if (close) ctx.closePath(); ctx.stroke(); };
        if (kind === 'cube') {
            P([[32, 4], [58, 18], [58, 46], [32, 60], [6, 46], [6, 18]], true);
            P([[6, 18], [32, 32], [58, 18]]); P([[32, 32], [32, 60]]);
            P([[19, 11], [45, 25]]); P([[19, 25], [19, 53]]); P([[45, 39], [45, 53]]);
        } else if (kind === 'ai') {
            P([[8, 10], [56, 10], [56, 42], [30, 42], [18, 54], [18, 42], [8, 42]], true);
            P([[32, 16], [35, 23], [42, 26], [35, 29], [32, 36], [29, 29], [22, 26], [29, 23]], true);
        } else if (kind === 'net') {
            const n = [[32, 12], [12, 48], [52, 48], [32, 34]];
            P([n[0], n[3]]); P([n[1], n[3]]); P([n[2], n[3]]); P([n[0], n[1]]); P([n[0], n[2]]);
            n.forEach(([a, b]) => { ctx.beginPath(); ctx.arc(a, b, 6, 0, Math.PI * 2); ctx.fillStyle = C.bg; ctx.fill(); ctx.stroke(); });
        } else if (kind === 'key') {
            ctx.beginPath(); ctx.arc(20, 32, 12, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(20, 32, 4, 0, Math.PI * 2); ctx.stroke();
            P([[32, 32], [58, 32]]); P([[50, 32], [50, 42]]); P([[42, 32], [42, 40]]);
        } else if (kind === 'library') {
            P([[6, 10], [24, 10], [24, 54], [6, 54]], true); P([[30, 10], [44, 10], [44, 54], [30, 54]], true); P([[48, 14], [58, 12], [62, 52], [52, 54]], true);
        } else if (kind === 'store') {
            P([[8, 20], [56, 20], [52, 56], [12, 56]], true); P([[22, 20], [22, 12], [42, 12], [42, 20]]);
        } else if (kind === 'gear') {
            ctx.beginPath(); ctx.arc(32, 32, 12, 0, Math.PI * 2); ctx.stroke();
            for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; P([[32 + Math.cos(a) * 18, 32 + Math.sin(a) * 18], [32 + Math.cos(a) * 26, 32 + Math.sin(a) * 26]]); }
        } else if (kind === 'cloud') {
            ctx.beginPath(); ctx.arc(22, 36, 12, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(34, 26, 14, Math.PI * 1.1, Math.PI * 1.95); ctx.arc(46, 38, 10, Math.PI * 1.5, Math.PI * 0.5); ctx.closePath(); ctx.stroke();
        } else if (kind === 'bolt') {
            P([[36, 6], [14, 36], [30, 36], [26, 58], [50, 26], [34, 26]], true);
        } else if (kind === 'gift') {
            P([[8, 24], [56, 24], [56, 34], [8, 34]], true); P([[12, 34], [52, 34], [52, 58], [12, 58]], true); P([[32, 24], [32, 58]]);
            ctx.beginPath(); ctx.ellipse(25, 18, 7, 5, 0.3, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(39, 18, 7, 5, -0.3, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    }

    // =================================================================
    //  SEZIONI
    // =================================================================

    // ---- 00 · BOOT -------------------------------------------------
    function sBoot(t) {
        bg(C.deep);
        const lines = ['boot1', 'boot2', 'boot3'];
        const x0 = 600, y0 = 498, lh = 46;
        // il terminale viene disegnato e poi "spento" come un CRT
        lines.forEach((k, i) => {
            const s = typed(k, t); if (!s) return;
            const y = y0 + i * lh;
            text('>', x0, y, { weight: 700, size: 26, family: 'Courier Prime', color: C.gold });
            const body = s.slice(2);
            const bx = x0 + measure('> ', { weight: 400, size: 26, family: 'Courier Prime' });
            const okIdx = body.indexOf('[OK]');
            if (okIdx >= 0) {
                text(body.slice(0, okIdx), bx, y, { weight: 400, size: 26, family: 'Courier Prime', color: '#9a9a9a' });
                const w = measure(body.slice(0, okIdx), { weight: 400, size: 26, family: 'Courier Prime' });
                text(body.slice(okIdx), bx + w, y, { weight: 700, size: 26, family: 'Courier Prime', color: C.gold });
            } else text(body, bx, y, { weight: 400, size: 26, family: 'Courier Prime', color: i === 0 ? C.ivory : '#9a9a9a' });
            const active = i === 2 || (t < TYPE[lines[i + 1]].t);
            if (active) cursor(bx + measure(body, { weight: 400, size: 26, family: 'Courier Prime' }), y, 26, t);
        });
        // linee di scansione CRT
        ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = '#000';
        for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
        ctx.restore();
        glitch(prog(t, 2.2, 2.36) * (1 - prog(t, 2.36, 2.4)) * 0.9 + (t > 2.05 && t < 2.1 ? 0.35 : 0), Math.floor(t * 30));
        // spegnimento: si schiaccia in una riga, poi in un punto d'oro
        if (t >= 2.36) {
            const sy = 1 - E.outExpo(prog(t, 2.36, 2.5)) * 0.998;
            const sx = 1 - E.inExpo(prog(t, 2.48, 2.64)) * 0.999;
            crtSquash(sx, sy, prog(t, 2.36, 2.5) * 0.9);
        }
        if (t >= 2.6) {
            bg('#000');
            const pulse = 0.65 + 0.35 * Math.sin((t - 2.6) * 40);
            const grow = E.inExpo(prog(t, 2.6, 3.0));
            goldDot(clamp(0.7 + grow) * pulse, 3 + grow * 3);
            glow(W / 2, H / 2, 200 + grow * 500, 'rgba(255,230,170,0.7)', grow * 0.8);
        }
    }

    // ---- 01 · LOGO -------------------------------------------------
    function sLogo(t) {
        const l = t - T.LOGO;
        bg(C.deep);
        ctx.save();
        const z = 1 + 0.045 * E.outCubic(prog(l, 0, 4));
        ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
        drawGrid(E.smooth(prog(l, 0.15, 1.2)) * 0.95, 1 + 0.06 * l);
        glow(W / 2, LOGO.y - 60, 900, 'rgba(139,35,35,0.35)', E.smooth(prog(l, 0.8, 2.0)) * 0.7);
        // onda d'urto e lampo iniziale
        const kRing = prog(l, 0, 0.75);
        if (kRing < 1) {
            ctx.save(); ctx.globalAlpha = (1 - kRing) * 0.8; ctx.strokeStyle = C.gold; ctx.lineWidth = 3 * (1 - kRing) + 0.5;
            ctx.beginPath(); ctx.ellipse(W / 2, H / 2, 20 + 1300 * E.outExpo(kRing), 8 + 560 * E.outExpo(kRing), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        }
        const crisp = E.smooth(prog(l, 1.28, 1.55));
        if (crisp < 1) logoParticles(l, 1 - crisp * 0.999);
        logoText({ alpha: crisp, entK: prog(l, 1.35, 2.3) });
        glint(prog(l, 1.65, 2.25), 300, 600);
        // tagline digitata
        const tag = typed('tagline', t);
        if (tag) {
            const full = TYPE.tagline.text;
            const wFull = measure(full, { weight: 400, size: 30, family: 'Courier Prime', spacing: 1 });
            const x = W / 2 - wFull / 2;
            text(tag, x, LOGO.y + 160, { weight: 400, size: 30, family: 'Courier Prime', spacing: 1, color: '#9a9a9a' });
            if (l < 3.7) cursor(x + measure(tag, { weight: 400, size: 30, family: 'Courier Prime', spacing: 1 }), LOGO.y + 160, 30, t);
        }
        ctx.restore();
        flash(Math.pow(1 - prog(l, 0, 0.42), 2.2), '255,246,224');
        glitch(E.inExpo(prog(l, 3.7, 4.0)) * 0.95, Math.floor(t * 30));
    }

    // ---- 02 · STUDIO -----------------------------------------------
    function sStudio(t) {
        const k = t - T.STUDIO;
        bg(C.bg);
        drawGrid(0.55, 1.1 + k * 0.02, -k * 12);
        if (k < 1.0) {
            const out = E.inCubic(prog(k, 0.86, 1.0));
            ctx.save(); ctx.translate(0, -out * 60); ctx.globalAlpha = 1 - out;
            text('// LO STUDIO', 160, 318, { weight: 700, size: 24, family: 'Courier Prime', spacing: 4, color: C.gold, alpha: prog(k, 0, 0.15) });
            reveal('NON CREIAMO', 152, 480, prog(k, 0.02, 0.42), { size: 138, color: C.ivory, spacing: 2 });
            reveal('PASSATEMPI.', 152, 628, prog(k, 0.1, 0.5), { size: 138, stroke: C.ivory, lineWidth: 2.5, spacing: 2 });
            const ws = measure('PASSATEMPI.', { size: 138, spacing: 2 });
            const ks = E.outExpo(prog(k, 0.5, 0.7));
            if (ks > 0) { ctx.fillStyle = C.redHi; ctx.fillRect(140, 628 - 56, (ws + 30) * ks, 14); }
            text('Mondi immersivi, non semplici passatempi.', 160, 712, { weight: 400, size: 24, family: 'Courier Prime', color: '#8a8a8a', alpha: prog(k, 0.55, 0.75) });
            ctx.restore();
        } else if (k < 2.0) {
            const q = k - 1.0;
            const z = 1 + 0.05 * q;
            ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
            glow(W / 2, 600, 700, 'rgba(227,198,108,0.25)', E.smooth(prog(q, 0, 0.6)) * 0.8);
            text('CREIAMO', W / 2, 440, { size: 104, spacing: 26, align: 'center', color: C.ivory, alpha: prog(q, 0, 0.12) });
            const s = lerp(1.45, 1, E.outExpo(prog(q, 0.06, 0.45)));
            ctx.save(); ctx.translate(W / 2, 660); ctx.scale(s, s);
            text('MONDI.', 0, 0, { size: 270, spacing: 6, align: 'center', color: C.gold, alpha: prog(q, 0.06, 0.2), baseline: 'middle' });
            ctx.restore();
            text('Atmosfere dense che sfidano l’intelletto.', W / 2, 840, { weight: 400, size: 26, family: 'Courier Prime', spacing: 1, align: 'center', color: '#8a8a8a', alpha: prog(q, 0.3, 0.55) });
            ctx.restore();
            flash((1 - prog(q, 0, 0.12)) * 0.25);
        } else {
            const i = Math.min(3, Math.floor((k - 2) / 0.5)), q = (k - 2) - i * 0.5;
            const [num, title, sub, desc] = PILLARS[i];
            const left = i % 2 === 0;
            const tx = left ? 170 : W - 170;
            const align = left ? 'left' : 'right';
            const enter = E.outExpo(prog(q, 0, 0.22));
            const off = (1 - enter) * 70 * (left ? -1 : 1);
            text(num, left ? W - 150 + q * 40 : 150 - q * 40, 820, { size: 440, align: left ? 'right' : 'left', stroke: 'rgba(227,198,108,0.32)', lineWidth: 2 });
            text(`PILASTRO ${num} / 04`, tx + off * 0.5, 372, { weight: 700, size: 22, family: 'Courier Prime', spacing: 5, align, color: C.gold, alpha: enter });
            text(title, tx + off, 548, { size: 150, spacing: 3, align, color: C.ivory, alpha: enter });
            text(sub, tx + off * 1.4, 640, { weight: 300, size: 62, spacing: 14, align, color: C.gold, alpha: prog(q, 0.04, 0.2) });
            text(desc, tx + off * 1.8, 712, { weight: 400, size: 25, family: 'Courier Prime', align, color: '#8f8f8f', alpha: prog(q, 0.08, 0.26) });
            // indicatore di avanzamento
            for (let j = 0; j < 4; j++) {
                const x = W / 2 - 2 * 92 + j * 92;
                ctx.fillStyle = '#262626'; ctx.fillRect(x, 905, 80, 4);
                const f = j < i ? 1 : j === i ? prog(q, 0, 0.5) : 0;
                ctx.fillStyle = C.gold; ctx.fillRect(x, 905, 80 * f, 4);
            }
            text('// I 4 PILASTRI', 170, 250, { weight: 700, size: 22, family: 'Courier Prime', spacing: 4, color: '#6f6f6f' });
            flash((1 - prog(q, 0, 0.07)) * 0.16);
            glitch(q < 0.05 && i > 0 ? 0.35 : 0, i * 17 + Math.floor(q * 60));
        }
        glitch(E.inExpo(prog(k, 3.82, 4.0)) * 0.9, Math.floor(t * 30));
    }

    // ---- 03 · GIOCHI -----------------------------------------------
    function posterPagoda(x, y, w, h) {
        ctx.save();
        ctx.fillStyle = '#060606'; ctx.fillRect(x, y, w, h);
        const ih = h * 0.72;
        // immagine: ritaglio verticale dell'istantanea 3D
        const sw = posterImg.height * (w / ih);
        ctx.drawImage(posterImg, (W - sw) / 2 + 40, 0, sw, posterImg.height, x, y, w, ih);
        const g = ctx.createLinearGradient(0, y + ih * 0.55, 0, y + ih);
        g.addColorStop(0, 'rgba(6,6,6,0)'); g.addColorStop(1, 'rgba(6,6,6,1)');
        ctx.fillStyle = g; ctx.fillRect(x, y, w, ih);
        ctx.fillStyle = C.gold; ctx.fillRect(x, y, w, 3);
        // targhetta
        ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(x + 18, y + 20, 138, 30);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(x + 18.5, y + 20.5, 138, 30);
        text('IN SVILUPPO', x + 87, y + 41, { weight: 700, size: 14, family: 'Courier Prime', spacing: 2, align: 'center', color: C.gold });
        text('LA PAGODA', x + 28, y + ih + 30, { size: 46, spacing: 2, color: C.ivory });
        text('LIMINAL SURVIVAL HORROR', x + 30, y + ih + 66, { weight: 700, size: 17, family: 'Courier Prime', spacing: 3, color: C.redHi });
        text('PC · 2027 · KRIPIX STORE / STEAM', x + 30, y + ih + 96, { weight: 400, size: 15, family: 'Courier Prime', spacing: 1, color: '#8a8a8a' });
        ctx.strokeStyle = 'rgba(227,198,108,0.6)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
        ctx.restore();
    }
    function posterSecret(x, y, w, h, t) {
        ctx.save();
        ctx.fillStyle = '#080808'; ctx.fillRect(x, y, w, h);
        const ih = h * 0.72;
        ctx.drawImage(noiseTex, 0, Math.floor(hash(Math.floor(t * 24)) * 20), 400, 420, x, y, w, ih);
        text('?', x + w / 2, y + ih * 0.66, { size: 300, align: 'center', stroke: 'rgba(232,230,217,0.22)', lineWidth: 2 });
        ctx.fillStyle = '#000'; ctx.fillRect(x + 40, y + 70, w * 0.55, 18); ctx.fillRect(x + 40, y + 100, w * 0.4, 18);
        ctx.save(); ctx.translate(x + w / 2, y + ih * 0.52); ctx.rotate(-0.2);
        ctx.strokeStyle = C.redHi; ctx.lineWidth = 4; ctx.strokeRect(-150, -34, 300, 68);
        text('CLASSIFICATO', 0, 13, { size: 34, spacing: 4, align: 'center', color: C.redHi });
        ctx.restore();
        text('PROGETTO SEGRETO', x + 28, y + ih + 30, { size: 34, spacing: 1, color: C.ivory });
        text('UN NUOVO CAPITOLO', x + 30, y + ih + 66, { weight: 700, size: 17, family: 'Courier Prime', spacing: 3, color: '#9a9a9a' });
        text('PRE-PRODUZIONE · ████', x + 30, y + ih + 96, { weight: 400, size: 15, family: 'Courier Prime', spacing: 1, color: '#6a6a6a' });
        ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5);
        ctx.restore();
    }
    function sGames(t) {
        const g = t - T.GAMES;
        bg(C.bg);
        drawGrid(0.6, 1.05, 0);
        const cw = 420, ch = 620;
        const ax = W / 2 - cw - 26, bx = W / 2 + 26, cy = 560 - ch / 2 + 20;
        // spinta dentro il poster della Pagoda
        const push = E.inExpo(prog(g, 1.15, 2.0));
        const focusX = ax + cw / 2, focusY = cy + ch * 0.36;
        const z = 1 + push * 5.2;
        ctx.save();
        ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-lerp(W / 2, focusX, Math.min(1, push * 3)), -lerp(H / 2, focusY, Math.min(1, push * 3)));
        text('// I NOSTRI GIOCHI', 170, 175, { weight: 700, size: 24, family: 'Courier Prime', spacing: 4, color: C.gold, alpha: prog(g, 0, 0.2) });
        text('CATALOGO PROGETTI', 170, 214, { weight: 400, size: 18, family: 'Courier Prime', spacing: 3, color: '#6a6a6a', alpha: prog(g, 0.05, 0.25) });
        const card = (x, k, rot, draw, alpha = 1) => {
            const e = E.outExpo(k);
            ctx.save(); ctx.globalAlpha = alpha * clamp(k * 3);
            ctx.translate(x + cw / 2, cy + ch / 2 + (1 - e) * 520 + Math.sin(g * 1.6 + x) * 4);
            ctx.rotate((1 - e) * rot);
            ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
            ctx.fillStyle = '#000'; ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
            ctx.shadowColor = 'transparent';
            draw(-cw / 2, -ch / 2, cw, ch);
            ctx.restore();
        };
        const dim = E.smooth(prog(g, 0.95, 1.3));
        card(bx + dim * 60, prog(g, 0.12, 0.62), 0.16, (x, y, w, h) => posterSecret(x, y, w, h, t), 1 - dim * 0.7);
        card(ax, prog(g, 0, 0.5), -0.14, (x, y, w, h) => posterPagoda(x, y, w, h));
        glow(focusX, focusY, 500, 'rgba(255,235,190,0.8)', push * 0.9);
        ctx.restore();
        // il flash si carica... e scatta
        flash(E.inExpo(prog(g, 1.7, 2.0)), '255,250,240');
    }

    // ---- 04 · LA PAGODA (3D) ---------------------------------------
    const BAR = 104;
    function sPagoda(t) {
        const s = t - T.PAGODA;
        renderer.setClearColor(0x000000, 1);
        pagoda.render(s, t);
        ctx.drawImage(glCanvas, 0, 0);
        // grading leggero: ombre fredde
        ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.35;
        const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1a2a44'); gr.addColorStop(1, '#2a0f08');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();

        // --- titolo in alto a sinistra ---
        const fade = 1 - prog(s, 8.25, 8.5);
        ctx.save(); ctx.globalAlpha = fade;
        const tx = 140, ty = BAR + 196;
        text('KRIPIX ENTERTAINMENT PRESENTA', tx + 2, ty - 92, { weight: 700, size: 18, family: 'Courier Prime', spacing: 6, color: C.gold, alpha: prog(s, 0.7, 1.1) });
        const title = 'LA PAGODA';
        let cx = tx;
        for (let i = 0; i < title.length; i++) {
            const ch = title[i];
            const at = 1.0 + i * 0.055;
            const w = measure(ch, { size: 104, spacing: 6 }) + 6;
            if (s >= at) {
                const age = s - at;
                // ogni lettera "si solidifica" con un piccolo flash, come la fotocamera di Stefano
                const hot = Math.exp(-age * 9);
                const flick = (s > 1.62 && s < 1.66 && i === 4) || (s > 3.3 && s < 3.33 && i === 7) ? 0.15 : 1;
                text(ch, cx, ty, { size: 104, color: hot > 0.05 ? `rgb(255,${Math.round(lerp(232, 255, hot))},${Math.round(lerp(217, 250, hot))})` : C.ivory, alpha: flick, glow: 40 * hot + 6, glowColor: hot > 0.05 ? 'rgba(255,240,210,0.9)' : 'rgba(0,0,0,0.6)' });
            }
            cx += w;
        }
        const titleW = measure(title, { size: 104, spacing: 6 });
        ctx.fillStyle = '#a52a2a'; ctx.fillRect(tx + 2, ty + 22, titleW * E.outExpo(prog(s, 1.5, 1.95)), 6);
        text(typed('pagodaTag', t), tx + 4, ty + 70, { weight: 700, size: 27, family: 'Courier Prime', spacing: 7, color: '#d04a44', glow: 12, glowColor: 'rgba(200,40,40,0.5)' });
        text('PC · 2027 · IN SVILUPPO', tx + 4, ty + 108, { weight: 400, size: 19, family: 'Courier Prime', spacing: 4, color: '#a0a0a0', alpha: prog(s, 2.75, 3.1) });
        ctx.restore();
        // didascalia dopo lo sbattere della porta
        const cap = typed('pagodaCap', t);
        if (cap) {
            const full = TYPE.pagodaCap.text;
            const wf = measure(full, { weight: 400, size: 32, family: 'Courier Prime', spacing: 2 });
            text(cap, W / 2 - wf / 2, H - BAR - 64, { weight: 400, size: 32, family: 'Courier Prime', spacing: 2, color: C.ivory, glow: 14, glowColor: 'rgba(0,0,0,0.9)' });
        }
        // bande cinematografiche: si aprono col flash e si chiudono come un otturatore
        const open = E.outExpo(prog(s, 0.05, 0.55));
        const shut = E.inExpo(prog(s, 8.55, 8.92));
        const bar = lerp(0, BAR, open) + (H / 2 - BAR) * shut;
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
        if (shut > 0 && shut < 1) { ctx.fillStyle = `rgba(227,198,108,${0.7 * (1 - shut)})`; ctx.fillRect(0, bar - 2, W, 2); ctx.fillRect(0, H - bar, W, 2); }
        flash(Math.pow(1 - prog(s, 0, 0.85), 2.4), '255,248,236');
    }

    // ---- 05 · LAUNCHER ---------------------------------------------
    const [ui, ug] = mk(1280, 800);
    const uiTex = new THREE.CanvasTexture(ui); uiTex.colorSpace = THREE.SRGBColorSpace; uiTex.anisotropy = 8;
    const uiScene = new THREE.Scene();
    const uiCam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100); uiCam.position.set(0, 0, 26);
    const edge = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, toneMapped: false });
    const win = new THREE.Mesh(new THREE.BoxGeometry(11.2, 7.0, 0.14), [edge, edge, edge, edge, new THREE.MeshBasicMaterial({ map: uiTex, toneMapped: false }), edge]);
    uiScene.add(win);
    function drawLauncherUI(u) {
        const g = ug, w = 1280, h = 800;
        const tx = (s, x, y, o = {}) => {
            g.font = o.font || font(o.weight || 700, o.size || 16, o.family); g.letterSpacing = `${o.spacing || 0}px`;
            g.textAlign = o.align || 'left'; g.fillStyle = o.color || C.ivory; g.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
            g.fillText(s, x, y); g.globalAlpha = 1;
        };
        g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h);
        // barra del titolo
        g.fillStyle = '#0b0d11'; g.fillRect(0, 0, w, 40);
        g.fillStyle = '#1c1c1c'; g.fillRect(0, 40, w, 1);
        tx('KRIPIX LAUNCHER', 20, 26, { size: 13, spacing: 4, color: '#bdbbb0' });
        tx('v2.0.4', 196, 26, { weight: 400, size: 12, family: 'Courier Prime', color: '#555' });
        ['—', '□', '×'].forEach((c, i) => tx(c, w - 96 + i * 32, 26, { weight: 500, size: 15, color: '#666' }));
        // barra laterale
        g.fillStyle = '#07090c'; g.fillRect(0, 41, 236, h - 41); g.fillStyle = '#181818'; g.fillRect(236, 41, 1, h - 41);
        tx('KRIPIX', 30, 100, { weight: 900, size: 30, spacing: 2 });
        tx('ENTERTAINMENT', 31, 120, { weight: 300, size: 10.5, spacing: 4.2, color: '#a83030' });
        const nav = [['library', 'LIBRERIA'], ['store', 'STORE'], ['net', 'NETWORK'], ['gear', 'IMPOSTAZIONI']];
        nav.forEach(([ic, label], i) => {
            const y = 172 + i * 56, act = i === 0;
            if (act) { g.fillStyle = 'rgba(227,198,108,0.07)'; g.fillRect(0, y - 26, 236, 48); g.fillStyle = C.gold; g.fillRect(0, y - 26, 3, 48); }
            // icone in piccolo
            g.save(); g.translate(28, y - 12); g.scale(0.34, 0.34); g.strokeStyle = act ? C.gold : '#666'; g.lineWidth = 5; g.lineJoin = 'round';
            g.strokeRect(6, 8, 52, 48); g.restore();
            tx(label, 66, y + 4, { weight: 700, size: 13.5, spacing: 2.5, color: act ? C.ivory : '#777' });
        });
        g.fillStyle = '#111'; g.fillRect(16, h - 86, 204, 64);
        g.fillStyle = '#222'; g.beginPath(); g.arc(48, h - 54, 18, 0, Math.PI * 2); g.fill();
        tx('A', 48, h - 48, { weight: 900, size: 16, align: 'center', color: C.gold });
        tx('AGENTE_07', 76, h - 58, { weight: 700, size: 13, spacing: 1.5 });
        g.fillStyle = '#4caf50'; g.beginPath(); g.arc(81, h - 42, 4, 0, Math.PI * 2); g.fill();
        tx('ONLINE', 92, h - 38, { weight: 400, size: 11, family: 'Courier Prime', spacing: 2, color: '#4caf50' });
        // banner principale con la Pagoda
        const bx = 262, by = 64, bw = 994, bh = 380;
        g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
        const sw = bannerImg.width, sh = sw * bh / bw;
        const pan = 1.0 + 0.04 * u;
        g.drawImage(bannerImg, (bannerImg.width - sw / pan) / 2 + 120, (bannerImg.height - sh / pan) / 2 + 40, sw / pan, sh / pan, bx, by, bw, bh);
        const lg = g.createLinearGradient(bx, 0, bx + bw * 0.75, 0);
        lg.addColorStop(0, 'rgba(5,7,10,0.95)'); lg.addColorStop(0.55, 'rgba(5,7,10,0.55)'); lg.addColorStop(1, 'rgba(5,7,10,0)');
        g.fillStyle = lg; g.fillRect(bx, by, bw, bh);
        g.restore();
        g.fillStyle = C.gold; g.fillRect(bx, by, bw, 2);
        tx('IN EVIDENZA', bx + 34, by + 52, { weight: 700, size: 13, family: 'Courier Prime', spacing: 4, color: C.gold });
        tx('LA PAGODA', bx + 32, by + 122, { weight: 900, size: 66, spacing: 2 });
        tx('Liminal Survival Horror', bx + 34, by + 158, { weight: 400, size: 17, family: 'Courier Prime', spacing: 1, color: '#c0c0c0' });
        g.strokeStyle = C.gold; g.lineWidth = 1; g.strokeRect(bx + 34.5, by + 180.5, 156, 28);
        tx('DELUXE EDITION', bx + 112, by + 200, { weight: 700, size: 12, family: 'Courier Prime', spacing: 2, align: 'center', color: C.gold });
        // pulsante (INSTALLA → SCARICAMENTO → GIOCA)
        const press = u > 1.08 && u < 1.2 ? 0.96 : 1;
        const done = u >= 2.9;
        const pk = prog(u, 1.25, 2.85);
        const pct = Math.floor(E.inOutCubic(pk) * 100 - (pk > 0 && pk < 1 ? hash(Math.floor(u * 12)) * 2 : 0));
        const btnX = bx + 34, btnY = by + 250, btnW = 250, btnH = 60;
        g.save(); g.translate(btnX + btnW / 2, btnY + btnH / 2); g.scale(press, press);
        if (done) { g.shadowColor = 'rgba(227,198,108,0.9)'; g.shadowBlur = 30 + 20 * Math.sin(u * 12); }
        g.fillStyle = (u < 1.12 || done) ? C.gold : '#1a1710'; g.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
        g.shadowBlur = 0;
        if (!(u < 1.12 || done)) { g.fillStyle = 'rgba(227,198,108,0.35)'; g.fillRect(-btnW / 2, -btnH / 2, btnW * pk, btnH); g.strokeStyle = C.gold; g.strokeRect(-btnW / 2 + 0.5, -btnH / 2 + 0.5, btnW - 1, btnH - 1); }
        const label = u < 1.12 ? 'INSTALLA' : done ? '▶  GIOCA' : `${clamp(pct, 0, 99)}%`;
        g.font = font(900, 19); g.letterSpacing = '4px'; g.textAlign = 'center'; g.fillStyle = (u < 1.12 || done) ? '#000' : C.gold;
        g.fillText(label, 2, 7);
        g.restore();
        tx(done ? 'PRONTO · Cloud Save attivo' : u < 1.12 ? '85 GB · SSD NVMe' : 'SCARICAMENTO IN CORSO', btnX + btnW + 26, btnY + 26, { weight: 700, size: 13, family: 'Courier Prime', spacing: 2, color: done ? '#4caf50' : '#9a9a9a' });
        if (!done && u >= 1.12) tx(`${(2.1 + hash(Math.floor(u * 6)) * 0.6).toFixed(1)} GB/s · ${(85 * (1 - E.inOutCubic(pk))).toFixed(1)} GB rimanenti`, btnX + btnW + 26, btnY + 48, { weight: 400, size: 12, family: 'Courier Prime', spacing: 1, color: '#666' });
        // barra di download
        g.fillStyle = '#141414'; g.fillRect(bx, by + bh + 26, bw, 4);
        g.fillStyle = done ? '#4caf50' : C.gold; g.fillRect(bx, by + bh + 26, bw * E.inOutCubic(pk), 4);
        // tre schede, come le news del sito
        const feats = [['bolt', 'AGGIORNAMENTI RAPIDI', 'Ultima versione sempre disponibile.'], ['cloud', 'CLOUD SAVE', 'Progressi al sicuro nel cloud.'], ['gift', 'BONUS ESCLUSIVI', 'Contenuti extra per gli utenti.']];
        feats.forEach(([ic, title, body], i) => {
            const fx = bx + i * 338, fy = by + bh + 62, fw = 318, fh = 222;
            const a = clamp((u - 0.5 - i * 0.12) * 4);
            g.globalAlpha = a;
            g.fillStyle = '#0a0b0e'; g.fillRect(fx, fy, fw, fh);
            g.strokeStyle = '#1f1f1f'; g.lineWidth = 1; g.strokeRect(fx + 0.5, fy + 0.5, fw - 1, fh - 1);
            g.fillStyle = C.gold; g.fillRect(fx, fy, fw, 2);
            g.save(); g.translate(fx + 26, fy + 30); g.scale(0.7, 0.7); g.strokeStyle = C.gold; g.lineWidth = 3.2; g.lineJoin = 'round';
            // icona semplificata
            g.beginPath();
            if (ic === 'bolt') { [[36, 6], [14, 36], [30, 36], [26, 58], [50, 26], [34, 26]].forEach((p, j) => j ? g.lineTo(...p) : g.moveTo(...p)); g.closePath(); }
            if (ic === 'cloud') { g.arc(22, 36, 12, Math.PI * 0.5, Math.PI * 1.5); g.arc(34, 26, 14, Math.PI * 1.1, Math.PI * 1.95); g.arc(46, 38, 10, Math.PI * 1.5, Math.PI * 0.5); g.closePath(); }
            if (ic === 'gift') { g.rect(8, 24, 48, 10); g.rect(12, 34, 40, 24); g.moveTo(32, 24); g.lineTo(32, 58); }
            g.stroke(); g.restore();
            tx(title, fx + 26, fy + 128, { weight: 900, size: 17, spacing: 1.5 });
            tx(body, fx + 26, fy + 158, { weight: 500, size: 13.5, color: '#888' });
            tx('> ATTIVO', fx + 26, fy + 196, { weight: 700, size: 11.5, family: 'Courier Prime', spacing: 2, color: C.gold });
            g.globalAlpha = 1;
        });
        // cursore del mouse
        const ck = E.inOutCubic(prog(u, 0.55, 1.05));
        const ck2 = E.inOutCubic(prog(u, 3.0, 3.5));
        const mx = lerp(lerp(1010, btnX + btnW * 0.62, ck), 1120, ck2), my = lerp(lerp(700, btnY + btnH * 0.6, ck), 560, ck2);
        if (u > 0.4) {
            g.save(); g.translate(mx, my); g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 1.5;
            g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 26); g.lineTo(7, 20); g.lineTo(12, 31); g.lineTo(16, 29); g.lineTo(11, 18); g.lineTo(19, 18); g.closePath(); g.fill(); g.stroke();
            const rk = prog(u, 1.08, 1.45);
            if (rk > 0 && rk < 1) { g.strokeStyle = `rgba(227,198,108,${1 - rk})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 10 + rk * 40, 0, Math.PI * 2); g.stroke(); }
            g.restore();
        }
        uiTex.needsUpdate = true;
    }
    function sLauncher(t) {
        const u = t - T.LAUNCHER;
        bg(C.bg);
        drawGrid(0.7, 1.0 + u * 0.015);
        glow(1360, 560, 820, 'rgba(227,198,108,0.22)', E.smooth(prog(u, 0.3, 1.2)));
        glow(1360, 560, 600, 'rgba(139,35,35,0.25)', 1);
        // colonna di testo
        const x = 150;
        text('// KRIPIX LAUNCHER', x, 300, { weight: 700, size: 24, family: 'Courier Prime', spacing: 4, color: C.gold, alpha: prog(u, 0.2, 0.4) });
        reveal('IL TUO PORTALE', x - 4, 404, prog(u, 0.3, 0.75), { size: 70, spacing: 1, color: C.ivory });
        reveal('PER LA PAGODA', x - 4, 486, prog(u, 0.4, 0.85), { size: 70, spacing: 1, color: C.ivory });
        reveal('E OLTRE.', x - 4, 568, prog(u, 0.5, 0.95), { size: 70, spacing: 1, color: C.gold });
        ['Aggiornamenti rapidi', 'Cloud save', 'Bonus esclusivi'].forEach((s, i) => {
            const a = E.outExpo(prog(u, 1.45 + i * 0.22, 1.75 + i * 0.22));
            text('▸', x + (1 - a) * -20, 660 + i * 46, { weight: 700, size: 24, family: 'Courier Prime', color: C.gold, alpha: a });
            text(s, x + 34 + (1 - a) * -20, 660 + i * 46, { weight: 400, size: 26, family: 'Courier Prime', color: '#b5b5b5', alpha: a });
        });
        const oa = E.outExpo(prog(u, 2.3, 2.6));
        ['WINDOWS 10/11', 'macOS'].forEach((s, i) => {
            const bx = x + i * 220, by = 830;
            ctx.save(); ctx.globalAlpha = oa; ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, i ? 130 : 200, 44); ctx.restore();
            text(s, bx + (i ? 65 : 100), by + 29, { weight: 700, size: 16, spacing: 3, align: 'center', color: C.ivory, alpha: oa });
        });
        // finestra del launcher in prospettiva
        drawLauncherUI(u);
        const fly = E.outExpo(prog(u, 0.1, 0.95));
        win.position.set(lerp(9, 5.0, fly), lerp(-7, -0.15, fly) + 0.05 * Math.sin(u * 1.4), lerp(-6, 0, fly));
        win.rotation.set(lerp(0.35, 0.05, fly) + 0.01 * Math.sin(u), lerp(-0.85, -0.36, fly) + 0.08 * E.smooth(prog(u, 0.9, 4)), lerp(0.12, 0, fly));
        const zoomOut = E.inExpo(prog(u, 3.72, 4.0));
        uiCam.position.z = 26 - zoomOut * 14;
        renderer.setClearColor(0x000000, 0);
        renderer.render(uiScene, uiCam);
        ctx.drawImage(glCanvas, 0, 0);
        // apertura dell'otturatore dalla scena precedente
        const bar = (H / 2) * (1 - E.outExpo(prog(u, 0.0, 0.4)));
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
        glitch(E.inExpo(prog(u, 3.78, 4.0)) * 0.9, Math.floor(t * 30));
    }

    // ---- 06 · ECOSISTEMA -------------------------------------------
    function sEco(t) {
        const e = t - T.ECO;
        bg(C.bg);
        drawGrid(0.6, 1.05 + e * 0.02);
        const collapse = E.inExpo(prog(e, 2.55, 2.95));
        ctx.save();
        ctx.globalAlpha = 1 - collapse * 0.6;
        text('// NON SOLO GIOCHI', W / 2, 205, { weight: 700, size: 24, family: 'Courier Prime', spacing: 5, align: 'center', color: C.gold, alpha: prog(e, 0, 0.2) });
        const k = E.outExpo(prog(e, 0.05, 0.45));
        ctx.save(); ctx.beginPath(); ctx.rect(0, 220, W, 110); ctx.clip();
        const wA = measure('UN INTERO ', { size: 76, spacing: 2 }), wB = measure('ECOSISTEMA.', { size: 76, spacing: 2 });
        const x0 = W / 2 - (wA + wB) / 2;
        text('UN INTERO ', x0, 305 + (1 - k) * 90, { size: 76, spacing: 2, color: C.ivory });
        text('ECOSISTEMA.', x0 + wA, 305 + (1 - k) * 90, { size: 76, spacing: 2, color: C.gold });
        ctx.restore();
        ctx.restore();
        const tw = 372, th = 380, gap = 26, x0t = W / 2 - (4 * tw + 3 * gap) / 2, y0 = 382;
        ECO.forEach((it, i) => {
            const a0 = 0.5 + i * 0.25;
            const a = E.outExpo(prog(e, a0, a0 + 0.4));
            if (a <= 0) return;
            const cx = x0t + i * (tw + gap), cy = y0 + (1 - a) * 80;
            ctx.save();
            // collasso finale verso il centro
            const tcx = cx + tw / 2, tcy = cy + th / 2;
            ctx.translate(lerp(tcx, W / 2, collapse), lerp(tcy, H / 2, collapse)); ctx.scale(1 - collapse * 0.97, 1 - collapse * 0.97); ctx.translate(-tcx, -tcy);
            ctx.globalAlpha = a;
            ctx.fillStyle = 'rgba(12,12,12,0.85)'; ctx.fillRect(cx, cy, tw, th);
            ctx.strokeStyle = '#242424'; ctx.lineWidth = 1; ctx.strokeRect(cx + 0.5, cy + 0.5, tw - 1, th - 1);
            ctx.fillStyle = C.gold; ctx.fillRect(cx, cy, tw * E.outExpo(prog(e, a0 + 0.05, a0 + 0.45)), 2);
            text(String(i + 1).padStart(2, '0'), cx + tw - 26, cy + 52, { weight: 700, size: 18, family: 'Courier Prime', align: 'right', color: '#4a4a4a' });
            icon(it.icon, cx + 34, cy + 40, 70, E.outCubic(prog(e, a0 + 0.08, a0 + 0.5)));
            text(it.title, cx + 34, cy + 186, { size: 31, spacing: 1.5, color: C.ivory, alpha: prog(e, a0 + 0.1, a0 + 0.3) });
            it.body.forEach((b, j) => text(b, cx + 34, cy + 232 + j * 30, { weight: 500, size: 19, color: '#8c8c8c', alpha: prog(e, a0 + 0.15, a0 + 0.35) }));
            text(it.tag, cx + 34, cy + th - 34, { weight: 700, size: 16, family: 'Courier Prime', spacing: 2, color: C.gold, alpha: prog(e, a0 + 0.2, a0 + 0.4) });
            ctx.restore();
            flash(e > a0 && e < a0 + 0.06 ? 0.06 : 0);
        });
        if (collapse > 0) goldDot(collapse, 3 + collapse * 3);
        glitch(prog(e, 2.4, 2.55) * (1 - prog(e, 2.55, 2.6)) * 0.6, Math.floor(t * 30));
    }

    // ---- 07 · FINALE -----------------------------------------------
    function sEnd(t) {
        const f = t - T.END;
        bg(C.deep);
        drawGrid(E.smooth(prog(f, 0.1, 1.0)) * 0.9, 1.08 - 0.04 * f);
        glow(W / 2, LOGO.y - 70, 1000, 'rgba(139,35,35,0.35)', E.smooth(prog(f, 0.2, 1.5)) * 0.8);
        const kRing = prog(f, 0, 0.8);
        if (kRing < 1) {
            ctx.save(); ctx.globalAlpha = (1 - kRing) * 0.8; ctx.strokeStyle = C.gold; ctx.lineWidth = 3 * (1 - kRing) + 0.5;
            ctx.beginPath(); ctx.ellipse(W / 2, H / 2, 20 + 1300 * E.outExpo(kRing), 8 + 560 * E.outExpo(kRing), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        }
        const dy = -40;
        // esposizione: il logo nasce sovraesposto e si "sviluppa" come una foto
        const dev = E.outCubic(prog(f, 0.0, 0.9));
        logoText({ dy, entK: prog(f, 0.15, 1.1), kColor: `rgb(${Math.round(lerp(255, 232, dev))},${Math.round(lerp(255, 230, dev))},${Math.round(lerp(255, 217, dev))})`, glow: 60 * (1 - dev) + 4, glowColor: `rgba(255,240,210,${0.9 * (1 - dev)})` });
        glint(prog(f, 1.15, 1.75), 300, 600);
        const tag = typed('endTag', t);
        if (tag) {
            const full = TYPE.endTag.text;
            const wFull = measure(full, { weight: 400, size: 30, family: 'Courier Prime', spacing: 1 });
            text(tag, W / 2 - wFull / 2, LOGO.y + 160 + dy, { weight: 400, size: 30, family: 'Courier Prime', spacing: 1, color: '#a0a0a0' });
            if (f < 3.6) cursor(W / 2 - wFull / 2 + measure(tag, { weight: 400, size: 30, family: 'Courier Prime', spacing: 1 }), LOGO.y + 160 + dy, 30, t);
        }
        const lk = E.outExpo(prog(f, 1.9, 2.4));
        ctx.fillStyle = C.gold; ctx.fillRect(W / 2 - 160 * lk, 742, 320 * lk, 2);
        text('LA PAGODA  ·  IN SVILUPPO  ·  PC 2027', W / 2, 800, { weight: 700, size: 20, family: 'Courier Prime', spacing: 4, align: 'center', color: '#9a9a9a', alpha: prog(f, 2.05, 2.35) });
        text(SITE_URL, W / 2, 858, { weight: 500, size: 32, spacing: 5, align: 'center', color: C.gold, alpha: prog(f, 2.3, 2.6) });
        flash(Math.pow(1 - prog(f, 0, 0.5), 2.2), '255,246,224');
        // chiusura: come all'inizio, lo schermo si spegne in un punto d'oro
        if (f >= 3.9) {
            const sy = 1 - E.outExpo(prog(f, 3.9, 4.05)) * 0.998;
            const sx = 1 - E.inExpo(prog(f, 4.02, 4.18)) * 0.999;
            crtSquash(sx, sy, prog(f, 3.9, 4.05) * 0.9);
        }
        if (f >= 4.16) { bg('#000'); goldDot(1 - prog(f, 4.18, 4.45), 3); }
    }

    // ---- HUD a mirino fotografico + post-produzione ----------------
    function hud(t) {
        let a = E.smooth(prog(t, 0.3, 0.8));
        if (t > T.GAMES + 1.6 && t < T.LAUNCHER + 0.3) a *= t < T.PAGODA ? 1 - prog(t, T.GAMES + 1.6, T.GAMES + 1.9) : prog(t, T.LAUNCHER, T.LAUNCHER + 0.3);
        a *= 1 - prog(t, T.END + 3.6, T.END + 3.9);
        if (t > T.BOOT + 2.35 && t < T.LOGO + 0.4) a *= prog(t, T.LOGO + 0.1, T.LOGO + 0.4);
        if (a <= 0) return;
        ctx.save(); ctx.globalAlpha = a;
        const m = 56, L = 38;
        ctx.strokeStyle = 'rgba(227,198,108,0.55)'; ctx.lineWidth = 2;
        [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
            ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke();
        });
        if (Math.floor(t * 1.6) % 2 === 0) { ctx.fillStyle = '#c43a3a'; ctx.beginPath(); ctx.arc(m + 26, m + 30, 6, 0, Math.PI * 2); ctx.fill(); }
        text('REC', m + 40, m + 36, { weight: 700, size: 16, family: 'Courier Prime', spacing: 3, color: '#9a9a9a' });
        text('KRIPIX ENTERTAINMENT — SHOWREEL', m + 96, m + 36, { weight: 400, size: 15, family: 'Courier Prime', spacing: 3, color: '#5f5f5f' });
        const fr = Math.floor(t * 30) % 30, sec = Math.floor(t);
        text(`TC 00:00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, W - m - 20, m + 36, { weight: 400, size: 15, family: 'Courier Prime', spacing: 2, align: 'right', color: '#7a7a7a' });
        const sec_ = SECTIONS.filter(([st]) => t >= st).pop();
        text(`[ ${sec_[1]} ]`, W - m - 20, H - m - 22, { weight: 700, size: 14, family: 'Courier Prime', spacing: 3, align: 'right', color: 'rgba(227,198,108,0.75)' });
        text('ISO 3200   f/2.8   1/48', m + 22, H - m - 22, { weight: 400, size: 14, family: 'Courier Prime', spacing: 2, color: '#4f4f4f' });
        ctx.restore();
    }
    function post(t) {
        const inPagoda = t >= T.PAGODA && t < T.LAUNCHER;
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = inPagoda ? 0.11 : 0.075;
        ctx.drawImage(grains[Math.floor(t * 24) % grains.length], 0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = inPagoda ? 0.7 : 1;
        ctx.drawImage(vignette, 0, 0);
        ctx.restore();
        // apertura dal nero
        const fin = 1 - prog(t, 0, 0.18);
        if (fin > 0) { ctx.fillStyle = `rgba(0,0,0,${fin})`; ctx.fillRect(0, 0, W, H); }
    }

    function renderAt(t) {
        t = clamp(t, 0, DURATION - 1e-6);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
        if (t < T.LOGO) sBoot(t);
        else if (t < T.STUDIO) sLogo(t);
        else if (t < T.GAMES) sStudio(t);
        else if (t < T.PAGODA) sGames(t);
        else if (t < T.LAUNCHER) sPagoda(t);
        else if (t < T.ECO) sLauncher(t);
        else if (t < T.END) sEco(t);
        else sEnd(t);
        hud(t);
        post(t);
    }

    return { renderAt, DURATION, W, H, events: buildEvents() };
}

// =====================================================================
//  EVENTI PER LA COLONNA SONORA (stessa coreografia del video)
// =====================================================================
export function buildEvents() {
    const ev = [];
    const push = (t, type, extra = {}) => ev.push({ t: +t.toFixed(4), type, ...extra });
    for (const [k, s] of Object.entries(TYPE)) {
        for (let i = 0; i < s.text.length; i++) {
            const c = s.text[i];
            push(s.t + i / s.cps, c === ' ' ? 'key_space' : 'key', { group: k });
        }
    }
    // pixel che atterrano nel logo (approssimati a gruppi)
    const R = rng(42);
    for (let i = 0; i < 160; i++) push(T.LOGO + 0.45 + 0.32 * (i / 160) + 0.08 * R() + 0.6, 'pixel');
    push(2.36, 'crt_off'); push(1.9, 'riser', { dur: 1.1 });
    push(T.LOGO, 'impact', { size: 1.0 });
    push(T.LOGO + 1.65, 'glint');
    push(T.LOGO + 3.7, 'glitch', { dur: 0.3 });
    push(T.STUDIO, 'hit'); push(T.STUDIO + 0.5, 'strike'); push(T.STUDIO + 1.0, 'hit_big');
    for (let i = 0; i < 4; i++) push(T.STUDIO + 2 + i * 0.5, 'pillar', { i });
    push(T.STUDIO + 3.82, 'glitch', { dur: 0.18 });
    push(T.GAMES, 'whoosh'); push(T.GAMES + 0.12, 'whoosh');
    push(T.GAMES + 0.95, 'riser_flash', { dur: 2.0 - 0.95 });
    push(T.PAGODA, 'shutter_flash');
    push(T.PAGODA + 1.0, 'title_flash');
    for (const f of footstepTimes()) push(T.PAGODA + f.s, 'step', { surface: f.surface, inside: f.inside });
    push(T.PAGODA + SCENE.DOOR_OPEN[0], 'door_open', { dur: SCENE.DOOR_OPEN[1] - SCENE.DOOR_OPEN[0] });
    push(T.PAGODA + SCENE.DOOR_CLOSE[1], 'door_slam');
    push(T.PAGODA + SCENE.SHADOW_PASS[0], 'presence', { dur: SCENE.SHADOW_PASS[1] - SCENE.SHADOW_PASS[0] });
    push(T.PAGODA + 1.6, 'thunder');
    push(T.PAGODA + 2.1, 'neon_flicker'); push(T.PAGODA + 7.5, 'neon_flicker'); push(T.PAGODA + 7.8, 'neon_flicker');
    push(T.PAGODA + 8.55, 'shutter_close');
    push(T.LAUNCHER, 'shutter_open');
    push(T.LAUNCHER + 0.1, 'whoosh');
    push(T.LAUNCHER + 1.08, 'click');
    push(T.LAUNCHER + 1.25, 'download', { dur: 1.6 });
    push(T.LAUNCHER + 2.9, 'chime');
    push(T.LAUNCHER + 3.78, 'glitch', { dur: 0.22 });
    push(T.ECO, 'hit');
    ECO.forEach((_, i) => push(T.ECO + 0.5 + i * 0.25, 'tile', { i }));
    push(T.ECO + 2.0, 'riser', { dur: 1.0 });
    push(T.ECO + 2.55, 'collapse');
    push(T.END, 'impact', { size: 1.3 });
    push(T.END + 1.15, 'glint');
    push(T.END + 3.9, 'crt_off');
    ev.sort((a, b) => a.t - b.t);
    return { duration: DURATION, bpm: BPM, sections: T, events: ev };
}
