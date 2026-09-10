// Soft page transitions: the old page dissolves out, the new page dissolves
// in — no black overlay, no flicker. Progressive enhancement only: without
// JS the site renders and navigates normally. Skipped under reduced-motion.
(function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var body = document.body;
    body.style.transition = 'opacity .22s ease';
    body.style.opacity = '0';

    function reveal() {
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { body.style.opacity = '1'; });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', reveal);
    } else {
        reveal();
    }

    // Back/forward cache can restore mid-fade state — always land visible.
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) body.style.opacity = '1';
    });

    document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        var a = e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
        if (/^(mailto|tel|javascript):/i.test(href)) return;
        var url;
        try { url = new URL(href, window.location.href); }
        catch (err) { return; }
        if (url.origin !== window.location.origin) return;
        if (url.href === window.location.href) return;
        e.preventDefault();
        body.style.opacity = '0';
        setTimeout(function () { window.location.href = url.href; }, 200);
    });
})();
