// ============================================================
//  TWOFACTOR.JS — Kripix Entertainment
//  Pezzi di interfaccia condivisi dalla verifica in due passaggi:
//  il QR di attivazione, il campo per il codice a 6 cifre e la
//  traduzione degli errori Firebase in messaggi leggibili.
//
//  Il segreto TOTP non lascia mai il browser: il QR viene disegnato
//  in locale, senza chiamare servizi esterni.
// ============================================================

import qrcode from './vendor/qrcode.js';


// ── QR CODE ─────────────────────────────────────────────────

/**
 * Disegna l'otpauth:// come QR dentro il contenitore indicato.
 * @param {HTMLElement} container
 * @param {string} uri  URI otpauth generato da Firebase
 */
export function renderQrCode(container, uri) {
    // Livello di correzione M: regge bene anche se lo schermo è sporco
    // o la fotocamera è storta, senza gonfiare troppo la griglia.
    const qr = qrcode(0, 'M');
    qr.addData(uri);
    qr.make();

    container.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    const svg = container.querySelector('svg');
    if (svg) {
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', 'Codice QR per l\'app di autenticazione');
    }
}


// ── CAMPO CODICE A 6 CIFRE ──────────────────────────────────

/**
 * Costruisce sei caselle da una cifra con avanzamento automatico,
 * gestione di incolla, backspace e frecce.
 *
 * @param {HTMLElement} container
 * @param {{ onComplete?: (code: string) => void }} [options]
 * @returns {{ value: () => string, clear: () => void, focus: () => void, setDisabled: (b: boolean) => void }}
 */
export function createCodeInput(container, options = {}) {
    const LENGTH = 6;
    container.innerHTML = '';
    container.classList.add('code-input');
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', `Codice di verifica a ${LENGTH} cifre`);

    const boxes = [];

    for (let i = 0; i < LENGTH; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'numeric';
        input.autocomplete = i === 0 ? 'one-time-code' : 'off';
        input.maxLength = 1;
        input.className = 'code-digit';
        input.setAttribute('aria-label', `Cifra ${i + 1} di ${LENGTH}`);
        container.appendChild(input);
        boxes.push(input);
    }

    const value = () => boxes.map(b => b.value).join('');

    const notifyIfComplete = () => {
        const code = value();
        if (code.length === LENGTH && options.onComplete) options.onComplete(code);
    };

    /** Distribuisce una sequenza di cifre a partire da una casella. */
    const fill = (startIndex, digits) => {
        let i = startIndex;
        for (const d of digits) {
            if (i >= LENGTH) break;
            boxes[i].value = d;
            boxes[i].classList.add('filled');
            i++;
        }
        boxes[Math.min(i, LENGTH - 1)].focus();
        notifyIfComplete();
    };

    boxes.forEach((box, index) => {
        box.addEventListener('input', () => {
            const digits = box.value.replace(/\D/g, '');

            if (!digits) {
                box.value = '';
                box.classList.remove('filled');
                return;
            }

            // Se l'utente digita (o l'OTP di sistema inserisce) più cifre
            // in una volta, le spalmiamo sulle caselle successive.
            box.value = '';
            fill(index, digits);
        });

        box.addEventListener('keydown', (e) => {
            // Invio conferma il codice senza dover cliccare
            if (e.key === 'Enter') {
                e.preventDefault();
                if (value().length === LENGTH && options.onComplete) options.onComplete(value());
                return;
            }
            if (e.key === 'Backspace' && !box.value && index > 0) {
                e.preventDefault();
                boxes[index - 1].value = '';
                boxes[index - 1].classList.remove('filled');
                boxes[index - 1].focus();
            }
            if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); boxes[index - 1].focus(); }
            if (e.key === 'ArrowRight' && index < LENGTH - 1) { e.preventDefault(); boxes[index + 1].focus(); }
        });

        box.addEventListener('paste', (e) => {
            e.preventDefault();
            const digits = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            if (digits) fill(index, digits);
        });

        box.addEventListener('focus', () => box.select());
    });

    return {
        value,
        clear() {
            boxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
            boxes[0].focus();
        },
        focus() { boxes[0].focus(); },
        setDisabled(disabled) { boxes.forEach(b => { b.disabled = disabled; }); },
    };
}


// ── ERRORI ──────────────────────────────────────────────────

/**
 * Traduce i codici di errore Firebase in messaggi comprensibili.
 * @param {{code?: string, message?: string}} error
 * @returns {string}
 */
export function describeAuthError(error) {
    const code = error && error.code ? error.code : '';

    switch (code) {
        case 'auth/invalid-verification-code':
        case 'auth/invalid-verification-id':
            return 'Codice non valido. Controlla che l\'orario del telefono sia sincronizzato e riprova.';

        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Password errata.';

        case 'auth/too-many-requests':
            return 'Troppi tentativi. Attendi qualche minuto prima di riprovare.';

        case 'auth/requires-recent-login':
            return 'Sessione scaduta. Esci e rientra, poi riprova.';

        case 'auth/unsupported-first-factor':
        case 'auth/operation-not-allowed':
            return 'La verifica in due passaggi non è attiva su questo progetto. Contatta lo staff.';

        case 'auth/second-factor-already-in-use':
            return 'Questo dispositivo è già registrato sull\'account.';

        case 'auth/maximum-second-factor-count-exceeded':
            return 'Hai già raggiunto il numero massimo di dispositivi.';

        case 'auth/network-request-failed':
            return 'Connessione assente. Verifica la rete e riprova.';

        default:
            return 'Operazione non riuscita. Riprova tra poco.';
    }
}
