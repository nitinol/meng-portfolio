(() => {
    const stages = Array.from(document.querySelectorAll('[data-release-stage]'));
    const links = Array.from(document.querySelectorAll('.release-stage-nav a'));
    let scrollQueued = false;

    function writePassport(stage, index) {
        document.querySelector('[data-passport-title]').textContent = stage.querySelector('h3').textContent;
        document.querySelector('[data-passport-number]').textContent = `${String(index + 1).padStart(2, '0')} / 08`;
        document.querySelector('[data-passport-summary]').textContent = stage.querySelector('.release-stage-summary').textContent;
        document.querySelector('[data-passport-outcome]').textContent = `Conceptual checkpoint: ${stage.dataset.checkpoint}`;
    }

    function markCurrentLink(link, stage) {
        if (link.hash === `#${stage.id}`) {
            link.setAttribute('aria-current', 'step');
        } else {
            link.removeAttribute('aria-current');
        }
    }

    function selectStage(index) {
        const stage = stages[index];
        links.forEach((link) => markCurrentLink(link, stage));
        stages.forEach((item) => item.classList.toggle('is-current', item === stage));
        writePassport(stage, index);
    }

    function trackReadingPosition() {
        const readingLine = Math.min(window.innerHeight * 0.3, 240);
        const index = stages.reduce((current, stage, position) => stage.getBoundingClientRect().top <= readingLine ? position : current, 0);
        selectStage(index);
        scrollQueued = false;
    }

    function queueReadingPosition() {
        if (scrollQueued) return;
        scrollQueued = true;
        window.requestAnimationFrame(trackReadingPosition);
    }

    function selectStageById(id) {
        const index = stages.findIndex((stage) => stage.id === id);
        if (index >= 0) selectStage(index);
    }

    function orientFromLocation(isInitial) {
        const hash = window.location && typeof window.location.hash === 'string' ? window.location.hash.replace('#', '') : '';
        const index = stages.findIndex((stage) => stage.id === hash);
        if (index >= 0) {
            selectStage(index);
        } else if (isInitial) {
            selectStage(0);
        }
    }

    links.forEach((link, index) => link.addEventListener('click', () => selectStage(index)));
    window.addEventListener('scroll', queueReadingPosition, { passive: true });
    window.addEventListener('hashchange', () => orientFromLocation(false));
    orientFromLocation(true);
})();
