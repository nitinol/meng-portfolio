(() => {
    const bar = document.querySelector('[data-reading-progress]');
    const links = Array.from(document.querySelectorAll('[data-toc-link]'));
    const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateProgress() {
        if (!bar) return;
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? Math.min(1, Math.max(0, window.pageYOffset / max)) : 0;
        bar.style.width = `${Math.round(ratio * 100)}%`;
    }

    function markCurrent(id) {
        links.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    }

    if ('IntersectionObserver' in window && chapters.length && !reduceMotion) {
        const seen = new Set();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    seen.add(entry.target.id);
                    markCurrent(entry.target.id);
                }
            });
        }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
        chapters.forEach((chapter) => observer.observe(chapter));
    } else if (chapters.length) {
        markCurrent(chapters[0].id);
    }

    let queued = false;
    window.addEventListener('scroll', () => {
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(() => { updateProgress(); queued = false; });
    }, { passive: true });
    updateProgress();
})();
