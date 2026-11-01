import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../src/app/learn/physics/motion-visual/page.tsx', import.meta.url), 'utf8');
assert.match(page, /const v0 = 2; const a = 3;/);
assert.match(page, /const x = v0 \* t \+ 0\.5 \* a \* t \* t; const v = v0 \+ a \* t;/);
assert.match(page, /const px = 35 \+ \(x \/ 32\) \* 300;/);
assert.match(page, /viewBox="0 0 440 130"/);
assert.match(page, /const tickX = 35 \+ i \* 37\.5/);
assert.match(page, /const velocityArrowEnd = px \+ velocityArrowLength;/);
assert.match(page, /aria-label="時刻" type="range" min="0" max="4" step="0\.01"/);
assert.match(page, /i \* 4/);
assert.match(page, /Math\.min\(px-10, 350\)/);
assert.match(page, /位置\$\{x\.toFixed\(2\)\}メートル/);

for (const time of [0, 0.01, 0.5, 1, 2.35, 4]) {
  const position = 2 * time + 0.5 * 3 * time ** 2;
  const velocity = 2 + 3 * time;
  assert.ok(position >= 0 && position <= 32, `position must remain on the displayed 0–32 m axis at t=${time}`);
  assert.ok(velocity >= 2 && velocity <= 14, `velocity must agree with v=v₀+at at t=${time}`);
  const markerX = 35 + (position / 32) * 300;
  const expectedTickX = 35 + (position / 4) * 37.5;
  assert.ok(Math.abs(markerX - expectedTickX) < 1e-9, `position marker must align with the labeled meter scale at t=${time}`);
  const arrowEnd = markerX + velocity * 5;
  assert.ok(arrowEnd <= 420, `full velocity arrow must fit in the expanded viewBox at t=${time}: ${arrowEnd}`);
  assert.ok(Math.abs(position - (2 * time + 1.5 * time ** 2)) < 1e-12);
}

assert.equal(2 * 4 + 0.5 * 3 * 4 ** 2, 32);
assert.equal(2 + 3 * 4, 14);
console.log('Physics motion visual verified: equations, accessible time slider, 0–32 m axis mapping, and endpoint/midpoint values.');
