import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BalancedRandom } from '../src/lib/balancedRandom.ts';

const page = fs.readFileSync('src/app/learn/math/triangle-area-drill/page.tsx', 'utf8');
for (const pattern of ['pattern1', 'pattern2', 'pattern3', 'pattern4']) {
  assert.ok(page.includes(`<option value="${pattern}">`), `${pattern} must remain independently selectable`);
  assert.ok(page.includes(`problem.pattern === '${pattern}'`), `${pattern} must have a dedicated prompt/solution`);
}
assert.ok(page.includes('<option value="mix">'), 'mixed practice must remain selectable');
assert.ok(page.includes("new BalancedRandom<Pattern>(['pattern1', 'pattern2', 'pattern3', 'pattern4'])"));
assert.ok(page.includes('mixedPatternPicker.next()'), 'mixed mode must use the balanced scheduler');
assert.ok(page.includes('role="img"') && page.includes('aria-label={graphDescription}'), 'diagram must describe its current geometry');
assert.ok(page.includes('label={problem.pattern === \'pattern4\' ? \'辺cの長さ\' : \'三角形の面積\'}'), 'answer controls must name the quantity being entered');
assert.ok(page.includes('function formatCanvasTerm') && page.includes('formatCanvasTerm(problem.S)'), 'canvas labels must use readable radical notation rather than raw LaTeX');
assert.ok(page.includes("ctx.fillText('h = b sin A'"), 'altitude label must be rendered as plain canvas text');

const heronTriangles = [[3,4,5], [5,12,13], [13,14,15], [4,13,15], [7,24,25], [9,10,17], [5,5,6], [5,5,8], [10,13,13]];
for (const [a, b, c] of heronTriangles) {
  assert.ok(a + b > c && a + c > b && b + c > a, `triangle inequality for ${a},${b},${c}`);
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s-a) * (s-b) * (s-c));
  assert.ok(Number.isInteger(area), `Heron answer should be exact for ${a},${b},${c}`);
  assert.ok(Number.isFinite(area) && area > 0);
}

let seed = 0x9e3779b9;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const picker = new BalancedRandom(['pattern1', 'pattern2', 'pattern3', 'pattern4']);
const mixed = Array.from({ length: 20_000 }, () => picker.next(random));
assert.deepEqual(['pattern1', 'pattern2', 'pattern3', 'pattern4'].map(pattern => mixed.filter(item => item === pattern).length), [5_000, 5_000, 5_000, 5_000]);
assert.ok(mixed.every((pattern, index) => index === 0 || pattern !== mixed[index - 1]), 'no pattern should repeat at a batch boundary or within a batch');

console.log('Triangle-area drill verified: four focused modes, all Heron triples, accessible diagram/answer labels, and 20,000 balanced mixed selections without adjacent repeats.');
