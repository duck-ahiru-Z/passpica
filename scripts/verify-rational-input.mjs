import assert from 'node:assert/strict';
import { parseRationalAnswer, parseRationalParts, rationalEquals } from '../src/lib/rationalInput.ts';

const equivalentFractions = [
  ['2/4', { numerator: 1, denominator: 2 }],
  ['-6/-8', { numerator: 3, denominator: 4 }],
  ['+3/1', { numerator: 3, denominator: 1 }],
  [' 15 / 2 ', { numerator: 15, denominator: 2 }],
  ['0/9', { numerator: 0, denominator: 1 }],
];

for (const [input, expected] of equivalentFractions) {
  assert.deepEqual(parseRationalAnswer(input), expected, `normalizes ${input}`);
}

for (const input of ['', '/', '1/0', '0/0', '1/2/3', '1.5', '2abc', '1/2x', '--2', '9007199254740992']) {
  assert.equal(parseRationalAnswer(input), null, `rejects invalid answer ${input}`);
}

assert.deepEqual(parseRationalParts('3', ''), { numerator: 3, denominator: 1 });
assert.deepEqual(parseRationalParts('-2', '-4'), { numerator: 1, denominator: 2 });
assert.equal(parseRationalParts('1.5', '2'), null);
assert.equal(parseRationalParts('1', '0'), null);
assert.equal(rationalEquals(parseRationalAnswer('4/6'), { numerator: 2, denominator: 3 }), true);
assert.equal(rationalEquals(parseRationalAnswer('1/0'), { numerator: 0, denominator: 1 }), false);

console.log(`Rational answer validation verified: ${equivalentFractions.length} equivalent forms accepted; malformed, zero-denominator, and unsafe inputs rejected.`);
