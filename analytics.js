// Shared analytics events: menu opens, app-tile clicks, news tab switches.
// Fires only when gtag loaded; honors Do-Not-Track; never breaks the page.
(function () {
    if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') return;

    function track(name, params) {
        try {
            if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
        } catch (e) { /* analytics must never break content */ }
    }

    document.addEventListener('click', function (e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-track]') : null;
        if (!el) return;
        var kind = el.getAttribute('data-track');
        if (kind === 'menu_open') track('menu_open');
        else if (kind === 'tile') track('tile_click', { app: el.getAttribute('data-app') || 'unknown' });
        else if (kind === 'news_tab') track('news_tab', { topic: el.getAttribute('data-feed') || 'unknown' });
    });
})();
