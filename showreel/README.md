# 🎬 KRIPIX — Showreel

> *"A different way to see pixels."*

Showreel di ~33 secondi di Kripix Entertainment: lo studio, i giochi, **La Pagoda**, il **Kripix Launcher** e l'ecosistema (Pixel Otros, Kripix AI, Network Agenti, Kripix Store).

- **Video finale:** [`kripix-showreel.mp4`](kripix-showreel.mp4) — 1920×1080, 30 fps, H.264 + AAC
- **Versione interattiva:** [`index.html`](index.html) — lo stesso showreel generato dal vivo nel browser, con audio

Tutto è **procedurale**: nessun asset esterno oltre ai font del sito (Montserrat, Courier Prime) e a Three.js. Ogni fotogramma è una funzione pura del tempo (`renderAt(t)`), quindi il rendering è riproducibile e la colonna sonora è sincronizzata al fotogramma.

---

## 🎞️ Sequenza

| Tempo | Sezione | Cosa succede |
|---|---|---|
| 0:00 – 0:03 | **Segnale** | Terminale Kripix che si avvia, poi si spegne come un vecchio CRT in un punto d'oro |
| 0:03 – 0:07 | **Kripix** | Il punto esplode in pixel che compongono il logo KRIPIX / ENTERTAINMENT + tagline |
| 0:07 – 0:11 | **Studio** | "Non creiamo passatempi. Creiamo mondi." e i 4 pilastri dello studio |
| 0:11 – 0:13 | **Giochi** | Catalogo: La Pagoda e il Progetto Segreto. Carrello dentro il poster, il flash si carica… |
| 0:13 – 0:22 | **La Pagoda** | *Flash.* Scena 3D vista dal basso: Stefano Valenti attraversa la strada bagnata ed entra nel ristorante. Titolo in alto a sinistra |
| 0:22 – 0:26 | **Launcher** | Il Kripix Launcher in prospettiva: installazione de La Pagoda → GIOCA |
| 0:26 – 0:29 | **Ecosistema** | Pixel Otros, Kripix AI, Network Agenti, Kripix Store |
| 0:29 – 0:33 | **Finale** | Logo, tagline, sito — lo schermo si richiude nel punto d'oro dell'inizio |

La transizione verso La Pagoda usa la meccanica del gioco: **il flash della fotocamera** di Stefano.
Nella scena: neon "RISTORANTE" che sfarfalla, porte che si aprono da sole, l'ombra lunga verso la camera, il Maître (maschera da cervo) in fondo al corridoio e la sua sagoma che passa dietro il vetro dopo che la porta sbatte.

---

## 🛠️ Rigenerare il video

Requisiti: Node 18+, [Playwright](https://playwright.dev) con Chromium, `ffmpeg`, Python 3 con `numpy` e `scipy`.

```bash
# 1. esporta gli eventi audio (passi, digitazione, porte, flash...)
node tools/render.mjs --events

# 2. sintetizza la colonna sonora → assets/soundtrack.wav
python3 tools/soundtrack.py

# 3. renderizza il video → kripix-showreel.mp4
node tools/render.mjs
```

Opzioni utili di `tools/render.mjs`:

| Opzione | Effetto |
|---|---|
| `--fps 60` | rendering a 60 fps |
| `--workers 3` | numero di browser in parallelo |
| `--stills 3.5,15,24` | salva solo alcuni fotogrammi in PNG (anteprime veloci) |
| `--from 13 --to 22` | renderizza solo un intervallo |
| `--out file.mp4` | file di uscita |

Per vedere la versione interattiva serve un server locale (i moduli ES non funzionano da `file://`):

```bash
node tools/serve.mjs 8123
```

…poi apri `http://127.0.0.1:8123/` (anche `?t=13` per saltare a un istante).

---

## 📁 File

| File | Ruolo |
|---|---|
| `reel.js` | Regia: timeline, tipografia, logo a pixel, launcher, HUD a mirino, glitch, grana |
| `pagoda3d.js` | Scena 3D de La Pagoda: edificio a pagoda, pioggia, riflessi bagnati, Stefano (camminata procedurale), il Maître |
| `tools/render.mjs` | Rendering fotogramma per fotogramma con Chromium headless → ffmpeg |
| `tools/soundtrack.py` | Musica ed effetti sintetizzati, guidati da `assets/events.json` |
| `tools/serve.mjs` | Server statico minimale |
| `assets/` | Three.js r160 (MIT), font Montserrat e Courier Prime (OFL), audio |

Per cambiare l'URL nel finale modifica `SITE_URL` in `reel.js`.
