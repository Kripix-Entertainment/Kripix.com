// ============================================================
//  COMPONENTS.JS — Kripix Entertainment
//  Barra di navigazione, footer e tasto "torna su": uguali su
//  tutte le pagine. Ogni testo porta data-i18n per il traduttore.
// ============================================================

import { switchLanguage } from './translator.js';

// Rende switchLanguage accessibile dagli onclick inline
window.cambiaLingua = switchLanguage;


// ── LOGO ────────────────────────────────────────────────────
//  Il marchio KRIPIX disegnato come tracciato: niente font da
//  scaricare solo per il logo, e resta nitido a ogni dimensione.

export const LOGO_SVG = `<svg viewBox="57 -700 3966 700" role="img" aria-label="Kripix"><path d="M268 -150 255 -409 519 -700H776L480 -374L349 -240ZM57 0V-700H289V0ZM517 0 311 -272 464 -434 790 0ZM882 0V-700H1219Q1317 -700 1388.5 -668Q1460 -636 1499 -576.5Q1538 -517 1538 -436Q1538 -355 1499 -296.5Q1460 -238 1388.5 -207Q1317 -176 1219 -176H1013L1118 -273V0ZM1301 0 1129 -255H1379L1553 0ZM1118 -247 1013 -354H1204Q1253 -354 1276.5 -376Q1300 -398 1300 -436Q1300 -474 1276.5 -496Q1253 -518 1204 -518H1013L1118 -625ZM1687 0V-700H1923V0ZM2097 0V-700H2434Q2532 -700 2603.5 -668Q2675 -636 2714 -576.5Q2753 -517 2753 -436Q2753 -355 2714 -296Q2675 -237 2603.5 -204.5Q2532 -172 2434 -172H2228L2333 -273V0ZM2333 -247 2228 -354H2419Q2468 -354 2491.5 -376Q2515 -398 2515 -436Q2515 -474 2491.5 -496Q2468 -518 2419 -518H2228L2333 -625ZM2900 0V-700H3136V0ZM3245 0 3557 -436 3556 -271 3254 -700H3519L3695 -440L3582 -439L3754 -700H4008L3706 -280V-444L4023 0H3753L3577 -272L3686 -273L3514 0Z"/></svg>`;


// ── TEMA CHIARO / SCURO ─────────────────────────────────────
//  Di default il sito è scuro. Chi preferisce il chiaro lo sceglie
//  dalla barra e la scelta resta salvata su questo dispositivo.

const THEME_KEY = 'kripix_theme';

export function getTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* navigazione privata */ }
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        const light = theme === 'light';
        btn.setAttribute('aria-pressed', String(light));
        btn.setAttribute('aria-label', light ? 'Passa al tema scuro' : 'Passa al tema chiaro');
        btn.title = btn.getAttribute('aria-label');
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#e8e8e4' : '#07080b';
}


// ── PAGINA CORRENTE ─────────────────────────────────────────
//  Alcune pagine appartengono a una voce di menu: la scheda di
//  un gioco sta sotto Giochi, il checkout pure, e così via.

const PAGE_ALIASES = {
    'pagoda.html': 'progetti.html',
    'checkout.html': 'progetti.html',
    'engine.html': 'download.html',
    'contatti.html': 'faq.html',
};

function getCurrentPage() {
    const file = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    return file;
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
        } else if (target === parent && link.classList.contains('nav-link')) {
            link.classList.add('active');
        }
    });
}


// ── ICONE ───────────────────────────────────────────────────

const ICON_MOON = `<svg class="icon i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>`;
const ICON_SUN = `<svg class="icon i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;


// ── NAVBAR ──────────────────────────────────────────────────

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
        <button class="hamburger" type="button" aria-label="Apri il menu" aria-expanded="false" aria-controls="nav-menu"><span></span><span></span><span></span></button>
        <ul class="nav-menu" id="nav-menu">
            <li><a href="progetti.html" class="nav-link" data-i18n="Giochi">Giochi</a></li>
            <li><a href="studio.html" class="nav-link" data-i18n="Studio">Studio</a></li>
            <li><a href="download.html" class="nav-link" data-i18n="Launcher">Launcher</a></li>
            <li><a href="faq.html" class="nav-link" data-i18n="Assistenza">Assistenza</a></li>
            <li class="nav-spacer" aria-hidden="true"></li>
            <li class="nav-tools-item">
                <div class="nav-tools">
                    <div class="lang-switcher" role="group" aria-label="Lingua">
                        <button type="button" class="lang-btn" data-lang="it" lang="it" aria-label="Italiano" onclick="window.cambiaLingua('it')">IT</button>
                        <span class="lang-separator" aria-hidden="true">/</span>
                        <button type="button" class="lang-btn" data-lang="en" lang="en" aria-label="English" onclick="window.cambiaLingua('en')">EN</button>
                    </div>
                    <button type="button" class="icon-btn theme-toggle" aria-pressed="false" aria-label="Passa al tema chiaro" title="Passa al tema chiaro">${ICON_MOON}${ICON_SUN}</button>
                    <div id="nav-auth" class="nav-user-container"></div>
                </div>
            </li>
        </ul>
    `;

    markActiveLinks(nav);

    // Tema
    setTheme(getTheme());
    nav.querySelector('.theme-toggle').addEventListener('click', () => {
        setTheme(getTheme() === 'light' ? 'dark' : 'light');
    });

    // Barra trasparente sopra le immagini d'apertura, solida scorrendo
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Menu mobile
    const hamburger = nav.querySelector('.hamburger');
    const menu = nav.querySelector('.nav-menu');
    const setMenu = (open) => {
        hamburger.classList.toggle('active', open);
        menu.classList.toggle('active', open);
        nav.classList.toggle('menu-open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
        document.body.classList.toggle('no-scroll', open);
    };
    hamburger.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            setMenu(false);
            hamburger.focus();
        }
    });
}


// ── FOOTER ──────────────────────────────────────────────────

export function injectFooter() {
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
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    refresh();
}
