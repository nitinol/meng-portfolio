(() => {
    const header = document.querySelector('.pl-header');
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('mainNav');
    if (!header || !toggle || !nav) return;
    header.classList.add('nav-enhanced');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('active');
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
})();
