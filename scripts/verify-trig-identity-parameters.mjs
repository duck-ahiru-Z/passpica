import assert from 'node:assert/strict';
import { generateTrigSumParameters } from '../src/lib/trigIdentityParameters.ts';
import fs from 'node:fs';
import path from 'node:path';
import { BalancedRandom } from '../src/lib/balancedRandom.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/trig-identity-drill/page.tsx'), 'utf8');
assert.equal((drillPage.match(/setHasChecked\(false\); setIsCorrect\(false\);/g) ?? []).length, 4, 'mode changes and editing any trig answer must clear stale feedback');

for (let q = 2; q <= 5; q += 1) {
  const maxP = Math.floor(q * Math.SQRT2);
  const candidates = Array.from({ length: maxP * 2 + 1 }, (_, index) => index - maxP)
    .filter(value => value !== 0 && Math.abs(value) !== q);

  for (let index = 0; index < candidates.length; index += 1) {
    const values = [(q - 2 + 0.5) / 4, (index + 0.5) / candidates.length];
    const { p, q: actualQ } = generateTrigSumParameters(() => values.shift() ?? 0);
    assert.equal(actualQ, q);
    assert.equal(p, candidates[index], `q=${q} should select candidate ${candidates[index]}`);
    assert.notEqual(p, 0);
    assert.notEqual(Math.abs(p), q);
    assert.ok(Math.abs(p / q) <= Math.SQRT2);
  }
}

assert.ok(drillPage.includes('role="img"') && drillPage.includes('aria-label={graphDescription}'), 'trigonometric diagram must expose its current mathematical content');
assert.ok(drillPage.includes("new BalancedRandom<Pattern>(['pattern1', 'pattern2', 'pattern3', 'pattern4'])"));
assert.ok(drillPage.includes('mixedPatternPicker.next()'));
let mixSeed = 0x243f6a88;
const random = () => {
  mixSeed = (Math.imul(mixSeed, 1664525) + 1013904223) >>> 0;
  return mixSeed / 4294967296;
};
const picker = new BalancedRandom(['pattern1', 'pattern2', 'pattern3', 'pattern4']);
const mixed = Array.from({ length: 20_000 }, () => picker.next(random));
assert.deepEqual(['pattern1', 'pattern2', 'pattern3', 'pattern4'].map(pattern => mixed.filter(item => item === pattern).length), [5_000, 5_000, 5_000, 5_000]);
assert.ok(mixed.every((pattern, index) => index === 0 || pattern !== mixed[index - 1]), 'mixed trig-identity patterns must not repeat adjacently');

console.log('Trigonometric identity verified: every valid p/q form is selectable, 20,000 mixed questions are balanced without adjacent repeats, and its diagram exposes accessible text.');
