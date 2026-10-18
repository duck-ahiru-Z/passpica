import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getHyperbolaMetrics } from '../src/lib/hyperbolaParabola.ts';
import { parseRationalAnswer, rationalEquals } from '../src/lib/rationalInput.ts';

const triples = [
  [3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13],
  [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25],
];

for (const [a, b, c] of triples) {
  const horizontal = getHyperbolaMetrics(a, b, true);
  assert.equal(horizontal.standardA2, a * a);
  assert.equal(horizontal.standardB2, b * b);
  assert.equal(horizontal.focusDistance, c);
  assert.equal(horizontal.slopeNumerator / horizontal.slopeDenominator, b / a);

  const vertical = getHyperbolaMetrics(a, b, false);
  assert.equal(vertical.standardA2, b * b);
  assert.equal(vertical.standardB2, a * a);
  assert.equal(vertical.focusDistance, c);
  assert.equal(vertical.slopeNumerator / vertical.slopeDenominator, b / a);

  const expectedSlope = parseRationalAnswer(`${vertical.slopeNumerator}/${vertical.slopeDenominator}`);
  assert.ok(expectedSlope);
  assert.ok(rationalEquals(parseRationalAnswer(`${expectedSlope.numerator * 2}/${expectedSlope.denominator * 2}`), expectedSlope));
  assert.ok(rationalEquals(parseRationalAnswer(`${expectedSlope.numerator}/${expectedSlope.denominator}`), expectedSlope));
}

const page = fs.readFileSync('src/app/learn/math/hyperbola-parabola-drill/page.tsx', 'utf8');
assert.ok(page.includes('getHyperbolaMetrics(a, b, isH)'), 'both orientations must use the tested canonical metrics');
assert.ok(page.includes('rationalEquals(m, expectedM!)'), 'equivalent exact fractions must be accepted');
assert.ok(page.includes('placeholder={problem.ans3 ?? \'\'}'), 'the slope hint must match the current problem');
assert.ok(page.includes('\\\\frac{y^2}{${standardA2}} - \\\\frac{x^2}{${standardB2}} = 1'), 'vertical hyperbola explanation must use its vertical standard form');

console.log('Hyperbola/parabola drill verified: 8 Pythagorean triples in both orientations, canonical labels, focus distances, equivalent slope fractions, and current-answer hint.');
