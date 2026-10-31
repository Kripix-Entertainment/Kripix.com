#!/usr/bin/env python3
"""
KRIPIX SHOWREEL — colonna sonora procedurale.

Legge assets/events.json (esportato da `node tools/render.mjs --events`)
e sintetizza musica + effetti perfettamente sincronizzati al video:
digitazione, pixel, flash della fotocamera, passi sulla strada bagnata,
la porta che cigola e sbatte, il click nel launcher...

    python3 tools/soundtrack.py            → assets/soundtrack.wav
Requisiti: numpy, scipy.
"""
import json
import wave
from pathlib import Path

import numpy as np
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
EV = json.loads((ROOT / "assets" / "events.json").read_text())
DUR = EV["duration"]
N = int(DUR * SR)
BEAT = 60 / EV["bpm"]
S = EV["sections"]
rng = np.random.default_rng(1977)

# bus stereo: dry e mandata al riverbero
dry = np.zeros((2, N))
verb = np.zeros((2, N))


# ---------------------------------------------------------------- utilità
def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def filt(x, kind, f, order=2):
    nyq = SR / 2
    if kind == "band":
        wn = [max(f[0], 10) / nyq, min(f[1], nyq * 0.98) / nyq]
    else:
        wn = min(max(f, 10), nyq * 0.98) / nyq
    sos = signal.butter(order, wn, btype={"low": "lowpass", "high": "highpass", "band": "bandpass"}[kind], output="sos")
    return signal.sosfilt(sos, x)


def sweep_filter(x, f0, f1, q=4.0, kind="band", steps=64):
    """Filtro che si apre/chiude nel tempo (a blocchi, sufficiente per i riser)."""
    out = np.zeros_like(x)
    n = len(x)
    edges = np.linspace(0, n, steps + 1).astype(int)
    for i in range(steps):
        a, b = edges[i], edges[i + 1]
        f = f0 * (f1 / f0) ** ((i + 0.5) / steps)
        pad = min(a, 2048)
        seg = x[a - pad:b]
        if kind == "band":
            y = filt(seg, "band", (f / (1 + 1 / q), f * (1 + 1 / q)))
        else:
            y = filt(seg, kind, f)
        out[a:b] = y[pad:]
    return out


def env_exp(d, tau, attack=0.002):
    t = tt(d)
    e = np.exp(-t / tau)
    a = np.minimum(1, t / max(attack, 1e-4))
    return e * a


def adsr(d, a, r):
    t = tt(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.minimum(1, (d - t) / max(r, 1e-4))


def saw(f, d, phase=0.0):
    t = tt(d)
    if np.isscalar(f):
        ph = f * t + phase
    else:
        ph = np.cumsum(f) / SR + phase
    return 2 * (ph % 1) - 1


def sine(f, d, phase=0.0):
    t = tt(d)
    if np.isscalar(f):
        return np.sin(2 * np.pi * f * t + phase)
    return np.sin(2 * np.pi * np.cumsum(f) / SR + phase)


def place(x, t0, gain=1.0, pan=0.0, send=0.0):
    """Mixa un segnale mono nel bus (pan -1..1, send = mandata riverbero)."""
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    if i0 < 0:
        x = x[-i0:]
        i0 = 0
    x = x[: N - i0] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    dry[0, i0:i0 + len(x)] += x * l * 1.414
    dry[1, i0:i0 + len(x)] += x * r * 1.414
    if send:
        verb[0, i0:i0 + len(x)] += x * l * send
        verb[1, i0:i0 + len(x)] += x * r * send


def place_st(xl, xr, t0, gain=1.0, send=0.0):
    i0 = int(round(t0 * SR))
    n = min(len(xl), N - i0)
    dry[0, i0:i0 + n] += xl[:n] * gain
    dry[1, i0:i0 + n] += xr[:n] * gain
    if send:
        verb[0, i0:i0 + n] += xl[:n] * gain * send
        verb[1, i0:i0 + n] += xr[:n] * gain * send


def note(n):
    """Nome nota → Hz (A4 = 440)."""
    names = {"C": -9, "C#": -8, "Db": -8, "D": -7, "D#": -6, "Eb": -6, "E": -5, "F": -4, "F#": -3, "Gb": -3, "G": -2, "G#": -1, "Ab": -1, "A": 0, "A#": 1, "Bb": 1, "B": 2}
    name, octv = n[:-1], int(n[-1])
    return 440.0 * 2 ** ((names[name] + (octv - 4) * 12) / 12)


# ---------------------------------------------------------------- strumenti
def kick(gain=1.0):
    d = 0.5
    t = tt(d)
    f = 45 + 110 * np.exp(-t / 0.035)
    x = sine(f, d) * env_exp(d, 0.18)
    click = np.zeros_like(x)
    click[:480] = filt(noise(0.01), "band", (1500, 6000))[:480] * np.linspace(1, 0, 480)
    return np.tanh((x + click * 0.4) * 1.6) * gain


def snare(gain=1.0):
    d = 0.35
    n = filt(noise(d), "band", (900, 7000)) * env_exp(d, 0.09)
    tone = sine(190, d) * env_exp(d, 0.05)
    return (n * 0.9 + tone * 0.6) * gain


def hat(gain=1.0, open_=False):
    d = 0.25 if open_ else 0.06
    return filt(noise(d), "high", 7500) * env_exp(d, 0.08 if open_ else 0.018) * gain


def pad(freqs, d, cutoff=1800, detune=0.12, a=0.6, r=1.2, voices=3):
    x = np.zeros(int(d * SR))
    for f in freqs:
        for v in range(voices):
            dt = (v - (voices - 1) / 2) * detune
            x += saw(f * 2 ** (dt / 12), d, phase=rng.random())
    x = filt(x, "low", cutoff, 2) / (len(freqs) * voices)
    return x * adsr(d, a, r)


def bass_note(f, d, cutoff=520):
    x = saw(f, d) * 0.7 + saw(f * 0.5, d) * 0.5 + sine(f * 0.5, d) * 0.6
    e = env_exp(d, d * 0.9, 0.004)
    x = filt(x, "low", cutoff, 2) * e
    return np.tanh(x * 1.4)


def bell(f, d=1.6, gain=1.0):
    x = (sine(f, d) + 0.5 * sine(f * 2.76, d) * env_exp(d, 0.25) + 0.25 * sine(f * 5.4, d) * env_exp(d, 0.1))
    return x * env_exp(d, 0.5, 0.001) * gain


def key_click(soft=False):
    d = 0.03
    x = filt(noise(d), "band", (1800, 7000)) * env_exp(d, 0.004)
    x += sine(rng.uniform(900, 1300), d) * env_exp(d, 0.003) * 0.4
    return x * (0.35 if soft else 1.0) * rng.uniform(0.6, 1.0)


def whoosh(d=0.6, up=True, gain=1.0):
    x = noise(d)
    x = sweep_filter(x, 300 if up else 6000, 6000 if up else 300, q=2.5)
    e = np.sin(np.pi * np.clip(tt(d) / d, 0, 1)) ** 1.5
    return x * e * gain


def braam(root, d=3.5, gain=1.0):
    t = tt(d)
    x = np.zeros(len(t))
    for mul, g in [(1, 1), (1.5, 0.6), (2, 0.5), (2.0 * 2 ** (1 / 12), 0.25)]:
        for v in (-0.08, 0.0, 0.09):
            x += saw(root * mul * 2 ** (v / 12), d, phase=rng.random()) * g
    # filtro che si chiude: ottone cinematografico
    x = sweep_filter(x, 2400, 180, kind="low", steps=48)
    x = np.tanh(x * 0.6) * env_exp(d, 1.3, 0.01)
    sub = sine(root / 2 + 30 * np.exp(-t / 0.08), d) * env_exp(d, 0.9, 0.003)
    boom = filt(noise(d), "low", 220) * env_exp(d, 0.35) * 2.5
    return (x * 0.55 + sub * 0.9 + boom * 0.6) * gain


def zap_down(d=0.3):
    t = tt(d)
    f = 2400 * np.exp(-t / 0.07) + 60
    return sine(f, d) * env_exp(d, 0.12) + filt(noise(d), "high", 3000) * env_exp(d, 0.03) * 0.3


def shutter_click():
    """Otturatore meccanico: due scatti ravvicinati."""
    x = np.zeros(int(0.12 * SR))
    for off, g in ((0.0, 1.0), (0.045, 0.7)):
        c = filt(noise(0.03), "band", (1200, 8000)) * env_exp(0.03, 0.004)
        c += sine(2600, 0.03) * env_exp(0.03, 0.002) * 0.4
        i = int(off * SR)
        x[i:i + len(c)] += c * g
    return x


def glitch_burst(d=0.25):
    n = int(d * SR)
    x = np.zeros(n)
    i = 0
    while i < n:
        seg = int(rng.uniform(0.008, 0.04) * SR)
        f = rng.choice([80, 160, 330, 660, 1320, 2500, 4400])
        s = np.sign(np.sin(2 * np.pi * f * np.arange(seg) / SR)) * rng.uniform(0.2, 1)
        if rng.random() < 0.3:
            s = rng.standard_normal(seg)
        x[i:i + seg] = s[: n - i]
        i += seg
    x = np.round(x * 6) / 6  # bitcrush
    return filt(x, "low", 9000) * adsr(d, 0.003, 0.02)


# ================================================================= MUSICA
bar = 2 * 2 * BEAT  # 4 battiti = 2 s

# 00 · drone di apertura + statico
d0 = S["LOGO"]
x = (sine(55, d0) * 0.5 + filt(saw(55, d0), "low", 220) * 0.4) * np.linspace(0, 1, int(d0 * SR)) ** 1.5
place(x, 0, 0.45)
st = filt(noise(d0), "band", (2000, 9000)) * 0.05 * (0.6 + 0.4 * (rng.random(int(d0 * SR)) > 0.995))
place(st * np.linspace(0.4, 1, len(st)), 0, 0.5, pan=0.2)

# 01 · pad dopo l'impatto (La minore add9)
place(pad([note("A2"), note("E3"), note("B3"), note("C4"), note("E4")], 4.2, cutoff=1500, a=0.25, r=1.0), S["LOGO"], 0.5, send=0.35)
place(pad([note("A1")], 4.0, cutoff=300, a=0.05, r=1.0, voices=2), S["LOGO"], 0.5)
# pulsazione leggera mentre il logo si posa
for i in range(int((S["STUDIO"] - (S["LOGO"] + 2.0)) / BEAT)):
    place(kick(0.35), S["LOGO"] + 2.0 + i * BEAT)

# 02 · STUDIO: groove (La minore → Fa)
chords_studio = [("A", ["A2", "C3", "E3", "A3"]), ("F", ["F2", "A2", "C3", "F3"])]
for bi, (root, ch) in enumerate(chords_studio):
    t0 = S["STUDIO"] + bi * bar
    place(pad([note(n) for n in ch], bar, cutoff=1300, a=0.05, r=0.3), t0, 0.32, send=0.2)
    rf = note(ch[0]) / 2
    for k in range(8):
        place(bass_note(rf, BEAT / 2 * 0.95), t0 + k * BEAT / 2, 0.5)
for i in range(8):
    tb = S["STUDIO"] + i * BEAT
    place(kick(0.9), tb)
    if i >= 2:
        place(hat(0.25), tb + BEAT / 2, pan=0.3)
    if i >= 4 and i % 2 == 1:
        place(snare(0.55), tb, send=0.2)
for k in range(4):  # rullata finale verso i giochi
    place(snare(0.25 + 0.1 * k), S["GAMES"] - 0.5 + k * BEAT / 4, send=0.15)

# 03 · GIOCHI: kick + carica del flash (la musica si ferma prima dell'esplosione)
place(pad([note("D3"), note("F3"), note("A3"), note("C4")], 2.0, cutoff=1100, a=0.05, r=0.05), S["GAMES"], 0.28, send=0.2)
place(kick(0.9), S["GAMES"]); place(kick(0.8), S["GAMES"] + BEAT)
roll_t = S["GAMES"] + 1.0
k = 0
while roll_t < S["PAGODA"] - 0.05:
    place(snare(0.15 + 0.5 * (roll_t - S["GAMES"] - 1.0)), roll_t, send=0.15)
    k += 1
    roll_t += BEAT / 4 if roll_t < S["GAMES"] + 1.5 else BEAT / 8

# 04 · PAGODA: drone horror (Re + Mib), pioggia, neon
dp = S["LAUNCHER"] - S["PAGODA"]
p0 = S["PAGODA"]
t = tt(dp)
drone = (sine(note("D2"), dp) * 0.5 + sine(note("Eb2"), dp) * 0.3 + filt(saw(note("D1"), dp), "low", 160) * 0.6)
drone *= np.minimum(1, t / 1.5) * np.minimum(1, (dp - t) / 0.4) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.23 * t))
place(drone, p0, 0.42)
glass = sine(2093 + 6 * np.sin(2 * np.pi * 0.4 * t), dp) * 0.05 * np.minimum(1, t / 3) * np.minimum(1, (dp - t) / 0.3)
place(glass, p0, 0.6, pan=-0.3, send=0.5)
# pioggia stereo
rain_l = filt(filt(noise(dp), "high", 500), "low", 9000)
rain_r = filt(filt(noise(dp), "high", 500), "low", 9000)
renv = np.minimum(1, t / 0.6) * np.minimum(1, (dp - t) / 0.35)
place_st(rain_l * renv * 0.11, rain_r * renv * 0.11, p0)
for _ in range(900):  # gocce
    dt_ = rng.uniform(0, dp - 0.1)
    drop = filt(noise(0.02), "band", (2500, 9000)) * env_exp(0.02, 0.003)
    place(drop, p0 + dt_, rng.uniform(0.04, 0.15) * renv[int(dt_ * SR)], pan=rng.uniform(-1, 1))
# ronzio del neon (si spegne negli sfarfallii)
hum = sum(sine(120 * h, dp) / h for h in (1, 2, 3, 5)) * 0.04
place(hum * renv, p0, 1.0, pan=0.6)

# 05 · LAUNCHER + 06 · ECOSISTEMA: groove più luminoso (La- Fa Do Sol)
prog_ = [["A2", "C3", "E3", "A3"], ["F2", "A2", "C3", "F3"], ["C3", "E3", "G3", "C4"], ["G2", "B2", "D3", "G3"]]
for bi in range(4):
    t0 = S["LAUNCHER"] + bi * bar
    if t0 >= S["END"]:
        break
    ln = min(bar, S["END"] - t0)
    ch = prog_[bi % 4]
    place(pad([note(n) for n in ch], ln, cutoff=1700, a=0.08, r=0.25), t0, 0.3, send=0.25)
    rf = note(ch[0]) / 2
    for k in range(int(ln / (BEAT / 2))):
        tk = t0 + k * BEAT / 2
        if tk >= S["END"] - 0.1:
            break
        place(bass_note(rf * (2 if k % 4 == 3 else 1), BEAT / 2 * 0.9, cutoff=650), tk, 0.45)
i = 0
while True:
    tb = S["LAUNCHER"] + 0.5 + i * BEAT
    if tb >= S["END"] - 0.1:
        break
    place(kick(0.9), tb)
    place(hat(0.22), tb + BEAT / 2, pan=0.3)
    place(hat(0.12), tb + BEAT / 4, pan=-0.3)
    if i % 2 == 1:
        place(snare(0.5), tb, send=0.2)
    i += 1
k = 0
rt = S["END"] - 1.0
while rt < S["END"] - 0.06:
    place(snare(0.2 + 0.5 * (rt - (S["END"] - 1.0))), rt, send=0.2)
    rt += BEAT / 4 if rt < S["END"] - 0.5 else BEAT / 8

# 07 · FINALE: accordo pieno che si spegne
de = DUR - S["END"]
place(pad([note("A1"), note("A2"), note("E3"), note("B3"), note("C4"), note("E4")], de, cutoff=2200, a=0.02, r=1.6), S["END"], 0.85, send=0.45)
place(sine(note("A1"), de) * adsr(de, 0.05, 1.8) * 0.5, S["END"], 0.6)
place(pad([note("E5"), note("B5")], de, cutoff=5000, a=1.2, r=1.5, voices=2), S["END"], 0.08, send=0.6)

# ================================================================= EFFETTI
for e in EV["events"]:
    ty, t0 = e["type"], e["t"]
    if ty == "key":
        place(key_click(), t0, 0.32, pan=rng.uniform(-0.2, 0.2))
    elif ty == "key_space":
        place(key_click(True), t0, 0.3)
    elif ty == "pixel":
        f = note(rng.choice(["A5", "C6", "E6", "G6", "A6", "C7", "E7"]))
        d = 0.06
        place(sine(f, d) * env_exp(d, 0.015), t0, 0.06, pan=rng.uniform(-0.8, 0.8), send=0.3)
    elif ty == "riser":
        d = e["dur"]
        x = sweep_filter(noise(d), 200, 7000, q=3) * (tt(d) / d) ** 2
        x += sine(300 * (8 ** (tt(d) / d)), d) * (tt(d) / d) ** 3 * 0.15
        place(x, t0, 0.5, send=0.2)
    elif ty == "riser_flash":
        # il condensatore del flash che si carica: fischio che sale
        d = e["dur"] + 0.02
        u = tt(d) / d
        f = 1400 * (7 ** u) * (1 + 0.004 * np.sin(2 * np.pi * 9 * tt(d)))
        x = sine(f, d) * u ** 1.6 * 0.5 + sweep_filter(noise(d), 300, 8000, q=2) * u ** 2.5 * 0.6
        place(x, t0, 0.55, send=0.1)
    elif ty == "crt_off":
        place(zap_down(), t0, 0.5, send=0.2)
    elif ty == "impact":
        sz = e.get("size", 1.0)
        place(braam(note("A1"), 4.5, sz), t0, 0.8, send=0.45)
        place(shutter_click(), t0 - 0.01, 0.4)
    elif ty == "shutter_flash":
        place(shutter_click(), t0 - 0.01, 0.9)
        pop = filt(noise(0.4), "high", 1500) * env_exp(0.4, 0.06)
        place(pop, t0, 0.6, send=0.4)
        place(braam(note("D1") * 2, 5.0, 1.1), t0, 0.75, send=0.5)
    elif ty == "title_flash":
        for i in range(9):
            pop = filt(noise(0.08), "band", (2000, 9000)) * env_exp(0.08, 0.012) + sine(3000 + i * 180, 0.08) * env_exp(0.08, 0.01) * 0.3
            place(pop, t0 + i * 0.055, 0.2, pan=-0.6 + i * 0.08, send=0.4)
    elif ty == "glint":
        place(bell(note("E6"), 2.0) + 0.6 * bell(note("B6"), 2.0), t0 + 0.15, 0.08, pan=0.2, send=0.7)
        place(whoosh(0.5, True, 0.5), t0, 0.15)
    elif ty == "glitch":
        place(glitch_burst(e.get("dur", 0.25)), t0, 0.22, pan=rng.uniform(-0.4, 0.4))
    elif ty in ("hit", "hit_big"):
        big = ty == "hit_big"
        th = sine(70 + 60 * np.exp(-tt(0.6) / 0.05), 0.6) * env_exp(0.6, 0.25 if big else 0.15)
        place(th + filt(noise(0.6), "low", 900) * env_exp(0.6, 0.06), t0, 0.7 if big else 0.5, send=0.35)
        if big:
            place(bell(note("A5"), 2.0), t0, 0.06, send=0.6)
    elif ty == "strike":
        x = filt(noise(0.25), "band", (1500, 7000)) * np.linspace(0, 1, int(0.25 * SR)) ** 0.5 * env_exp(0.25, 0.08)
        place(x, t0, 0.35, pan=0.3)
    elif ty == "pillar":
        n_ = ["A4", "C5", "E5", "A5"][e["i"]]
        place(bell(note(n_), 1.0), t0, 0.08, send=0.5)
        place(filt(noise(0.2), "low", 600) * env_exp(0.2, 0.04), t0, 0.4)
    elif ty == "whoosh":
        place(whoosh(0.55, True, 1.0), t0 - 0.1, 0.3, pan=rng.uniform(-0.3, 0.3))
    elif ty == "step":
        inside = e.get("inside", False)
        stone = e["surface"] == "stone"
        d = 0.3
        thump = sine(70 + 40 * np.exp(-tt(d) / 0.02), d) * env_exp(d, 0.04)
        if stone:
            heel = filt(noise(d), "band", (900, 4500)) * env_exp(d, 0.012)
            x = thump * 0.8 + heel * 0.9
        else:
            splash = filt(noise(d), "band", (700, 5000)) * env_exp(d, 0.07, 0.006)
            x = thump * 0.8 + splash * 0.75
        if inside:
            x = filt(x, "low", 1400) * 0.7
        place(x, t0, 0.55, pan=-0.05, send=0.25)
    elif ty == "thunder":
        d = 4.0
        x = filt(noise(d), "low", 140, 4) * (1 - np.exp(-tt(d) / 0.3)) * np.exp(-tt(d) / 1.3)
        x += filt(noise(d), "low", 500) * env_exp(d, 0.4) * 0.3
        place(x * 3, t0, 0.5, pan=-0.4, send=0.5)
    elif ty == "neon_flicker":
        d = 0.35
        crackle = filt(noise(d), "high", 2500) * (rng.random(int(d * SR)) > 0.97) * 3
        buzz = sine(120, d) * np.sign(np.sin(2 * np.pi * 30 * tt(d))) * 0.3
        place((crackle + buzz) * env_exp(d, 0.12), t0, 0.22, pan=0.6)
    elif ty == "door_open":
        # cigolio: treno di impulsi a frequenza variabile filtrato su risonanze del legno
        d = e["dur"] + 0.3
        u = tt(d) / d
        rate = 28 + 40 * np.sin(np.pi * u) + 8 * np.sin(2 * np.pi * 3.1 * tt(d))
        ph = np.cumsum(rate) / SR
        pulses = (np.diff(np.floor(ph), prepend=0) > 0).astype(float)
        x = filt(pulses, "band", (500, 900)) * 3 + filt(pulses, "band", (1300, 1800)) * 2 + filt(pulses, "band", (2600, 3200))
        x *= adsr(d, 0.15, 0.3)
        place(x, t0, 0.55, send=0.5)
        # alito di aria calda che esce
        place(whoosh(1.4, False, 0.6), t0 + 0.2, 0.25, send=0.4)
    elif ty == "door_slam":
        d = 1.5
        x = sine(55 + 50 * np.exp(-tt(d) / 0.04), d) * env_exp(d, 0.25) * 1.4
        x += filt(noise(d), "low", 700) * env_exp(d, 0.08) * 1.4
        x += filt(noise(d), "band", (1500, 4000)) * env_exp(d, 0.015) * 0.6
        place(np.tanh(x * 1.3), t0, 0.95, send=0.7)
        place(braam(note("D1"), 3.0, 0.5), t0, 0.5, send=0.5)
    elif ty == "presence":
        # un respiro dietro la porta + cluster dissonante
        d = 2.2
        br = filt(noise(d), "band", (300, 1400)) * np.sin(np.pi * np.clip(tt(d) / 1.1, 0, 1)) ** 2
        cl = (sine(note("D3"), d) + sine(note("Eb3"), d) + sine(note("Ab3"), d)) * adsr(d, 0.6, 1.2) * 0.15
        place(br * 0.5 + cl, t0 - 0.2, 0.55, pan=-0.2, send=0.6)
    elif ty == "shutter_close":
        place(shutter_click(), t0 + 0.32, 0.8, send=0.2)
        place(whoosh(0.4, False, 0.5), t0, 0.3)
    elif ty == "shutter_open":
        place(shutter_click(), t0, 0.5)
    elif ty == "click":
        c = filt(noise(0.02), "band", (2000, 6000)) * env_exp(0.02, 0.003) + sine(1800, 0.02) * env_exp(0.02, 0.002)
        place(c, t0, 0.6)
    elif ty == "download":
        d = e["dur"]
        u = tt(d) / d
        x = sine(300 * (4 ** u), d) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 24 * tt(d)))) * 0.25
        x = filt(x, "low", 4000) * adsr(d, 0.1, 0.1)
        place(x, t0, 0.18, pan=0.3)
    elif ty == "chime":
        for i, n_ in enumerate(["E6", "B6", "E7"]):
            place(bell(note(n_), 2.2), t0 + i * 0.07, 0.11, send=0.6)
    elif ty == "tile":
        n_ = ["A5", "C6", "E6", "A6"][e["i"]]
        d = 0.5
        sq = filt(np.sign(sine(note(n_), d)), "low", 3500) * env_exp(d, 0.12)
        place(sq, t0, 0.07, pan=-0.45 + e["i"] * 0.3, send=0.4)
        place(filt(noise(0.15), "low", 900) * env_exp(0.15, 0.03), t0, 0.35)
    elif ty == "collapse":
        d = 0.4
        x = whoosh(d, False, 1.0)[::-1]
        place(x, t0, 0.35)

# ================================================================= MIX
# riverbero: risposta all'impulso sintetica (rumore che decade, stereo)
ir_d = 2.8
ir_t = tt(ir_d)
ir = np.stack([filt(noise(ir_d), "low", 6000) * np.exp(-ir_t / 0.75) for _ in range(2)])
ir[:, : int(0.012 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([signal.fftconvolve(verb[c], ir[c])[:N] for c in range(2)])
mix = dry + wet * 0.55

# ducking leggero sul basso quando entra la pioggia? no: solo master
mix = np.stack([filt(mix[c], "high", 28) for c in range(2)])
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25)
# dissolvenze di sicurezza
fade = int(0.01 * SR)
mix[:, :fade] *= np.linspace(0, 1, fade)
mix[:, -int(0.25 * SR):] *= np.linspace(1, 0, int(0.25 * SR)) ** 2
mix *= 10 ** (-1 / 20)  # -1 dBFS

out = ROOT / "assets" / "soundtrack.wav"
pcm = (np.clip(mix.T, -1, 1) * 32767).astype("<i2")
with wave.open(str(out), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-9)
print(f"Colonna sonora: {out.relative_to(ROOT)}  ({DUR:.1f}s, RMS {rms:.1f} dBFS)")
