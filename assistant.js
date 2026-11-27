// ============================================================
//  ASSISTANT.JS — Kripix Entertainment
//  Widget fluttuante della Kripix AI.
//
//  Compare in basso a destra su tutte le pagine, ma solo per gli
//  agenti con la beta attiva: chi non ce l'ha non vede nulla, così
//  il pulsante non promette una cosa che poi non si apre.
// ============================================================

import { app, auth } from './script.js';
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-functions.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const BENVENUTO = "Ciao. Dimmi cosa non funziona e vediamo di risolverlo. Se serve l'intervento di una persona, preparo io la richiesta.";

const ERRORI = {
    'permission-denied':   'Il tuo accesso alla beta non risulta più attivo.',
    'failed-precondition': "L'assistente non è ancora configurato lato server.",
    'unavailable':         'Il modello non risponde in questo momento. Riprova tra qualche istante.',
    'invalid-argument':    'Messaggio non valido: prova a riformularlo più corto.',
    'unauthenticated':     'Sessione scaduta. Ricarica la pagina e rientra.'
};

let storico = [];
let inviando = false;
let montato = false;


// ── COSTRUZIONE DEL WIDGET ──────────────────────────────────

function build() {
    const root = document.createElement('div');
    root.id = 'kripix-assistant';
    root.innerHTML = `
        <button type="button" class="ka-launcher" id="ka-launcher"
                aria-label="Apri Kripix AI" aria-expanded="false" aria-controls="ka-panel">
            <svg class="ka-icon-bot icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v3"/><rect x="4" y="6" width="16" height="12" rx="3"/>
                <circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/>
                <path d="M2 11v3"/><path d="M22 11v3"/><path d="M9.5 21h5"/>
            </svg>
            <svg class="ka-icon-close icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12"/><path d="M18 6L6 18"/>
            </svg>
        </button>

        <div class="ka-panel" id="ka-panel" role="dialog" aria-label="Kripix AI" aria-modal="false">
            <div class="ka-head">
                <span class="ka-avatar" aria-hidden="true">
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M12 3v3"/><rect x="4" y="6" width="16" height="12" rx="3"/>
                        <circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/>
                        <path d="M2 11v3"/><path d="M22 11v3"/><path d="M9.5 21h5"/>
                    </svg>
                </span>
                <div class="ka-title">
                    <strong>Kripix AI</strong>
                    <span class="ka-state"><i class="ka-dot"></i>Online</span>
                </div>
                <button type="button" class="ka-close" id="ka-close" aria-label="Chiudi">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>
                </button>
            </div>

            <div class="ka-log" id="ka-log" role="log" aria-live="polite"></div>

            <div class="ka-chips" id="ka-chips">
                <button type="button" class="ka-chip">Ho perso il telefono con l'app di autenticazione</button>
                <button type="button" class="ka-chip">Il launcher non parte</button>
                <button type="button" class="ka-chip">Non trovo la chiave del gioco</button>
            </div>

            <form class="ka-input" id="ka-form">
                <input type="text" id="ka-text" placeholder="Scrivi il tuo problema..." autocomplete="off" maxlength="1500" aria-label="Messaggio">
                <button type="submit" id="ka-send" aria-label="Invia">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>
                </button>
            </form>

            <p class="ka-foot">
                Assistente automatico: può sbagliare e non modifica il tuo account.
                Non scrivere password o codici. <a href="cookies.html">Informativa privacy</a>
            </p>
        </div>
    `;
    document.body.appendChild(root);
    return root;
}


// ── MESSAGGI ────────────────────────────────────────────────

function addMessage(log, role, text, ticketCode) {
    const div = document.createElement('div');
    div.className = 'ka-msg ' + role;
    // textContent, non innerHTML: la risposta di un modello non deve
    // poter iniettare markup nella pagina.
    div.textContent = text;

    if (ticketCode) {
        const nota = document.createElement('span');
        nota.className = 'ka-ticket';
        nota.textContent = `Richiesta aperta — codice ${ticketCode}`;
        div.appendChild(nota);
    }

    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
}

function showTyping(log) {
    const div = document.createElement('div');
    div.className = 'ka-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
}


// ── AVVIO ───────────────────────────────────────────────────

function mount(kripixAssistant) {
    if (montato) return;
    montato = true;

    const root = build();
    const launcher = root.querySelector('#ka-launcher');
    const panel = root.querySelector('#ka-panel');
    const log = root.querySelector('#ka-log');
    const form = root.querySelector('#ka-form');
    const input = root.querySelector('#ka-text');
    const send = root.querySelector('#ka-send');
    const chips = root.querySelector('#ka-chips');

    addMessage(log, 'bot', BENVENUTO);

    const setOpen = (open) => {
        root.classList.toggle('is-open', open);
        launcher.setAttribute('aria-expanded', String(open));
        launcher.setAttribute('aria-label', open ? 'Chiudi Kripix AI' : 'Apri Kripix AI');
        if (open) setTimeout(() => input.focus(), 260);
    };

    launcher.addEventListener('click', () => setOpen(!root.classList.contains('is-open')));
    root.querySelector('#ka-close').addEventListener('click', () => { setOpen(false); launcher.focus(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && root.classList.contains('is-open')) {
            setOpen(false);
            launcher.focus();
        }
    });

    async function invia(testo) {
        testo = (testo || '').trim();
        if (inviando || !testo) return;
        inviando = true;

        addMessage(log, 'user', testo);
        storico.push({ role: 'user', text: testo });
        input.value = '';
        chips.style.display = 'none';
        input.disabled = true;
        send.disabled = true;

        const typing = showTyping(log);

        try {
            const res = await kripixAssistant({ message: testo, history: storico.slice(0, -1) });
            typing.remove();

            const data = res.data || {};
            addMessage(log, 'bot', data.reply || 'Nessuna risposta.', data.ticketCode);
            storico.push({ role: 'model', text: data.reply || '' });

        } catch (e) {
            typing.remove();
            console.error('Kripix AI:', e);
            // Il codice serve a te per capire cosa è successo davvero
            const base = ERRORI[e.code] || 'Assistente non raggiungibile.';
            const dettaglio = e.message && e.code === 'unavailable' ? `\n${e.message}` : '';
            addMessage(log, 'bot error', `${base}${dettaglio}\n[${e.code || 'errore'}]`);
        } finally {
            inviando = false;
            input.disabled = false;
            send.disabled = false;
            input.focus();
        }
    }

    form.addEventListener('submit', (e) => { e.preventDefault(); invia(input.value); });
    chips.querySelectorAll('.ka-chip').forEach(chip => {
        chip.addEventListener('click', () => invia(chip.textContent));
    });
}


// ── INIZIALIZZAZIONE ────────────────────────────────────────

export function initAssistant() {
    const functions = getFunctions(app, 'europe-west1');
    const getBetaAccess = httpsCallable(functions, 'getBetaAccess');
    const kripixAssistant = httpsCallable(functions, 'kripixAssistant');

    onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        try {
            const res = await getBetaAccess();
            const programmi = (res.data && res.data.programs) || [];
            const ai = programmi.find(p => p.id === 'kripix-ai');
            if (ai && ai.status === 'active') mount(kripixAssistant);
        } catch (e) {
            // Nessun accesso o rete assente: semplicemente non compare
            console.debug('Kripix AI non disponibile:', e.code || e.message);
        }
    });
}
