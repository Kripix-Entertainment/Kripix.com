// ============================================================
//  LOCAL-GUARD.JS — Kripix Entertainment
//  Se una pagina viene aperta come file (doppio clic, indirizzo
//  file://), il browser blocca gli script del sito: accesso,
//  notizie e acquisti non funzionerebbero e la pagina resterebbe
//  a metà. Invece di mostrarla rotta, la copriamo con una
//  schermata che spiega come aprirla nel modo giusto.
//
//  È uno script classico (non un modulo) apposta: i moduli da
//  file:// non partono, questo sì.
// ============================================================

(function () {
    if (location.protocol !== 'file:') return;

    var root = document.documentElement;
    root.classList.add('is-file');

    var page = (location.pathname.split('/').pop() || 'index.html');
    if (!/\.html?$/i.test(page)) page = 'index.html';
    var url = 'http://localhost:5173/' + page + location.search + location.hash;

    var en = false;
    try { en = localStorage.getItem('kripix_lang') === 'en'; } catch (e) {}
    var T = en ? {
        title: 'Open the site with the local server',
        text: 'You opened this page straight from your computer (a file:// address). For security reasons the browser blocks the site’s scripts this way, so login, news, purchases and animations wouldn’t work.',
        step1: 'Open a terminal in the site folder and start the server:',
        step2: 'Then open this page here:',
        open: 'Open on localhost:5173',
        copy: 'Copy', copied: 'Copied',
        alt: 'Using VS Code? Right-click the file and choose “Open with Live Server”. With Python: python -m http.server 5173'
    } : {
        title: 'Apri il sito con il server locale',
        text: 'Hai aperto questa pagina direttamente dal computer (indirizzo file://). In questo modo il browser, per sicurezza, blocca gli script del sito: accesso, notizie, acquisti e animazioni non funzionerebbero.',
        step1: 'Apri un terminale nella cartella del sito e avvia il server:',
        step2: 'Poi apri questa pagina da qui:',
        open: 'Apri su localhost:5173',
        copy: 'Copia', copied: 'Copiato',
        alt: 'Usi VS Code? Clic destro sul file e scegli “Open with Live Server”. Con Python: python -m http.server 5173'
    };

    // Finché la schermata non c'è, la pagina rotta non si vede
    var css = document.createElement('style');
    css.textContent =
        'html.is-file body > :not(#local-guard){display:none !important}' +
        'html.is-file body{padding:0 !important;margin:0 !important;overflow:auto !important}' +
        '#local-guard,#local-guard *{box-sizing:border-box}' +
        '#local-guard{min-height:100vh;display:grid;place-items:center;padding:32px 20px;background:var(--bg,#07080b);color:var(--text,#ece9df);font-family:var(--font-body,system-ui,sans-serif)}' +
        '#local-guard .lg-box{width:100%;max-width:560px}' +
        '#local-guard .lg-logo{font-family:var(--font-display,sans-serif);font-weight:900;letter-spacing:.08em;font-size:1.2rem;margin-bottom:40px}' +
        '#local-guard h1{font-family:var(--font-display,sans-serif);font-weight:900;text-transform:uppercase;font-size:clamp(2.4rem,8vw,3.6rem);line-height:.92;margin:0 0 18px}' +
        '#local-guard h1::after{content:"";display:block;width:56px;height:4px;margin-top:18px;background:var(--red,#d23a2c)}' +
        '#local-guard p{color:var(--text-soft,#cbc8bd);line-height:1.6;margin:0 0 22px}' +
        '#local-guard .lg-step{color:var(--text-muted,#94918a);font-size:.95rem;margin:0 0 10px}' +
        '#local-guard .lg-cmd{display:flex;align-items:center;gap:10px;background:var(--surface,#111318);border:1px solid var(--line-strong,rgba(236,233,223,.22));border-radius:6px;padding:12px 12px 12px 16px;margin-bottom:24px}' +
        '#local-guard code{flex:1;min-width:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.95rem;overflow-x:auto;white-space:nowrap}' +
        '#local-guard button,#local-guard a.lg-open{font-family:var(--font-display,sans-serif);font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:4px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}' +
        '#local-guard button{background:none;border:1px solid var(--line-strong,rgba(236,233,223,.22));color:inherit;padding:8px 14px;font-size:.95rem}' +
        '#local-guard a.lg-open{background:var(--gold,#e3c66c);color:var(--on-gold,#15120a);padding:14px 24px;font-size:1.1rem;margin-bottom:28px}' +
        '#local-guard small{display:block;color:var(--text-muted,#94918a);font-size:.85rem;line-height:1.6}';
    (document.head || root).appendChild(css);

    function show() {
        if (document.getElementById('local-guard')) return;
        var g = document.createElement('main');
        g.id = 'local-guard';
        g.setAttribute('role', 'alert');
        g.innerHTML =
            '<div class="lg-box">' +
                '<div class="lg-logo">KRIPIX</div>' +
                '<h1></h1><p class="lg-text"></p>' +
                '<p class="lg-step lg-s1"></p>' +
                '<div class="lg-cmd"><code>node scripts/dev-server.js</code><button type="button" class="lg-copy"></button></div>' +
                '<p class="lg-step lg-s2"></p>' +
                '<a class="lg-open"></a>' +
                '<small class="lg-alt"></small>' +
            '</div>';
        g.querySelector('h1').textContent = T.title;
        g.querySelector('.lg-text').textContent = T.text;
        g.querySelector('.lg-s1').textContent = T.step1;
        g.querySelector('.lg-s2').textContent = T.step2;
        var open = g.querySelector('.lg-open');
        open.textContent = T.open;
        open.href = url;
        g.querySelector('.lg-alt').textContent = T.alt;

        var copy = g.querySelector('.lg-copy');
        copy.textContent = T.copy;
        copy.addEventListener('click', function () {
            var cmd = 'node scripts/dev-server.js';
            var ok = function () { copy.textContent = T.copied; setTimeout(function () { copy.textContent = T.copy; }, 1800); };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(cmd).then(ok, fallback);
            } else fallback();
            function fallback() {
                var t = document.createElement('textarea');
                t.value = cmd; t.style.position = 'fixed'; t.style.opacity = '0';
                document.body.appendChild(t); t.select();
                try { document.execCommand('copy'); ok(); } catch (e) {}
                t.remove();
            }
        });

        document.body.insertBefore(g, document.body.firstChild);
        document.title = T.title + ' | Kripix';
    }

    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
})();
