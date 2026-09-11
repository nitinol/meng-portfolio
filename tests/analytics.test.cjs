const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const pages = [
    'index.html', 'news.html', 'portfolio.html', 'projects.html',
    'contact.html', 'product.html', 'app.html',
    'blog/what-does-a-product-manager-do/index.html',
    'personal.html', 'adaptive-demo.html', 'success.html'
];

test('every page loads pageview tracking and the events helper', () => {
    const gtmPages = ['personal.html', 'adaptive-demo.html', 'success.html'];
    for (const page of pages) {
        const html = read(page);
        if (gtmPages.includes(page)) {
            assert.match(html, /googletagmanager\.com\/gtm\.js/, `${page} GTM`);
            assert.match(html, /GTM-P4C7N3BT/, `${page} GTM id`);
        } else {
            assert.match(html, /googletagmanager\.com\/gtag\/js\?id=G-TE4EZV6NZH/, `${page} gtag`);
            assert.match(html, /gtag\('config', 'G-TE4EZV6NZH'\)/, `${page} config`);
        }
        assert.match(html, /analytics\.js\?v=20260911-an1/, `${page} helper`);
    }
});

test('key interactions are tagged for events', () => {
    for (const page of ['index.html', 'news.html']) {
        const html = read(page);
        assert.match(html, /data-track="menu_open"/);
        assert.match(html, /data-track="tile" data-app="portfolio"/);
        assert.match(html, /data-track="tile" data-app="news"/);
        assert.match(html, /data-track="tile" data-app="moonstove"/);
    }
    assert.match(read('news.html'), /data-track="news_tab"/);
});

test('events fire via gtag, respect opt-out, never throw', () => {
    const calls = [];
    const clicked = [];
    const doc = {
        addEventListener(name, handler) { doc.handler = handler; }
    };
    function fire(attrs) {
        doc.handler({ target: { closest: () => attrs } });
    }
    vm.runInNewContext(read('analytics.js'), {
        document: doc,
        window: { gtag: (type, name, params) => calls.push([name, params]) },
        navigator: {}
    });
    fire({ getAttribute: (k) => ({ 'data-track': 'menu_open' }[k]) });
    fire({ getAttribute: (k) => ({ 'data-track': 'tile', 'data-app': 'moonstove' }[k]) });
    fire({ getAttribute: (k) => ({ 'data-track': 'news_tab', 'data-feed': 'ai' }[k]) });
    assert.equal(JSON.stringify(calls), JSON.stringify([
        ['menu_open', {}],
        ['tile_click', { app: 'moonstove' }],
        ['news_tab', { topic: 'ai' }]
    ]));
    // Do-Not-Track disables everything without errors.
    let attached = false;
    vm.runInNewContext(read('analytics.js'), {
        document: { addEventListener: () => { attached = true; } },
        window: {},
        navigator: { doNotTrack: '1' }
    });
    assert.equal(attached, false);
    clicked.push('ok');
});
