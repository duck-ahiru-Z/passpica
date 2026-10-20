import assert from 'node:assert/strict';
import { formatExactTrigComponent, formatPolarAngle, getSupportedPolarAnglePairs, polarAngleChoices, supportedPolarAngleLabels } from '../src/lib/complexPolarExact.ts';

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

const page = await (await import('node:fs/promises')).readFile(
  new URL('../src/app/learn/math/complex-polar-drill/page.tsx', import.meta.url), 'utf8',
);
assert.match(page, /ansA = formatExactTrigComponent\(rRes, cosVal\)/);
assert.match(page, /ansB = formatExactTrigComponent\(rRes, sinVal\)/);
assert.match(page, /const thStr = formatPolarAngle\(thRes\)/);
assert.match(page, /getSupportedPolarAnglePairs\(isProduct \? 'sum' : 'difference'\)/);

console.log(`Complex-polar exact components verified: ${cases.length} signs, rational coefficients, and √2/√3 cases.`);
