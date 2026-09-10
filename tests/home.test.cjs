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

test('top-right cluster exposes apps menu and account entry', () => {
    for (const page of ['index.html', 'news.html']) {
        const html = read(page);
        assert.match(html, /id="appsBtn"[^>]*aria-haspopup="true"[^>]*aria-controls="appsMenu"/);
        assert.match(html, /id="accountBtn"[^>]*aria-haspopup="dialog"[^>]*aria-controls="accountDialog"/);
        assert.match(html, /<nav class="apps-menu" id="appsMenu"[^>]*hidden>/);
        assert.match(html, /<a href="\/portfolio\.html">/);
        assert.match(html, /<a href="\/news\.html">/);
        assert.match(html, /id="accountDialog"[^>]*role="dialog"/);
        assert.match(html, /prefers-reduced-motion/);
        assert.match(html, /setupMenus|setMenuState/);
    }
});

test('news shell previews step 4 without dead ends', () => {
    const html = read('news.html');
    assert.match(html, /<title>Tech News \| Menguhan Bulut<\/title>/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.menguhan\.com\/news\.html"/);
    assert.match(html, /step 4/i);
    assert.match(html, /<a href="\/portfolio\.html"/);
    const sitemap = read('sitemap.xml');
    assert.ok(sitemap.includes('news.html'), 'sitemap missing news');
});
