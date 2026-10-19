import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseRationalParts } from '../src/lib/rationalInput.ts';
import { parseStrictInteger } from '../src/lib/strictInteger.ts';
import { arePositiveIntegerRatiosEquivalent } from '../src/lib/integerRatio.ts';

for (const value of ['12.8', '1e2', '7abc', '--3', '9007199254740992']) {
  assert.equal(parseStrictInteger(value), null, `must reject ${value}`);
}
assert.equal(parseStrictInteger('-12'), -12);
assert.equal(parseRationalParts('3', '' )?.denominator, 1);
for (const [numerator, denominator] of [['3.8', '1'], ['3', '1.2'], ['3', '0'], ['3x', '2'], ['', '1']]) {
  assert.equal(parseRationalParts(numerator, denominator), null, `must reject ${numerator}/${denominator}`);
}
const equivalent = parseRationalParts('6', '8');
assert.deepEqual(equivalent, { numerator: 3, denominator: 4 });
assert.equal(arePositiveIntegerRatiosEquivalent(6, 32, 3, 16), true);
assert.equal(arePositiveIntegerRatiosEquivalent(0, 0, 3, 16), false);
assert.equal(arePositiveIntegerRatiosEquivalent(-3, -16, 3, 16), false);
assert.equal(arePositiveIntegerRatiosEquivalent(3, 0, 3, 16), false);
assert.equal(arePositiveIntegerRatiosEquivalent(3, 15, 3, 16), false);
assert.equal(arePositiveIntegerRatiosEquivalent(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1, 1), true);

const linear = fs.readFileSync('src/app/learn/math/linear-diophantine-drill/page.tsx', 'utf8');
assert.ok(linear.includes('parseStrictInteger(ansX)') && linear.includes('parseStrictInteger(ansY)'));
assert.ok(linear.includes('BigInt(problem.A) * BigInt(ux)'), 'Diophantine equation must be compared without floating-point overflow');

const menelaus = fs.readFileSync('src/app/learn/math/menelaus-ceva-drill/page.tsx', 'utf8');
assert.ok(menelaus.includes('parseStrictInteger(ansX)') && menelaus.includes('parseStrictInteger(ansY)'));
assert.ok(menelaus.includes('arePositiveIntegerRatiosEquivalent(ux, uy, problem.ansX, problem.ansY)'), 'ratios must be positive and compared exactly');

const discriminant = fs.readFileSync('src/app/learn/math/discriminant-drill/page.tsx', 'utf8');
assert.ok(discriminant.includes('parseRationalParts(nStr, dStr)'), 'discriminant fractions must reject malformed components');
assert.ok(discriminant.includes('u1.num === ans1 && u1.den === 1'), 'integer roots must be compared exactly as rationals');
assert.ok(!/parseInt\((?:nStr|dStr)\)/.test(discriminant), 'answer fields must not be truncated by parseInt');

console.log('Strict integer and fraction answer inputs verified: decimal, exponent, malformed, unsafe, denominator-zero, and equivalent-fraction cases across three math drills.');
