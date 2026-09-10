const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const assets = path.join(__dirname, '..', 'assets', 'editorial');
const scenes = {
  whiteboard: ['Start with a question', 'Not a feature.'],
  canvas: ['Lean canvas', 'Problem', 'People', 'Value', 'Test'],
  bus: ['The product bus', 'One more thing!', 'Next stop: learning'],
  roadmap: ['A map, not a promise', 'Now', 'Next', 'Later', 'Unknown'],
  stories: ['Slice the story', 'One giant story', 'Small, usable slices'],
  partnership: ['Build the bridge together', 'Product', 'Engineering', 'Shared understanding'],
  shipping: ['Deployed is not done', 'Shipped', 'Learned?', 'Look. Listen. Learn.'],
  systems: ['The system answers back', 'Change', 'People', 'Feedback'],
  flow: ['Watch the bottleneck', 'Work in', 'Review', 'Value out'],
  loop: ['Product is a practice', 'Discover', 'Decide', 'Build', 'Learn'],
  social: ['What does a Product Manager actually do?', 'Menguhan Bulut'],
};

test('the complete original editorial collection has scalable, labelled, self-contained scenes', () => {
  for (const [name, labels] of Object.entries(scenes)) {
    const file = path.join(assets, `${name}.svg`);
    assert.ok(fs.existsSync(file), `Missing editorial scene: ${name}.svg`);
    const svg = fs.readFileSync(file, 'utf8');
    const viewBox = name === 'social' ? '0 0 1200 630' : '0 0 720 480';
    assert.ok(svg.includes(`viewBox="${viewBox}"`), `${name}: complete viewBox`);
    assert.match(svg, /role="img" aria-labelledby="title desc"/);
    assert.match(svg, /<title id="title">.+<\/title>/);
    assert.match(svg, /<desc id="desc">.+<\/desc>/);
    assert.match(svg, /#f5f3ed/);
    assert.match(svg, /#282824/);
    assert.match(svg, /#0a66c2/);
    assert.match(svg, /stroke-linecap="round"/);
    assert.doesNotMatch(svg, /<script|<foreignObject|<image|@import|@font-face|\bon\w+=|(?:xlink:)?href=/i);
    const visibleText = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)]
      .map((match) => match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).join(' ');
    for (const label of labels) assert.ok(visibleText.includes(label), `${name}: visible label "${label}"`);
  }
});

test('the social preview is a real 1200 by 630 JPEG', () => {
  const file = path.join(assets, 'social.jpg');
  assert.ok(fs.existsSync(file), 'Missing raster social preview');
  const jpeg = fs.readFileSync(file);
  assert.deepEqual([...jpeg.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.deepEqual([...jpeg.subarray(-2)], [0xff, 0xd9]);
  if (process.platform === 'darwin') {
    const dimensions = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
    assert.match(dimensions, /pixelWidth: 1200/);
    assert.match(dimensions, /pixelHeight: 630/);
  }
});
