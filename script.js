// ============================================================
//  SCRIPT.JS — Kripix Entertainment
//  Core: Firebase init, navbar auth, notifications, telemetry
// ============================================================


// ── 1. IMPORTAZIONI ─────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-functions.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-check.js";

import { injectNavbar, injectFooter, injectBackToTop, initPageTransitions, initReveal } from './components.js';
import { initTranslator, switchLanguage } from './translator.js';


// ── 2. INIZIALIZZAZIONE FIREBASE ────────────────────────────

const firebaseConfig = {
    apiKey: "AIzaSyCSCYzPprBLnd49x41WZ4jMBVyNDCOdJ64",
    authDomain: "kripix-ent.firebaseapp.com",
    projectId: "kripix-ent",
    storageBucket: "kripix-ent.appspot.com",
    messagingSenderId: "778855676026",
    appId: "1:778855676026:web:0dc74f1108e2971f4da3c3"
};

export const app = initializeApp(firebaseConfig);

// Scudo Anti-Bot (App Check)
initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider('6Lc3qOssAAAAACJLhU6erRnF8MrTObDnP5zoXJqn'),
    isTokenAutoRefreshEnabled: true
});

export const auth = getAuth(app);
export const db = getFirestore(app);


// ── 3. UTILITÀ: Sanitizzazione HTML ─────────────────────────
//    Previene XSS nelle notifiche che contengono link interni.
//    Consente solo <a>, <br>, <strong>, <em> con attributi sicuri.

function sanitizeHTML(raw) {
    const temp = document.createElement('div');
    temp.textContent = raw;
    let safe = temp.innerHTML;

    // Ripristina solo i tag sicuri che usiamo nelle notifiche
    safe = safe
        .replace(/&lt;br\s*\/?&gt;/gi, '<br>')
        .replace(/&lt;strong&gt;/gi, '<strong>').replace(/&lt;\/strong&gt;/gi, '</strong>')
        .replace(/&lt;em&gt;/gi, '<em>').replace(/&lt;\/em&gt;/gi, '</em>');

    // Ripristina <a> solo verso pagine interne del sito (no URL esterni iniettati)
    safe = safe.replace(
        /&lt;a href=&quot;((?:terminale|profilo|libreria|index|login|progetti|contatti|download|impostazioni|studio|pagoda|engine|admin|faq|cookies|eula|dmr)\.html[^&]*)&quot;([^&]*)&gt;(.*?)&lt;\/a&gt;/gi,
        (_, href, attrs, text) => {
            const cleanAttrs = attrs.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            return `<a href="${href}"${cleanAttrs}>${text}</a>`;
        }
    );
    return safe;
}


// ── 4. ESECUZIONE PRINCIPALE ────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // ─ A. Iniezione componenti (deve essere la prima cosa) ──
    injectNavbar();
    injectFooter();
    injectBackToTop();
    initPageTransitions();
    initReveal();

    // Widget Kripix AI: si monta da solo, e solo per chi ha la beta attiva.
    // Import dinamico così il codice non pesa sulle pagine di chi non lo usa.
    import('./assistant.js')
        .then(m => m.initAssistant())
        .catch(e => console.debug('Assistente non caricato:', e.message));

    // ─ B. Traduttore ─────────────────────────────────────
    // Inizializzazione traduttore e funzione globale per i bottoni HTML
    initTranslator();
    window.cambiaLingua = switchLanguage;

    // ─ B-bis. Invio con INVIO nei modali ────────────────────
    //  I modali del sito non sono <form>, quindi il tasto Invio non
    //  faceva nulla: si doveva sempre cliccare col mouse. Qui lo
    //  colleghiamo al bottone principale del modale aperto.
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;

        const el = e.target;
        if (!el || el.tagName !== 'Input') return;
        if (['checkbox', 'radio', 'button', 'submit', 'file'].includes(el.type)) return;

        // Dentro un <form> ci pensa il browser
        if (el.closest('form')) return;

        const box = el.closest('.modal-box');
        if (!box) return;

        // Solo i bottoni davvero visibili: i modali a più schermate
        // tengono in pagina anche i pulsanti dei passi nascosti.
        const azione = [...box.querySelectorAll('.btn-gold, .btn-danger')]
            .find(b => !b.disabled && b.offsetParent !== null);

        if (azione) {
            e.preventDefault();
            azione.click();
        }
    });

    // ─ C. Sistema notifiche globali (toast) ─────────────────
    let toastContainer = document.getElementById('kripix-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'kripix-toast-container';
        document.body.appendChild(toastContainer);
    }

    window.kripixNotify = function(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'kripix-toast';
        const borderColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--gold)';
        toast.style.borderLeftColor = borderColor;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'kripix-toast-title';
        titleDiv.textContent = title;

        const msgDiv = document.createElement('div');
        // SICUREZZA: sanitizziamo l'HTML per prevenire XSS
        msgDiv.innerHTML = sanitizeHTML(message);

        toast.appendChild(titleDiv);
        toast.appendChild(msgDiv);

        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    };

    // ─ D. Accesso / avatar nella barra di navigazione ──────
    const li = document.getElementById('nav-auth');

    // Se la pagina non ha la barra standard ci fermiamo
    if (!li) return;
    li.id = 'auth-item';

    window.updateNavbarAvatarDisplay = async function(user) {
        if (!user) {
            li.innerHTML = `<a href="login.html" class="btn-login-nav" data-i18n="Accedi">Accedi</a>`;
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // Registrazione con Google lasciata a metà: manca il profilo
            if (!userSnap.exists()) {
                console.warn("Profilo mancante nel database.");
                if (!window.location.href.includes("login.html") && !window.location.href.includes("register.html")) {
                    await window.kripixAlert("Per finire la registrazione devi scegliere un nome utente.", { title: "Registrazione da completare" });
                    await signOut(auth);
                    window.location.href = "login.html";
                    return;
                }
                return;
            }

            const me = userSnap.data();
            li.innerHTML = '';

            // Avatar (bottone: si apre anche da tastiera)
            const avatarBtn = document.createElement('button');
            avatarBtn.type = 'button';
            avatarBtn.className = 'user-avatar';
            avatarBtn.setAttribute('aria-haspopup', 'true');
            avatarBtn.setAttribute('aria-expanded', 'false');
            avatarBtn.setAttribute('aria-label', 'Menu account');
            if (me.avatar_img) {
                const img = document.createElement('img');
                img.src = me.avatar_img;
                img.alt = '';
                avatarBtn.appendChild(img);
            } else {
                avatarBtn.style.backgroundColor = me.color || '#e3c66c';
                avatarBtn.textContent = (me.username || '?').charAt(0).toUpperCase();
            }

            const dropdown = document.createElement('div');
            dropdown.className = 'user-dropdown';

            const header = document.createElement('div');
            header.className = 'user-header';
            const userNameSpan = document.createElement('span');
            userNameSpan.className = 'user-name';
            userNameSpan.textContent = me.username;
            const userRoleSpan = document.createElement('span');
            userRoleSpan.className = 'user-role';
            userRoleSpan.textContent = me.isAdmin ? 'Amministratore' : 'Giocatore';
            userRoleSpan.setAttribute('data-i18n', userRoleSpan.textContent);
            header.append(userNameSpan, userRoleSpan);
            dropdown.appendChild(header);

            const links = [
                { href: 'profilo.html', text: 'Profilo' },
                { href: 'libreria.html', text: 'I miei giochi' },
                { href: 'terminale.html', text: 'Messaggi' },
            ];
            if (me.isAdmin) links.push({ href: 'admin.html', text: 'Pannello admin', cls: 'is-admin' });
            links.push({ href: '#', text: 'Esci', id: 'action-logout' });

            const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
            links.forEach(l => {
                const a = document.createElement('a');
                a.href = l.href;
                a.textContent = l.text;
                a.setAttribute('data-i18n', l.text);
                if (l.id) a.id = l.id;
                if (l.cls) a.className = l.cls;
                if (l.href === current) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
                dropdown.appendChild(a);
            });

            li.append(avatarBtn, dropdown);

            const setOpen = (open) => {
                dropdown.classList.toggle('show', open);
                avatarBtn.setAttribute('aria-expanded', String(open));
            };
            avatarBtn.onclick = (e) => {
                e.stopPropagation();
                setOpen(!dropdown.classList.contains('show'));
            };
            document.addEventListener('click', (e) => { if (!li.contains(e.target)) setOpen(false); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

            li.querySelector('#action-logout').onclick = async (e) => {
                e.preventDefault();
                await signOut(auth);
                window.location.href = 'index.html';
            };

        } catch (error) {
            console.error("Errore Auth State:", error);
        }
    };

    // ─ E. Ascoltatore stato online/offline ──────────────────
    onAuthStateChanged(auth, async (user) => {
        window.updateNavbarAvatarDisplay(user);

        if (user) {
            const userRef = doc(db, "users", user.uid);

            const goOnline = async () => {
                try {
                    const snap = await getDoc(userRef);
                    if (snap.exists() && (!snap.data().privacy || snap.data().privacy.invisible !== true)) {
                        await updateDoc(userRef, { onlineStatus: "online" });
                    }
                } catch (e) { /* Silenzioso — errore di rete non critico */ }
            };

            const goOffline = () => {
                updateDoc(userRef, { onlineStatus: "offline" }).catch(() => {});
            };

            goOnline();

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') goOnline();
                else goOffline();
            });

            window.addEventListener('beforeunload', goOffline);
        }

        // ─ F. Notifiche chat in tempo reale ─────────────────
        if (user) {
            import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js").then(({ query, collection, where, onSnapshot }) => {

                let isFirstChatLoad = true;
                const knownChatTimes = {};

                const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid));

                onSnapshot(chatsQuery, (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        const cData = change.doc.data();
                        const chatId = change.doc.id;
                        const lastTime = cData.lastMessageTime ? cData.lastMessageTime.toMillis() : 0;

                        // Primo caricamento: salva orari senza inviare notifiche
                        if (isFirstChatLoad) {
                            knownChatTimes[chatId] = lastTime;
                            return;
                        }

                        // Messaggio nuovo e non letto
                        if (cData[`unread_${user.uid}`] === true && (!knownChatTimes[chatId] || lastTime > knownChatTimes[chatId])) {
                            knownChatTimes[chatId] = lastTime;

                            // Non disturbare se l'utente è già nella pagina dei messaggi
                            if (window.location.href.includes("terminale.html")) return;

                            if (cData.isSystemChat) {
                                window.kripixNotify(
                                    "Messaggio dallo staff",
                                    `Lo staff di Kripix ti ha scritto. <br><a href="terminale.html" style="text-decoration:underline; margin-top:5px; display:inline-block;">Leggi il messaggio</a>`,
                                    "error"
                                );
                            } else {
                                const otherGuy = cData.participants.find(p => p !== user.uid);
                                if (otherGuy) {
                                    getDoc(doc(db, "users", otherGuy)).then(uSnap => {
                                        if (!uSnap.exists()) return;
                                        const senderName = uSnap.data().username;
                                        window.kripixNotify(
                                            "Nuovo messaggio",
                                            `${senderName} ti ha scritto. <br><a href="terminale.html?agent=${encodeURIComponent(otherGuy)}" style="text-decoration:underline; margin-top:5px; display:inline-block;">Apri i messaggi</a>`,
                                            "info"
                                        );
                                    });
                                }
                            }
                        }
                        // Aggiorna timestamp se letto
                        else if (cData[`unread_${user.uid}`] === false) {
                            knownChatTimes[chatId] = lastTime;
                        }
                    });

                    if (isFirstChatLoad) isFirstChatLoad = false;
                });
            });
        }
    });
});


// ── 5. TELEMETRIA E COOKIE CONSENT ──────────────────────────

/**
 * Rileva browser e OS dell'utente per la telemetria.
 * Restituisce null se il consenso è negato.
 */
function getDeviceData() {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    let osName = "Unknown";

    // Ordine importante: Edge contiene "Chrome", Safari contiene "Chrome" su iOS, ecc.
    if (ua.match(/edg/i)) browserName = "Edge";
    else if (ua.match(/opr\//i)) browserName = "Opera";
    else if (ua.match(/chrome|chromium|crios/i)) browserName = "Chrome";
    else if (ua.match(/firefox|fxios/i)) browserName = "Firefox";
    else if (ua.match(/safari/i)) browserName = "Safari";

    if (ua.indexOf("Win") !== -1) osName = "Windows";
    else if (ua.indexOf("Android") !== -1) osName = "Android";
    else if (ua.indexOf("like Mac") !== -1) osName = "iOS";
    else if (ua.indexOf("Mac") !== -1) osName = "MacOS";
    else if (ua.indexOf("Linux") !== -1) osName = "Linux";

    return {
        browser: browserName,
        os: osName,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || navigator.userLanguage,
        userAgent: ua
    };
}

/**
 * Invia i dati di telemetria alla Cloud Function.
 * Se consent = "rejected", invia solo la pagina visitata (niente device data).
 */
async function dispatchTelemetry(consent) {
    const functions = getFunctions(app, 'europe-west1');
    const logTelemetry = httpsCallable(functions, 'logTelemetry');

    const payload = {
        consentLevel: consent,
        page: window.location.pathname.split('/').pop() || 'index.html',
        deviceData: consent === "accepted" ? getDeviceData() : null
    };

    try {
        await logTelemetry(payload);
    } catch (e) {
        console.error("Errore di trasmissione telemetria:", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const existingConsent = localStorage.getItem('kripix_cookie_consent');

    if (!existingConsent) {
        // Prima visita: mostra banner consenso cookie
        const cookieBanner = document.createElement('div');
        cookieBanner.id = 'kripix-cookie-banner';
        cookieBanner.innerHTML = `
            <div class="cookie-title" data-i18n="Cookie">Cookie</div>
            <div class="cookie-text" data-i18n="cookie_text" data-i18n-html>
                Usiamo cookie tecnici per tenerti connesso e ricordare le tue preferenze. Se accetti, registriamo anche browser, sistema operativo e dimensione dello schermo, per capire su quali dispositivi gira il sito. Non vendiamo i tuoi dati.
                <a href="cookies.html">Leggi la privacy</a>.
            </div>
            <div class="cookie-buttons">
                <button id="btn-cookie-accept" class="btn-cookie btn-cookie-accept" data-i18n="Accetta tutti">Accetta tutti</button>
                <button id="btn-cookie-reject" class="btn-cookie btn-cookie-reject" data-i18n="Solo essenziali">Solo essenziali</button>
            </div>
        `;
        document.body.appendChild(cookieBanner);
        setTimeout(() => cookieBanner.classList.add('show'), 500);

        document.getElementById('btn-cookie-accept').addEventListener('click', () => {
            localStorage.setItem('kripix_cookie_consent', 'accepted');
            cookieBanner.classList.remove('show');
            setTimeout(() => cookieBanner.remove(), 600);
            if (window.kripixNotify) window.kripixNotify("Preferenze salvate", "Hai accettato tutti i cookie.", "success");
            dispatchTelemetry("accepted");
        });

        document.getElementById('btn-cookie-reject').addEventListener('click', () => {
            localStorage.setItem('kripix_cookie_consent', 'rejected');
            cookieBanner.classList.remove('show');
            setTimeout(() => cookieBanner.remove(), 600);
            if (window.kripixNotify) window.kripixNotify("Preferenze salvate", "Useremo solo i cookie essenziali.", "info");
            dispatchTelemetry("rejected");
        });

    } else {
        // Visita successiva: telemetria silenziosa dopo che Firebase Auth è pronto
        setTimeout(() => dispatchTelemetry(existingConsent), 1500);
    }
});