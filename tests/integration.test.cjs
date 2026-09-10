const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const pages = ['portfolio.html', 'product.html', 'app.html', 'projects.html', 'contact.html', 'blog/what-does-a-product-manager-do/index.html'];
const order = ['portfolio.html#about', 'product.html', 'app.html', 'projects.html', 'contact.html'];

test('business navigation is consistent and ordered on every page', () => {
    for (const page of pages) {
        const html = read(page);
        const nav = html.match(/<nav id="mainNav"[\s\S]*?<\/nav>/)[0];
        const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/^\//, ''));
        assert.deepEqual(hrefs, order, `${page} nav order`);
        assert.match(html, /data-menu-toggle aria-expanded="false" aria-controls="mainNav"/);
    }
    const portfolio = read('portfolio.html');
    assert.ok(portfolio.includes('Product Leader · Technology & AI'), 'dirty tagline preserved');
    assert.ok(portfolio.includes('href="product.html">Read the field guide'), 'about teaser present');
    const projects = read('projects.html');
    assert.ok(projects.includes('dispatch-map.svg'), 'dispatch map preserved');
    const product = read('product.html');
    assert.ok(product.includes('href="/blog/what-does-a-product-manager-do/"'), 'product links article');
    assert.ok(product.includes('href="/app.html"'), 'product links app');
    const sitemap = read('sitemap.xml');
    for (const url of ['product.html', 'app.html', 'blog/what-does-a-product-manager-do/']) {
        assert.ok(sitemap.includes(url), `sitemap missing ${url}`);
    }
});
