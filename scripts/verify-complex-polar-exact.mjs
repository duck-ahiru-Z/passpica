import assert from 'node:assert/strict';
import { formatExactTrigComponent } from '../src/lib/complexPolarExact.ts';

const cases = [
  [1, 0, '0'], [1, 1, '1'], [1, -1, '-1'],
  [5, 0.5, '5/2'], [3, -0.5, '-3/2'],
  [1, Math.SQRT1_2, '\\sqrt{2}/2'],
  [3, -Math.SQRT1_2, '-3\\sqrt{2}/2'],
  [1, Math.sqrt(3) / 2, '\\sqrt{3}/2'],
  [3, -Math.sqrt(3) / 2, '-3\\sqrt{3}/2'],
  [4, Math.sqrt(3) / 2, '2\\sqrt{3}'],
];

for (const [radius, trigValue, expected] of cases) {
  assert.equal(formatExactTrigComponent(radius, trigValue), expected);
}
assert.throws(() => formatExactTrigComponent(1.5, 0.5), RangeError);

const page = await (await import('node:fs/promises')).readFile(
  new URL('../src/app/learn/math/complex-polar-drill/page.tsx', import.meta.url), 'utf8',
);
assert.match(page, /ansA = formatExactTrigComponent\(rRes, cosVal\)/);
assert.match(page, /ansB = formatExactTrigComponent\(rRes, sinVal\)/);

console.log(`Complex-polar exact components verified: ${cases.length} signs, rational coefficients, and √2/√3 cases.`);
