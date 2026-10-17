import assert from 'node:assert/strict';
import { generateTrigSumParameters } from '../src/lib/trigIdentityParameters.ts';

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

console.log('Trigonometric identity sum parameters verified: every valid p/q form is selectable without exclusion collisions.');
