import { parseStrictPositiveInteger } from '../src/lib/strictPositiveInteger.ts';

const cases = [
  ['2', false, 2],
  [' 13 ', false, 13],
  ['', true, 1],
  ['', false, null],
  ['2.5', false, null],
  ['-2', false, null],
  ['0', false, null],
  ['1e100', false, null],
  ['abc', false, null],
];

for (const [value, blankMeansOne, expected] of cases) {
  const actual = parseStrictPositiveInteger(value, blankMeansOne);
  if (actual !== expected) {
    throw new Error(`parseStrictPositiveInteger(${JSON.stringify(value)}, ${blankMeansOne}) returned ${actual}; expected ${expected}`);
  }
}

console.log(`Trigonometric synthesis input validation verified: ${cases.length} cases`);
