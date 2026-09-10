const assert = require('node:assert/strict');
const { test } = require('node:test');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const chapters = ['discovery', 'lean-canvas', 'inception', 'stakeholders', 'roadmap', 'stories-sizing', 'developers', 'technical-literacy', 'iterations', 'release-measurement', 'systems', 'flow', 'pm-definition'];

test('article delivers complete chapters, illustrations and legal bookshelf', () => {
    const file = 'blog/what-does-a-product-manager-do/index.html';
    assert.ok(existsSync(path.join(root, file)), 'article page exists');
    const html = read(file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /<h1>What does a product manager actually do\?<\/h1>/);
    for (const id of [...chapters, 'pm-loop', 'bookshelf']) {
        assert.match(html, new RegExp(`id="${id}"`));
        assert.match(html, new RegExp(`href="#${id}"`));
    }
    for (const marker of [
        'What problem are we actually solving',
        'A good Product Manager doesn&#39;t hide uncertainty',
        'Get everyone on the bus before you hit the accelerator',
        'Slice the work. Don&#39;t slice the value',
        'Technical literacy improves conversations',
        'Output is what we shipped. Outcome is what changed',
        'Don&#39;t optimize a gear while ignoring the machine',
        'Starting more work is easy. Finishing valuable work is the game',
        'A Product Manager creates clarity where there is uncertainty',
        '34-point user story'
    ]) assert.ok(html.includes(marker) || html.includes(marker.replace(/&#39;/g, "'")), `missing prose: ${marker}`);
    for (const art of ['whiteboard', 'canvas', 'bus', 'roadmap', 'stories', 'partnership', 'shipping', 'systems', 'flow', 'loop']) {
        assert.ok(html.includes(`/assets/editorial/${art}.svg`), `missing illustration ${art}`);
    }
    for (const book of ['Running Lean', 'The Lean Startup', 'The Agile Samurai', 'User Stories Applied', 'Extreme Programming Explained', 'Thinking in Systems', 'The Goal', 'The Phoenix Project', 'But How Do It Know?']) {
        assert.ok(html.includes(book), `missing book ${book}`);
    }
    assert.doesNotMatch(html, /Download PDF|\.pdf|\.epub/i);
    for (const host of ['leanstack.com', 'theleanstartup.com', 'pragprog.com', 'mountaingoatsoftware.com', 'pearson.com', 'chelseagreen.com', 'eligoldratt.com', 'itrevolution.com', 'buthowdoitknow.com']) {
        assert.ok(html.includes(host), `missing legal link ${host}`);
    }
    assert.match(html, /rel="canonical" href="https:\/\/www\.menguhan\.com\/blog\/what-does-a-product-manager-do\/"/);
    assert.match(html, /"@type":\s*"Article"/);
    assert.match(html, /"@type":\s*"BreadcrumbList"/);
    assert.match(html, /"@id":\s*"https:\/\/www\.menguhan\.com\/#person"/);
    assert.match(html, /property="og:image" content="https:\/\/www\.menguhan\.com\/assets\/editorial\/social\.jpg"/);
    assert.match(html, /data-reading-progress/);
    assert.match(html, /data-toc-link/);
    assert.doesNotMatch(html, /src="\/?script\.js/);
});

test('editorial assets and helpers stay local, declarative and calm', () => {
    const css = read('editorial.css');
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    const js = read('editorial.js');
    assert.doesNotMatch(js, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/);
    vm.runInNewContext(js, {
        document: { querySelector: () => ({ style: {} }), querySelectorAll: () => [], documentElement: { scrollHeight: 1000 } },
        window: { matchMedia: () => ({ matches: true }), addEventListener: () => {}, requestAnimationFrame: () => {}, innerHeight: 800, pageYOffset: 0 }
    });
    assert.ok(js.includes('prefers-reduced-motion') || js.includes('matchMedia'), 'reduced-motion aware');
});
