const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('severance landing is gone; homepage is the living atmosphere', () => {
    const html = read('index.html');
    assert.doesNotMatch(html, /SEVERANCE|split-container|left-split/i);
    assert.match(html, /id="skyLayer"/);
    assert.match(html, /api\.open-meteo\.com/);
    assert.match(html, /ipapi\.co/);
    assert.match(html, /id="wCond"/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.menguhan\.com\/"/);
    assert.match(html, /"@type":\s*"Person"/);
    assert.match(html, /gtag.*G-TE4EZV6NZH/s);
});

test('top-right cluster exposes apps menu with portfolio, news and moonstove tiles', () => {
    for (const page of ['index.html', 'news.html']) {
        const html = read(page);
        assert.match(html, /id="appsBtn"[^>]*aria-haspopup="true"[^>]*aria-controls="appsMenu"/);
        assert.doesNotMatch(html, /id="accountBtn"/);
        assert.match(html, /<nav class="apps-menu" id="appsMenu"[^>]*hidden>/);
        assert.match(html, /<a class="app-tile" href="\/portfolio\.html">/);
        assert.match(html, /Enjoy the latest tech news/);
        assert.match(html, /<a class="app-tile" href="https:\/\/www\.moonstove\.com" target="_blank"/);
        assert.match(html, /src="\/assets\/moonstove\.svg"/);
        assert.doesNotMatch(html, /id="moonDialog"/);
        assert.match(html, /prefers-reduced-motion/);
        assert.match(html, /setupMenus|setMenuState/);
    }
    assert.ok(read('assets/moonstove.svg').includes('#fe6b01'), 'moonstove brand mark');
    for (const page of ['index.html', 'news.html']) {
        const html = read(page);
        assert.match(html, /text-transform:\s*uppercase/, `${page} compact uppercase tiles`);
        assert.match(html, /app-visual contain/, `${page} moonstove fully visible`);
        assert.match(html, /id="wLink"[^>]*weather\.com/, `${page} weather link`);
        assert.match(html, /weather\.com\/weather\/today\/l\//, `${page} location weather URL`);
    }
});

test('landing shows a random insight with picture; news uses original images', () => {
    const index = read('index.html');
    assert.match(index, /id="spotImg"/);
    assert.match(index, /id="spotText"/);
    assert.match(index, /src="\/info-spotlight\.js\?v=20260911-sp1"/);
    const spots = read('info-spotlight.js');
    assert.ok((spots.match(/text:/g) || []).length >= 8, 'a week of insights');
    assert.match(spots, /Math\.random/);
    const news = read('news.html');
    assert.match(news, /&meta=true/);
    assert.doesNotMatch(news, /screenshot=true/);
    assert.match(news, /shotLink/);
    assert.match(news, /aria-label/);
});

test('news page serves a live client-side tech feed', () => {
    const html = read('news.html');
    assert.match(html, /<title>Tech News \| Menguhan Bulut<\/title>/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.menguhan\.com\/news\.html"/);
    assert.match(html, /hn\.algolia\.com\/api\/v1\/search/);
    assert.match(html, /data-feed="top"/);
    assert.match(html, /data-feed="android"/);
    assert.match(html, /data-feed="ios"/);
    assert.match(html, /data-feed="ai"/);
    assert.match(html, /id="newsList"/);
    assert.match(html, /<a class="app-tile" href="\/portfolio\.html">/);
    const sitemap = read('sitemap.xml');
    assert.ok(sitemap.includes('news.html'), 'sitemap missing news');
});

test('home button, sticky bars and coming-soon account note are consistent', () => {
    const pages = ['index.html', 'news.html', 'portfolio.html', 'product.html', 'app.html', 'projects.html', 'contact.html', 'blog/what-does-a-product-manager-do/index.html'];
    for (const page of pages) {
        assert.match(read(page), /aria-label="Home"/, `${page} home button`);
        assert.match(read(page), /page-fade\.js/, `${page} transition script`);
    }
    const css = read('portfolio-light.css');
    assert.match(css, /\.pl-topbar\s*\{[^}]*position:\s*sticky/s);
    assert.match(css, /\.pl-topbar\.no-stick\s*\{[^}]*position:\s*static/s);
    assert.match(css, /\.home-btn\s*\{[^}]*position:\s*fixed[^}]*left:\s*40px[^}]*top:\s*32px/s);
    assert.match(css, /\.home-btn\s*\{[^}]*color:\s*#fff/s);
    assert.match(read('portfolio.html'), /pl-topbar no-stick/);
    for (const page of ['index.html', 'news.html']) {
        assert.match(read(page), /home-fixed/);
    }
    assert.match(read('page-fade.js'), /prefers-reduced-motion/);
});
