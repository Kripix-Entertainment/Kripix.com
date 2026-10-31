// Server statico minimale per lo showreel (i moduli ES non funzionano da file://).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.mp4': 'video/mp4', '.png': 'image/png', '.css': 'text/css' };

export function serve(port = 0) {
    return new Promise((resolve) => {
        const srv = http.createServer((req, res) => {
            const url = decodeURIComponent(req.url.split('?')[0]);
            const file = path.join(ROOT, url === '/' ? 'index.html' : url);
            if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
            res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
            fs.createReadStream(file).pipe(res);
        });
        srv.listen(port, '127.0.0.1', () => resolve(srv));
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const port = Number(process.argv[2] || 8123);
    serve(port).then(() => console.log(`Showreel su http://127.0.0.1:${port}/`));
}
