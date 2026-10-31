// =====================================================================
//  Rendering dello showreel in MP4.
//
//  node tools/render.mjs                      → kripix-showreel.mp4 (1080p30)
//  node tools/render.mjs --fps 60             → 60 fotogrammi al secondo
//  node tools/render.mjs --stills 3.5,14,24   → PNG di singoli istanti
//  node tools/render.mjs --events             → assets/events.json + logo-events.json (per l'audio)
//  node tools/render.mjs --mode logo           → kripix-logo-intro.mp4 (solo l'apparizione del logo)
//
//  Richiede: Playwright (Chromium) e ffmpeg nel PATH.
// =====================================================================
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i < 0 ? def : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const FPS = Number(opt('fps', 30));
const WORKERS = Number(opt('workers', Math.max(1, Math.min(3, Math.floor(os.cpus().length / 2)))));
const LOGO = opt('mode', 'reel') === 'logo';
const FN = LOGO ? 'renderLogoIntro' : 'renderAt';
const OUT = path.resolve(ROOT, opt('out', LOGO ? 'kripix-logo-intro.mp4' : 'kripix-showreel.mp4'));
const AUDIO = LOGO ? ['logo-intro.wav', 'logo-intro.m4a'] : ['soundtrack.wav', 'soundtrack.m4a'];
const TMP = path.resolve(opt('tmp', path.join(os.tmpdir(), 'kripix-reel')));
const STILLS = opt('stills', null);
const STILLS_DIR = path.resolve(opt('stills-dir', path.join(TMP, 'stills')));
const FROM = Number(opt('from', 0));
const TO = opt('to', null);

const run = (cmd, a, input) => new Promise((res, rej) => {
    const p = spawn(cmd, a, { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    p.on('error', rej); p.on('exit', (c) => (c === 0 ? res() : rej(new Error(`${cmd} exit ${c}`))));
    if (input) input(p.stdin);
});

async function openPage(port) {
    const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('[pagina]', e.message));
    page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text()); });
    await page.goto(`http://127.0.0.1:${port}/index.html?render`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 180000 });
    return { browser, page };
}
const shot = (page) => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });

const srv = await serve(0);
const port = srv.address().port;
fs.mkdirSync(TMP, { recursive: true });

try {
    if (opt('events', false)) {
        const { browser, page } = await openPage(port);
        for (const [key, name] of [['events', 'events.json'], ['logoEvents', 'logo-events.json']]) {
            const ev = await page.evaluate((k) => window.reel[k], key);
            const file = path.join(ROOT, 'assets', name);
            fs.writeFileSync(file, JSON.stringify(ev, null, 1));
            console.log(`Eventi audio: ${ev.events.length} → ${path.relative(ROOT, file)}`);
        }
        await browser.close();
    } else if (STILLS) {
        fs.mkdirSync(STILLS_DIR, { recursive: true });
        const { browser, page } = await openPage(port);
        for (const ts of String(STILLS).split(',')) {
            const t0 = Date.now();
            await page.evaluate(([fn, t]) => window.reel[fn](t), [FN, Number(ts)]);
            fs.writeFileSync(path.join(STILLS_DIR, `still_${Number(ts).toFixed(2)}.png`), await shot(page));
            console.log(`t=${ts}s  ${Date.now() - t0}ms`);
        }
        await browser.close();
    } else {
        const duration = await (async () => { const { browser, page } = await openPage(port); const d = await page.evaluate((logo) => (logo ? window.reel.LOGO_INTRO.duration : window.reel.DURATION), LOGO); await browser.close(); return d; })();
        const end = TO ? Number(TO) : duration;
        const first = Math.round(FROM * FPS), last = Math.round(end * FPS); // [first, last)
        const total = last - first;
        const per = Math.ceil(total / WORKERS);
        console.log(`Rendering ${total} fotogrammi a ${FPS} fps con ${WORKERS} worker...`);
        let done = 0; const t0 = Date.now();
        const segs = [];
        await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
            const a = first + w * per, b = Math.min(last, a + per);
            if (a >= b) return;
            const seg = path.join(TMP, `seg_${String(w).padStart(2, '0')}.mp4`);
            segs[w] = seg;
            const { browser, page } = await openPage(port);
            await run('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-g', String(FPS * 2), seg], async (stdin) => {
                for (let f = a; f < b; f++) {
                    await page.evaluate(([fn, t]) => window.reel[fn](t), [FN, f / FPS]);
                    const buf = await shot(page);
                    if (!stdin.write(buf)) await new Promise((r) => stdin.once('drain', r));
                    done++;
                    if (done % 30 === 0) {
                        const el = (Date.now() - t0) / 1000, eta = el / done * (total - done);
                        process.stdout.write(`\r  ${done}/${total}  ${(done / el).toFixed(2)} fps  ETA ${Math.round(eta)}s   `);
                    }
                }
                stdin.end();
            });
            await browser.close();
        }));
        console.log(`\nSegmenti pronti in ${Math.round((Date.now() - t0) / 1000)}s. Montaggio...`);
        const list = path.join(TMP, 'segments.txt');
        fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${s}'`).join('\n'));
        const video = path.join(TMP, 'video.mp4');
        await run('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
        // audio: la WAV appena sintetizzata, altrimenti la versione compressa del repo
        const wav = AUDIO.map((f) => path.join(ROOT, 'assets', f)).find((f) => fs.existsSync(f));
        const audioIn = wav ? ['-ss', String(FROM), '-i', wav] : [];
        await run('ffmpeg', ['-loglevel', 'error', '-y', '-i', video, ...audioIn,
            '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-tune', 'film',
            ...(audioIn.length ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
            '-movflags', '+faststart', '-metadata', `title=Kripix Entertainment — ${LOGO ? 'Logo' : 'Showreel'}`, OUT]);
        console.log(`Fatto: ${path.relative(process.cwd(), OUT)}`);
    }
} finally {
    srv.close();
}
