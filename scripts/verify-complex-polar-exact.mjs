import assert from 'node:assert/strict';
import { formatExactTrigComponent, formatPolarAngle, getSupportedPolarAnglePairs, getUniformNonFirstQuadrantSigns, polarAngleChoices, supportedPolarAngleLabels } from '../src/lib/complexPolarExact.ts';

const cases = [
  [1, 0, '0'], [1, 1, '1'], [1, -1, '-1'],
  [5, 0.5, '5/2'], [3, -0.5, '-3/2'],
  [1, Math.SQRT1_2, '\\sqrt{2}/2'],
  [3, -Math.SQRT1_2, '-3\\sqrt{2}/2'],
  [1, Math.sqrt(3) / 2, '\\sqrt{3}/2'],
  [3, -Math.sqrt(3) / 2, '-3\\sqrt{3}/2'],
  [4, Math.sqrt(3) / 2, '2\\sqrt{3}'],
];

function parseExact(value) {
  const sign = value.startsWith('-') ? -1 : 1;
  const unsigned = value.replace(/^-/, '');
  const radical = unsigned.match(/^(\d*)\\sqrt\{(\d+)\}(?:\/(\d+))?$/);
  if (radical) return sign * Number(radical[1] || 1) * Math.sqrt(Number(radical[2])) / Number(radical[3] || 1);
  const fraction = unsigned.match(/^(\d+)\/(\d+)$/);
  if (fraction) return sign * Number(fraction[1]) / Number(fraction[2]);
  return sign * Number(unsigned);
}

for (const [radius, trigValue, expected] of cases) {
  assert.equal(formatExactTrigComponent(radius, trigValue), expected);
}
assert.throws(() => formatExactTrigComponent(1.5, 0.5), RangeError);

for (const { val, label } of supportedPolarAngleLabels) assert.equal(formatPolarAngle(val), label);
assert.throws(() => formatPolarAngle(5 * Math.PI / 12), RangeError);
for (const operation of ['sum', 'difference']) {
  const pairs = getSupportedPolarAnglePairs(operation);
  assert(pairs.length > 0, `no valid angle pairs for ${operation}`);
  for (const [first, second] of pairs) {
    const raw = operation === 'sum' ? first.val + second.val : first.val - second.val;
    const normalized = ((raw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    assert.doesNotThrow(() => formatPolarAngle(normalized));
    for (const radius of operation === 'sum' ? [4, 6, 8, 9, 12, 16] : [1, 2, 3, 4, 6]) {
      const real = formatExactTrigComponent(radius, Math.cos(normalized));
      const imaginary = formatExactTrigComponent(radius, Math.sin(normalized));
      assert(Math.abs(parseExact(real) - radius * Math.cos(normalized)) < 1e-10,
        `real component mismatch for radius ${radius} at ${formatPolarAngle(normalized)}`);
      assert(Math.abs(parseExact(imaginary) - radius * Math.sin(normalized)) < 1e-10,
        `imaginary component mismatch for radius ${radius} at ${formatPolarAngle(normalized)}`);
    }
  }
}
assert(polarAngleChoices.some(({ val }) => val === Math.PI / 4), '45-degree practice should remain available');

let state = 0x6d2b79f5;
const seededRandom = () => {
  state = (Math.imul(state ^ (state >>> 15), state | 1) + 0x6d2b79f5) | 0;
  return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
};
const quadrantCounts = new Map([['II', 0], ['III', 0], ['IV', 0]]);
for (let index = 0; index < 12_000; index += 1) {
  const [signX, signY] = getUniformNonFirstQuadrantSigns(seededRandom);
  const quadrant = signX < 0 ? (signY > 0 ? 'II' : 'III') : 'IV';
  quadrantCounts.set(quadrant, quadrantCounts.get(quadrant) + 1);
  if (signX > 0 && signY > 0) throw new Error('quadrant II–IV practice must never generate a first-quadrant point');
}
const quadrantFrequencies = [...quadrantCounts.values()];
if (quadrantFrequencies.some(count => count === 0) || Math.max(...quadrantFrequencies) - Math.min(...quadrantFrequencies) > 240) {
  throw new Error(`quadrant II–IV practice is not balanced: ${JSON.stringify(Object.fromEntries(quadrantCounts))}`);
}

const page = await (await import('node:fs/promises')).readFile(
  new URL('../src/app/learn/math/complex-polar-drill/page.tsx', import.meta.url), 'utf8',
);
assert.match(page, /ansA = formatExactTrigComponent\(rRes, cosVal\)/);
assert.match(page, /ansB = formatExactTrigComponent\(rRes, sinVal\)/);
assert.match(page, /const thStr = formatPolarAngle\(thRes\)/);
assert.match(page, /getSupportedPolarAnglePairs\(isProduct \? 'sum' : 'difference'\)/);
assert.match(page, /\\frac\{\$\{pts\[1\]\}\}\{\$\{pts\[0\]\}\}/, 'fractional polar angles must render numerator over denominator');
assert.match(page, /finalXS\.startsWith\('-'\) \? `\(\$\{finalXS\}\)` : finalXS/,
  'negative rectangular components must be grouped before squaring');
assert.match(page, /\[signX, signY\] = getUniformNonFirstQuadrantSigns\(\)/);
assert.match(page, /type Pattern = 'pattern1' \| 'pattern2' \| 'pattern3' \| 'pattern4-product' \| 'pattern4-quotient'/);
assert.match(page, /基礎練習：極形式の積だけ/);
assert.match(page, /基礎練習：極形式の商だけ/);
assert.match(page, /BalancedRandom<Pattern>\(\['pattern1', 'pattern2', 'pattern3', 'pattern4-product', 'pattern4-quotient'\]\)/);
assert.match(page, /href="\/learn\/math\/unit-circle-complex"/);
const visualPage = await (await import('node:fs/promises')).readFile(
  new URL('../src/app/learn/math/unit-circle-complex/page.tsx', import.meta.url), 'utf8',
);
assert.match(visualPage, /href="\/learn\/math\/complex-polar-drill"/);
assert.match(visualPage, /formatRectangular\(z1_x, z1_y\)/);
assert.match(visualPage, /formatRectangular\(z2_x, z2_y\)/);
assert.match(visualPage, /formatRectangular\(z3_x, z3_y\)/);

console.log(`Complex-polar exact components verified: ${cases.length} signs, rational coefficients, and √2/√3 cases.`);
