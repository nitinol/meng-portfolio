const assert = require('node:assert/strict');
const { test } = require('node:test');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => existsSync(path.join(root, file)) ? readFileSync(path.join(root, file), 'utf8') : '';
const stages = ['Prepare', 'Coordinate', 'Configure', 'Validate', 'Submit', 'Release', 'Monitor', 'Improve'];

test('APP delivers the complete readable release journey and page contracts', () => {
    const html = read('app.html');
    assert.match(html, /<h1>From Build to Storefront\.<\/h1>/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const text of [
        'End-to-End Mobile Release Management',
        'I manage the complete mobile release lifecycle across Google Play, Apple App Store and Huawei AppGallery — from release preparation and cross-functional coordination to store submission, rollout and post-release monitoring.',
        'Releasing an app is not an upload. It is a coordinated product operation.',
        'One Release. Three Ecosystems. End-to-End Ownership.',
        'Illustrative', 'Google Play', 'Apple App Store', 'Huawei AppGallery',
        'Product', 'Development', 'QA', 'UX/UI', 'Marketing', 'Campaign/CRM',
        'Analytics', 'Store Operations', 'Release Monitoring',
        'readiness', 'new app', 'update', 'screenshots', 'metadata', 'requirements',
        'testing', 'submission', 'review', 'phased rollout', 'production',
        'ratings', 'crashes', 'hotfix'
    ]) assert.ok(html.includes(text), `Missing visible content: ${text}`);
    for (const stage of stages) {
        const id = stage.toLowerCase();
        assert.match(html, new RegExp(`href="#${id}"`));
        assert.match(html, new RegExp(`<section id="${id}"[^>]*data-release-stage[^>]*>[\\s\\S]+?<h3>${stage}<\\/h3>[\\s\\S]+?<ul>[\\s\\S]+?<\\/section>`));
    }
    assert.doesNotMatch(html, /\bhidden\b|display:\s*none|\d+%|\d+\s*(?:downloads|users)|live dashboard/i);
    for (const href of ['/portfolio.html#about', '/product.html', '/app.html', '/projects.html', '/contact.html']) {
        assert.ok(html.includes(`href="${href}"`));
    }
    assert.match(html, /data-menu-toggle aria-expanded="false" aria-controls="mainNav"/);
    assert.doesNotMatch(html, /src="\/?script\.js/);
    assert.match(html, /href="\/portfolio-light\.css\?v=20260910-btn1"/);
    assert.match(html, /href="\/release\.css\?v=20260910"/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.menguhan\.com\/app.html"/);
    assert.match(html, /property="og:image" content="https:\/\/www\.menguhan\.com\/assets\/editorial\/social.jpg"/);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.author['@id'], 'https://www.menguhan.com/#person');
    for (const host of ['support.google.com/googleplay/android-developer', 'developer.apple.com/help/app-store-connect', 'developer.huawei.com/consumer/en/doc']) {
        assert.ok(html.includes(`https://${host}`));
    }
});

test('release presentation protects readable mobile fallbacks and reduced motion', () => {
    const css = read('release.css');
    assert.match(css, /\.release-page/);
    assert.match(css, /\.release-passport\s*\{[^}]*position:\s*sticky/s);
    assert.match(css, /\.release-page\s+:focus-visible\s*\{[^}]*outline:/s);
    assert.match(css, /\.release-page \.pl-header nav\s*\{[^}]*display:\s*flex/s);
    assert.match(css, /\.release-page \.pl-header\.nav-enhanced nav:not\(\.active\)\s*\{[^}]*display:\s*none/s);
    assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.match(css, /transition:\s*none/);
    assert.match(css, /scroll-behavior:\s*auto/);
    assert.doesNotMatch(css, /\.release-stage\s*\{[^}]*(?:display:\s*none|opacity:\s*0)/s);
});

function releaseBrowser(hash = '') {
    const events = {};
    const frames = [];
    const outputs = {};
    const links = stages.map((title) => ({
        hash: `#${title.toLowerCase()}`,
        attributes: {},
        handlers: {},
        setAttribute(key, value) { this.attributes[key] = value; },
        removeAttribute(key) { delete this.attributes[key]; },
        addEventListener(name, handler) { this.handlers[name] = handler; }
    }));
    const sections = stages.map((title, index) => ({
        id: title.toLowerCase(), top: 100 + index * 500,
        dataset: { checkpoint: `Checkpoint ${title}` },
        classList: { toggle() {} },
        querySelector(selector) { return { textContent: selector === 'h3' ? title : `Responsibility ${title}` }; },
        getBoundingClientRect() { return { top: this.top }; },
        focus() { assert.fail('Passive navigation must not move focus'); },
        scrollIntoView() { assert.fail('Passive tracking must not force scrolling'); }
    }));
    const document = {
        querySelectorAll(selector) { return selector === '[data-release-stage]' ? sections : links; },
        querySelector(selector) { return outputs[selector] ||= { textContent: '' }; }
    };
    const window = {
        location: { hash }, innerHeight: 900,
        addEventListener(name, handler) { events[name] = handler; },
        requestAnimationFrame(callback) { frames.push(callback); }
    };
    vm.runInNewContext(read('release.js'), { document, window });
    return { links, sections, outputs, events, window, flush: () => frames.splice(0).forEach((callback) => callback()) };
}

test('selecting a stage updates the passport and exposes exactly one current step', () => {
    const browser = releaseBrowser();
    browser.links[5].handlers.click?.({});
    assert.equal(browser.outputs['[data-passport-title]']?.textContent, 'Release');
    assert.equal(browser.outputs['[data-passport-number]'].textContent, '06 / 08');
    assert.equal(browser.outputs['[data-passport-summary]'].textContent, 'Responsibility Release');
    assert.equal(browser.outputs['[data-passport-outcome]'].textContent, 'Conceptual checkpoint: Checkpoint Release');
    assert.deepEqual(browser.links.filter((link) => link.attributes['aria-current'] === 'step').map((link) => link.hash), ['#release']);
    assert.match(read('app.html'), /<script src="\/release\.js\?v=20260910-btn1" defer><\/script>/);
});

test('passive scrolling selects the last stage above the reading line without moving focus', () => {
    const browser = releaseBrowser();
    browser.sections.forEach((section) => { section.top -= 2900; });
    browser.events.scroll?.();
    browser.flush();
    assert.equal(browser.outputs['[data-passport-title]']?.textContent, 'Monitor');
    browser.sections.forEach((section, index) => { section.top = 100 + index * 500; });
    browser.events.scroll();
    browser.flush();
    assert.equal(browser.outputs['[data-passport-title]'].textContent, 'Prepare');
});

test('direct stage URLs and history changes orient the passport without forced scrolling', () => {
    const browser = releaseBrowser('#improve');
    assert.equal(browser.outputs['[data-passport-title]']?.textContent, 'Improve');
    browser.window.location.hash = '#configure';
    browser.events.hashchange();
    assert.equal(browser.outputs['[data-passport-title]'].textContent, 'Configure');
    browser.window.location.hash = '#unrelated';
    browser.events.hashchange();
    assert.equal(browser.outputs['[data-passport-title]'].textContent, 'Configure');
    assert.equal(releaseBrowser().outputs['[data-passport-title]'].textContent, 'Prepare');
});
