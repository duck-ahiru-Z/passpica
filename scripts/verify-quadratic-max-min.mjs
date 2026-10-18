import { isQuadraticExtremumAnswerCorrect } from '../src/lib/quadraticMaxMin.ts';

const checks = [
  ['10', '4', '10', 10, [4, 10], true],
  ['10', '10', '4', 10, [4, 10], true],
  ['1', '7', '', 1, [7], true],
  ['1', '', '', 1, [7], false],
  ['1', '7', '8.5', 1, [7], false],
  ['10.5', '4', '10', 10, [4, 10], false],
  ['10', '4.5', '10', 10, [4, 10], false],
  ['10', '4', '', 10, [4, 10], false],
  ['10', '4', '10', 10, [4], false],
  ['1e2', '4', '10', 10, [4, 10], false],
  ['', '4', '10', 10, [4, 10], false],
];

for (const [value, firstX, secondX, expectedValue, expectedXs, expected] of checks) {
  const actual = isQuadraticExtremumAnswerCorrect(value, firstX, secondX, expectedValue, expectedXs);
  if (actual !== expected) throw new Error(`unexpected result for ${JSON.stringify([value, firstX, secondX])}: ${actual}`);
}

console.log(`Quadratic maximum/minimum answer validation verified: ${checks.length} integer, tie, missing, decimal, and malformed-input cases.`);
