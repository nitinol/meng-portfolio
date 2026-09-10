// Soft page transitions: gentle fade-in on load, fade-out on same-site
// navigation. Progressive enhancement only — without JS the site renders
// and navigates normally. Skipped entirely under reduced-motion.
(function () {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;opacity:1;pointer-events:none;transition:opacity .35s ease;z-index:200;';

    function fadeIn() {
        document.body.appendChild(overlay);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { overlay.style.opacity = '0'; });
        });
        setTimeout(function () { overlay.remove(); }, 450);
    }

    function fadeOutTo(url) {
        document.body.appendChild(overlay);
        overlay.style.transition = 'opacity .25s ease';
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { overlay.style.opacity = '1'; });
        });
        setTimeout(function () { window.location.href = url; }, 260);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fadeIn);
    } else {
        fadeIn();
    }

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
        fadeOutTo(url.href);
    });
})();
