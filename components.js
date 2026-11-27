// ============================================================
//  COMPONENTS.JS — Kripix Entertainment
//  Barra in alto, barra in basso (cellulare), footer, tema,
//  transizioni tra le pagine e animazioni allo scorrimento.
//  Ogni testo porta data-i18n per il traduttore.
// ============================================================

import { switchLanguage } from './translator.js';

// Rende switchLanguage accessibile dagli onclick inline
window.cambiaLingua = switchLanguage;

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = window.matchMedia('(max-width: 760px)');


// ── LOGO ────────────────────────────────────────────────────
//  Il marchio KRIPIX disegnato come tracciato: niente font da
//  scaricare solo per il logo, e resta nitido a ogni dimensione.

export const LOGO_SVG = `<svg viewBox="57 -700 3966 700" role="img" aria-label="Kripix"><path d="M268 -150 255 -409 519 -700H776L480 -374L349 -240ZM57 0V-700H289V0ZM517 0 311 -272 464 -434 790 0ZM882 0V-700H1219Q1317 -700 1388.5 -668Q1460 -636 1499 -576.5Q1538 -517 1538 -436Q1538 -355 1499 -296.5Q1460 -238 1388.5 -207Q1317 -176 1219 -176H1013L1118 -273V0ZM1301 0 1129 -255H1379L1553 0ZM1118 -247 1013 -354H1204Q1253 -354 1276.5 -376Q1300 -398 1300 -436Q1300 -474 1276.5 -496Q1253 -518 1204 -518H1013L1118 -625ZM1687 0V-700H1923V0ZM2097 0V-700H2434Q2532 -700 2603.5 -668Q2675 -636 2714 -576.5Q2753 -517 2753 -436Q2753 -355 2714 -296Q2675 -237 2603.5 -204.5Q2532 -172 2434 -172H2228L2333 -273V0ZM2333 -247 2228 -354H2419Q2468 -354 2491.5 -376Q2515 -398 2515 -436Q2515 -474 2491.5 -496Q2468 -518 2419 -518H2228L2333 -625ZM2900 0V-700H3136V0ZM3245 0 3557 -436 3556 -271 3254 -700H3519L3695 -440L3582 -439L3754 -700H4008L3706 -280V-444L4023 0H3753L3577 -272L3686 -273L3514 0Z"/></svg>`;


// ── ICONE ───────────────────────────────────────────────────

const svg = (body, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const ICONS = {
    moon:   svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', 'icon i-moon'),
    sun:    svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 'icon i-sun'),
    home:   svg('<path d="M4 10.5 12 4l8 6.5V20h-5v-6h-6v6H4z"/>'),
    games:  svg('<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M8 10.5v4M6 12.5h4"/><circle cx="15.5" cy="11.5" r=".9"/><circle cx="17.5" cy="13.8" r=".9"/>'),
    launch: svg('<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 19h14"/>'),
    help:   svg('<circle cx="12" cy="12" r="9"/><path d="M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4"/><path d="M12 17.4h.01"/>'),
    menu:   svg('<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>'),
    close:  svg('<path d="M6 6l12 12M18 6 6 18"/>'),
};


// ── TEMA CHIARO / SCURO ─────────────────────────────────────
//  Di default il sito è scuro. Chi preferisce il chiaro lo sceglie
//  dalla barra e la scelta resta salvata su questo dispositivo.

const THEME_KEY = 'kripix_theme';

export function getTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* navigazione privata */ }
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        const light = theme === 'light';
        btn.setAttribute('aria-pressed', String(light));
        const label = light ? 'Passa al tema scuro' : 'Passa al tema chiaro';
        btn.setAttribute('aria-label', label);
        btn.title = label;
        const txt = btn.querySelector('.theme-label');
        if (txt) txt.textContent = light ? 'Tema chiaro' : 'Tema scuro';
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#e8e8e4' : '#07080b';
}

// Cambio di tema: i colori sfumano dal vecchio al nuovo su tutta la
// pagina insieme. Niente "fotografie" della pagina (come fanno le View
// Transitions), così il video dell'apertura continua a scorrere.
let themeTimer = null;
export function setTheme(theme) {
    if (theme === getTheme() || REDUCED) return applyTheme(theme);
    const root = document.documentElement;
    root.classList.add('theme-anim');
    applyTheme(theme);
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => root.classList.remove('theme-anim'), 600);
}


// ── PAGINA CORRENTE ─────────────────────────────────────────
//  Alcune pagine appartengono a una voce di menu: la scheda di
//  un gioco sta sotto Giochi, il checkout pure, e così via.

const PAGE_ALIASES = {
    'pagoda.html': 'progetti.html',
    'checkout.html': 'progetti.html',
    'engine.html': 'download.html',
    'contatti.html': 'faq.html',
    '': 'index.html',
};

function getCurrentPage() {
    return (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
}

function markActiveLinks(root) {
    const current = getCurrentPage();
    const parent = PAGE_ALIASES[current];
    root.querySelectorAll('a[href]').forEach(link => {
        const target = (link.getAttribute('href') || '').split(/[?#]/)[0].toLowerCase();
        if (!target || target === '#') return;
        if (target === current) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else if (target === parent && (link.classList.contains('nav-link') || link.classList.contains('tab'))) {
            link.classList.add('active');
        }
    });
}


// ── BARRA IN ALTO ───────────────────────────────────────────

export function injectNavbar() {
    let nav = document.getElementById('main-nav');
    if (!nav) {
        nav = document.createElement('nav');
        nav.id = 'main-nav';
        document.body.prepend(nav);
    }
    nav.removeAttribute('style');
    nav.className = '';
    nav.setAttribute('aria-label', 'Principale');

    nav.innerHTML = `
        <a href="index.html" class="nav-logo" aria-label="Kripix Entertainment, vai alla home">${LOGO_SVG}</a>
        <ul class="nav-links">
            <li><a href="progetti.html" class="nav-link" data-i18n="Giochi">Giochi</a></li>
            <li><a href="studio.html" class="nav-link" data-i18n="Studio">Studio</a></li>
            <li><a href="download.html" class="nav-link" data-i18n="Launcher">Launcher</a></li>
            <li><a href="faq.html" class="nav-link" data-i18n="Assistenza">Assistenza</a></li>
        </ul>
        <div class="nav-tools">
            <div class="lang-switcher" role="group" aria-label="Lingua">
                <button type="button" class="lang-btn" data-lang="it" lang="it" aria-label="Italiano" onclick="window.cambiaLingua('it')">IT</button>
                <span class="lang-separator" aria-hidden="true">/</span>
                <button type="button" class="lang-btn" data-lang="en" lang="en" aria-label="English" onclick="window.cambiaLingua('en')">EN</button>
            </div>
            <button type="button" class="icon-btn theme-toggle" aria-pressed="false">${ICONS.moon}${ICONS.sun}</button>
            <div id="nav-auth" class="nav-user-container"></div>
        </div>
    `;
    markActiveLinks(nav);
    nav.querySelector('.theme-toggle').addEventListener('click', (e) => {
        setTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
    applyTheme(getTheme());

    // In cima a una pagina con immagine la barra è trasparente e senza
    // bordo; scorrendo diventa solida. Scorrendo verso il basso si
    // nasconde per lasciare spazio, risalendo ricompare.
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
        const y = window.scrollY;
        const dy = y - lastY;
        nav.classList.toggle('scrolled', y > 8);
        const menuOpen = document.body.classList.contains('sheet-open') || nav.querySelector('.user-dropdown.show');
        if (y < 80 || menuOpen) {
            nav.classList.remove('nav-hidden');
            document.body.classList.remove('scrolling-down');
        } else if (dy > 6) {
            nav.classList.add('nav-hidden');
            document.body.classList.add('scrolling-down');
        } else if (dy < -6) {
            nav.classList.remove('nav-hidden');
            document.body.classList.remove('scrolling-down');
        }
        if (Math.abs(dy) > 6) lastY = y;
        // Pagina in fondo: tutto torna visibile
        if (innerHeight + y >= document.documentElement.scrollHeight - 4) document.body.classList.remove('scrolling-down');
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    injectTabBar();
}


// ── BARRA IN BASSO (CELLULARE) ──────────────────────────────
//  Cinque tasti grandi, raggiungibili col pollice. "Menu" apre un
//  pannello dal basso con il resto: studio, contatti, lingua, tema.

function injectTabBar() {
    if (document.getElementById('tab-bar')) return;

    const bar = document.createElement('nav');
    bar.id = 'tab-bar';
    bar.setAttribute('aria-label', 'Navigazione rapida');
    bar.innerHTML = `
        <a href="index.html" class="tab">${ICONS.home}<span data-i18n="Home">Home</span></a>
        <a href="progetti.html" class="tab">${ICONS.games}<span data-i18n="Giochi">Giochi</span></a>
        <a href="download.html" class="tab">${ICONS.launch}<span data-i18n="Launcher">Launcher</span></a>
        <a href="faq.html" class="tab">${ICONS.help}<span data-i18n="Aiuto">Aiuto</span></a>
        <button type="button" class="tab" id="tab-more" aria-expanded="false" aria-controls="more-sheet">${ICONS.menu}<span data-i18n="Menu">Menu</span></button>
    `;
    document.body.appendChild(bar);
    markActiveLinks(bar);

    const sheet = document.createElement('div');
    sheet.id = 'more-sheet';
    sheet.className = 'sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Menu');
    sheet.innerHTML = `
        <div class="sheet-backdrop" data-close></div>
        <div class="sheet-panel">
            <div class="sheet-handle" data-close aria-hidden="true"></div>
            <ul class="sheet-links">
                <li style="--i:0"><a href="studio.html" data-i18n="Lo studio">Lo studio</a></li>
                <li style="--i:1"><a href="pagoda.html">La Pagoda</a></li>
                <li style="--i:2"><a href="contatti.html" data-i18n="Contatti">Contatti</a></li>
                <li style="--i:3"><a href="libreria.html" data-i18n="I miei giochi">I miei giochi</a></li>
            </ul>
            <div class="sheet-row" style="--i:4">
                <div class="seg-switch" role="group" aria-label="Lingua">
                    <button type="button" class="lang-btn" data-lang="it" lang="it" onclick="window.cambiaLingua('it')">Italiano</button>
                    <button type="button" class="lang-btn" data-lang="en" lang="en" onclick="window.cambiaLingua('en')">English</button>
                </div>
                <button type="button" class="theme-toggle sheet-theme" aria-pressed="false">${ICONS.moon}${ICONS.sun}<span class="theme-label">Tema scuro</span></button>
            </div>
            <div class="sheet-foot" style="--i:5">
                <a href="eula.html" data-i18n="Termini d'uso">Termini d'uso</a>
                <a href="cookies.html" data-i18n="Privacy e cookie">Privacy e cookie</a>
                <a href="https://discord.gg/FwwuYJ4Dn3" target="_blank" rel="noopener noreferrer">Discord</a>
                <a href="https://www.youtube.com/@KripixEntertainment" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
        </div>
    `;
    document.body.appendChild(sheet);
    markActiveLinks(sheet);

    const moreBtn = bar.querySelector('#tab-more');
    const panel = sheet.querySelector('.sheet-panel');
    const setOpen = (open) => {
        sheet.classList.toggle('open', open);
        document.body.classList.toggle('sheet-open', open);
        moreBtn.setAttribute('aria-expanded', String(open));
        moreBtn.classList.toggle('active', open);
        panel.style.transform = '';
        if (open) sheet.querySelector('.sheet-links a').focus({ preventScroll: true });
    };
    moreBtn.addEventListener('click', () => setOpen(!sheet.classList.contains('open')));
    sheet.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => setOpen(false)));
    sheet.querySelector('.sheet-theme').addEventListener('click', (e) => {
        setTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sheet.classList.contains('open')) { setOpen(false); moreBtn.focus(); }
    });

    // Trascina verso il basso per chiudere
    let startY = null;
    panel.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener('touchmove', (e) => {
        if (startY === null) return;
        const d = Math.max(0, e.touches[0].clientY - startY);
        panel.style.transform = `translateY(${d}px)`;
    }, { passive: true });
    panel.addEventListener('touchend', (e) => {
        if (startY === null) return;
        const d = e.changedTouches[0].clientY - startY;
        startY = null;
        if (d > 80) setOpen(false); else panel.style.transform = '';
    });

    applyTheme(getTheme());
}


// ── FOOTER ──────────────────────────────────────────────────

export function injectFooter() {
    // Un solo footer per pagina: eventuali doppioni vengono tolti
    document.querySelectorAll('#main-footer ~ #main-footer').forEach(f => f.remove());
    let footer = document.getElementById('main-footer');
    if (!footer) {
        footer = document.createElement('footer');
        footer.id = 'main-footer';
        document.body.appendChild(footer);
    }
    footer.className = 'kripix-footer';

    footer.innerHTML = `
        <div class="footer-top">
            <div class="footer-brand">
                <a href="index.html" aria-label="Kripix Entertainment, vai alla home">${LOGO_SVG}</a>
                <p data-i18n="Studio indipendente italiano. Facciamo giochi narrativi e horror per PC.">Studio indipendente italiano. Facciamo giochi narrativi e horror per PC.</p>
            </div>
            <div class="footer-col">
                <h4>Kripix</h4>
                <ul>
                    <li><a href="progetti.html" data-i18n="Giochi">Giochi</a></li>
                    <li><a href="pagoda.html">La Pagoda</a></li>
                    <li><a href="studio.html" data-i18n="Lo studio">Lo studio</a></li>
                    <li><a href="download.html">Kripix Launcher</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4 data-i18n="Assistenza">Assistenza</h4>
                <ul>
                    <li><a href="faq.html" data-i18n="Centro assistenza">Centro assistenza</a></li>
                    <li><a href="contatti.html" data-i18n="Contatti">Contatti</a></li>
                    <li><a href="libreria.html" data-i18n="I miei giochi">I miei giochi</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4 data-i18n="Legale">Legale</h4>
                <ul>
                    <li><a href="eula.html" data-i18n="Termini d'uso">Termini d'uso</a></li>
                    <li><a href="cookies.html" data-i18n="Privacy e cookie">Privacy e cookie</a></li>
                    <li><a href="dmr.html" data-i18n="Politica DRM">Politica DRM</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4 data-i18n="Seguici">Seguici</h4>
                <ul>
                    <li><a href="https://discord.gg/FwwuYJ4Dn3" target="_blank" rel="noopener noreferrer">Discord</a></li>
                    <li><a href="https://x.com/KripixEnt" target="_blank" rel="noopener noreferrer">X</a></li>
                    <li><a href="https://www.youtube.com/@KripixEntertainment" target="_blank" rel="noopener noreferrer">YouTube</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-mini">
            <div class="footer-mini-top">
                <a href="index.html" class="footer-mini-logo" aria-label="Kripix Entertainment, vai alla home">${LOGO_SVG}</a>
                <div class="footer-mini-social">
                    <a href="https://discord.gg/FwwuYJ4Dn3" target="_blank" rel="noopener noreferrer" aria-label="Discord"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.5 1a15.3 15.3 0 0 0-5.4 0l-.5-1a16.6 16.6 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5 2.5l1.1-1.7c-.6-.2-1.2-.5-1.8-.9l.4-.3a11.9 11.9 0 0 0 10.2 0l.4.3c-.6.4-1.2.7-1.8.9l1.1 1.7a16.6 16.6 0 0 0 5-2.5c.4-4.3-.7-8-3-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg></a>
                    <a href="https://x.com/KripixEnt" target="_blank" rel="noopener noreferrer" aria-label="X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.5z"/></svg></a>
                    <a href="https://www.youtube.com/@KripixEntertainment" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9L15.6 12z"/></svg></a>
                </div>
            </div>
            <nav class="footer-mini-links" aria-label="Link del sito">
                <a href="contatti.html" data-i18n="Contatti">Contatti</a>
                <a href="eula.html" data-i18n="Termini d'uso">Termini d'uso</a>
                <a href="cookies.html" data-i18n="Privacy e cookie">Privacy e cookie</a>
                <a href="dmr.html" data-i18n="Politica DRM">Politica DRM</a>
            </nav>
            <p class="footer-mini-copy">&copy; ${new Date().getFullYear()} Kripix Entertainment. <span data-i18n="Sviluppato in Italia.">Sviluppato in Italia.</span></p>
        </div>
        <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} Kripix Entertainment. <span data-i18n="Tutti i diritti riservati.">Tutti i diritti riservati.</span></span>
            <span data-i18n="Sviluppato in Italia.">Sviluppato in Italia.</span>
        </div>
    `;

    markActiveLinks(footer);
}



// ── TASTO "TORNA SU" ────────────────────────────────────────

export function injectBackToTop() {
    if (document.getElementById('back-to-top')) return;

    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Torna in cima alla pagina');
    btn.innerHTML = `<svg class="icon icon-md" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>`;
    document.body.appendChild(btn);

    let ticking = false;
    const refresh = () => {
        btn.classList.toggle('visible', window.scrollY > 600);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; window.requestAnimationFrame(refresh); }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
    refresh();
}


// ── TRANSIZIONI TRA LE PAGINE ───────────────────────────────
//  Chrome, Edge e Safari usano le View Transitions (in style.css).
//  Gli altri browser ricevono una dissolvenza fatta a mano.

export function initPageTransitions() {
    if (REDUCED || 'onpagereveal' in window) return;

    // La classe page-enter la mette lo script nell'<head>, prima del primo disegno
    setTimeout(() => document.documentElement.classList.remove('page-enter'), 700);

    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest('a[href]');
        if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
        if (!/\.html$|\/$/.test(url.pathname)) return;
        e.preventDefault();
        document.documentElement.classList.add('page-leave');
        setTimeout(() => { location.href = url.href; }, 170);
    });
    // Tornando indietro dalla cache del browser la pagina deve essere visibile
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) document.documentElement.classList.remove('page-leave');
    });
}


// ── ANIMAZIONI ALLO SCORRIMENTO ─────────────────────────────
//  Le immagini compaiono come illuminate da un flash; titoli e
//  blocchi salgono piano. Ogni elemento si anima una volta sola.

const REVEAL_SELECTORS = [
    '.section-head', '.page-header > *', '.game-tile', '.news-feature', '.news-item',
    '.principles li', '.studio-quote', '.platform-row', '.launcher-grid > div:first-child',
    '.project-card', '.pillar-card', '.os-card', '.feature-item', '.threat-list li',
    '.spec-table-wrap', '.video-lite', '.game-story > *', '.legal-text > *', '.guide-card',
    '.faq-shortcut', '.contact-form-wrapper', '.contact-links li', '.stat-card', '.admin-card',
];
const FLASH_SELECTORS = ['.game-tile', '.news-feature', '.video-lite', '.poster-placeholder', '.os-card.highlighted'];

export function initReveal() {
    if (REDUCED || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in');
            io.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    const watch = (root) => {
        root.querySelectorAll(REVEAL_SELECTORS.join(',')).forEach(el => {
            if (el.classList.contains('reveal')) return;
            // Gli elementi già visibili all'apertura non si animano: niente salti
            const r = el.getBoundingClientRect();
            if (r.top < innerHeight * 0.9 && r.bottom > 0 && !el.closest('.news-layout')) return;
            el.classList.add('reveal');
            if (FLASH_SELECTORS.some(s => el.matches(s))) el.classList.add('reveal-flash');
            // Ritardo a cascata tra fratelli
            const sibs = [...el.parentElement.children].filter(c => c.matches(REVEAL_SELECTORS.join(',')));
            el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 70 + 'ms');
            io.observe(el);
        });
    };
    watch(document);

    // Parallasse: le immagini d'apertura scorrono più lente della pagina
    const par = [...document.querySelectorAll('[data-parallax]')];
    const fades = [...document.querySelectorAll('[data-scroll-fade]')];
    if (par.length || fades.length) {
        let tk = false;
        const step = () => {
            const y = Math.min(window.scrollY, innerHeight * 1.2);
            par.forEach(el => { el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`; });
            fades.forEach(el => {
                el.style.opacity = Math.max(0, 1 - y / (innerHeight * 0.7)).toFixed(3);
                el.style.transform = `translate3d(0, ${(y * 0.15).toFixed(1)}px, 0)`;
            });
            tk = false;
        };
        window.addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(step); } }, { passive: true });
        step();
    }

    // Contenuti caricati dopo (notizie, libreria...)
    const mo = new MutationObserver((muts) => {
        muts.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) watch(n.parentElement || document); }));
    });
    document.querySelectorAll('#news-feed-container, #library-grid').forEach(el => mo.observe(el, { childList: true }));
}


// ── FINESTRE DI DIALOGO ─────────────────────────────────────
//  Sostituiscono alert(), confirm() e prompt() del browser con
//  finestre nello stile del sito. Restituiscono una Promise:
//    await kripixAlert('Fatto.')
//    if (await kripixConfirm('Eliminare?', { danger: true })) …
//    const testo = await kripixPrompt('Scrivi ELIMINA')  // null se annulli

function kripixDialog({ title = '', message = '', confirmText = 'OK', cancelText = null, danger = false, input = null }) {
    return new Promise((resolve) => {
        const previous = document.activeElement;
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay kd-overlay';
        overlay.setAttribute('role', cancelText ? 'alertdialog' : 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        const box = document.createElement('div');
        box.className = 'modal-box kd-box';
        if (title) {
            const h = document.createElement('h3');
            h.id = 'kd-title-' + Date.now();
            h.textContent = title;
            overlay.setAttribute('aria-labelledby', h.id);
            box.appendChild(h);
        }
        const p = document.createElement('p');
        p.className = 'kd-message';
        p.textContent = message;
        box.appendChild(p);

        let field = null;
        if (input) {
            field = document.createElement('input');
            field.type = 'text';
            field.className = 'modal-input kd-input';
            field.placeholder = input.placeholder || '';
            field.autocomplete = 'off';
            field.setAttribute('aria-label', input.label || message);
            box.appendChild(field);
        }

        const actions = document.createElement('div');
        actions.className = 'modal-actions';
        let cancelBtn = null;
        if (cancelText) {
            cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn-outline';
            cancelBtn.textContent = cancelText;
            actions.appendChild(cancelBtn);
        }
        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = danger ? 'btn-danger' : 'btn-gold';
        okBtn.textContent = confirmText;
        actions.appendChild(okBtn);
        box.appendChild(actions);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        overlay.style.display = 'flex';
        document.body.classList.add('dialog-open');

        let done = false;
        const close = (value) => {
            if (done) return;
            done = true;
            overlay.classList.add('kd-closing');
            document.removeEventListener('keydown', onKey, true);
            setTimeout(() => {
                overlay.remove();
                if (!document.querySelector('.kd-overlay')) document.body.classList.remove('dialog-open');
                if (previous && previous.focus) previous.focus({ preventScroll: true });
            }, REDUCED ? 0 : 160);
            resolve(value);
        };
        const confirmValue = () => input ? field.value : (cancelText ? true : undefined);
        const cancelValue = () => input ? null : (cancelText ? false : undefined);

        okBtn.addEventListener('click', () => close(confirmValue()));
        if (cancelBtn) cancelBtn.addEventListener('click', () => close(cancelValue()));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(cancelValue()); });

        // Tastiera: Esc annulla, Invio conferma, Tab resta dentro la finestra
        const onKey = (e) => {
            if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(cancelValue()); }
            else if (e.key === 'Enter' && (e.target === field || e.target === document.body)) { e.preventDefault(); e.stopPropagation(); close(confirmValue()); }
            else if (e.key === 'Tab') {
                const items = [field, cancelBtn, okBtn].filter(Boolean);
                const i = items.indexOf(document.activeElement);
                e.preventDefault();
                items[(i + (e.shiftKey ? items.length - 1 : 1)) % items.length].focus();
            }
        };
        document.addEventListener('keydown', onKey, true);
        (field || (danger && cancelBtn) || okBtn).focus();
    });
}

export const kripixAlert = (message, opts = {}) =>
    kripixDialog({ title: opts.title || '', message, confirmText: opts.confirmText || 'Ho capito' });

export const kripixConfirm = (message, opts = {}) =>
    kripixDialog({ title: opts.title || '', message, confirmText: opts.confirmText || 'Conferma', cancelText: opts.cancelText || 'Annulla', danger: !!opts.danger });

export const kripixPrompt = (message, opts = {}) =>
    kripixDialog({ title: opts.title || '', message, confirmText: opts.confirmText || 'Conferma', cancelText: opts.cancelText || 'Annulla', danger: !!opts.danger, input: { placeholder: opts.placeholder || '', label: opts.label } });

// Disponibili anche agli script delle singole pagine
window.kripixAlert = kripixAlert;
window.kripixConfirm = kripixConfirm;
window.kripixPrompt = kripixPrompt;
