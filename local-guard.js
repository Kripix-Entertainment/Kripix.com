// ============================================================
//  LOCAL-GUARD.JS — Kripix Entertainment
//  Se una pagina viene aperta come file (indirizzo file://)
//  l'accesso viene negato: il contenuto della pagina non viene
//  mostrato e al suo posto compare un messaggio generico.
//
//  È uno script classico (non un modulo) apposta: i moduli da
//  file:// non partono, questo sì.
// ============================================================

(function () {
    if (location.protocol !== 'file:') return;

    var root = document.documentElement;
    root.classList.add('is-file');

    var en = false;
    try { en = localStorage.getItem('kripix_lang') === 'en'; } catch (e) {}
    var T = en ? {
        code: 'Access denied',
        title: 'This page can’t be opened',
        text: 'Access to this page was denied because it was opened locally.'
    } : {
        code: 'Accesso negato',
        title: 'Questa pagina non si può aprire',
        text: 'L’accesso a questa pagina è stato negato perché è stata avviata in locale.'
    };

    // Il contenuto della pagina non viene mai mostrato
    var css = document.createElement('style');
    css.textContent =
        'html.is-file body > :not(#local-guard){display:none !important}' +
        'html.is-file body{padding:0 !important;margin:0 !important;overflow:hidden !important}' +
        '#local-guard,#local-guard *{box-sizing:border-box}' +
        '#local-guard{min-height:100vh;display:flex;align-items:center;padding:32px clamp(20px,6vw,80px);background:#07080b;color:#ece9df;font-family:Archivo,system-ui,-apple-system,"Segoe UI",sans-serif}' +
        '#local-guard .lg-box{max-width:620px}' +
        '#local-guard .lg-code{display:inline-flex;align-items:center;gap:8px;font-size:.85rem;font-weight:700;color:#d23a2c;margin:0 0 18px}' +
        '#local-guard .lg-code::before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor}' +
        '#local-guard h1{font-family:"Big Shoulders Display","Arial Narrow",sans-serif;font-weight:900;text-transform:uppercase;font-size:clamp(2.6rem,9vw,5rem);line-height:.9;margin:0 0 20px}' +
        '#local-guard h1::after{content:"";display:block;width:64px;height:4px;margin-top:20px;background:#d23a2c}' +
        '#local-guard p.lg-text{color:#cbc8bd;font-size:clamp(1rem,1.6vw,1.2rem);line-height:1.6;margin:0}';
    (document.head || root).appendChild(css);

    function show() {
        if (document.getElementById('local-guard')) return;
        var g = document.createElement('main');
        g.id = 'local-guard';
        g.setAttribute('role', 'alert');
        g.innerHTML = '<div class="lg-box"><p class="lg-code"></p><h1></h1><p class="lg-text"></p></div>';
        g.querySelector('.lg-code').textContent = T.code;
        g.querySelector('h1').textContent = T.title;
        g.querySelector('.lg-text').textContent = T.text;
        document.body.insertBefore(g, document.body.firstChild);
        document.title = T.code + ' | Kripix';
    }

    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
})();
