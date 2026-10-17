import assert from 'node:assert/strict';
import { checkFractionRoot } from '../src/lib/fractionRoot.ts';

const answer = (overrides = {}) => ({ sign: '+', numCoeff: '', numRoot: '', den: '', ...overrides });

assert.equal(checkFractionRoot(answer({ numCoeff: '3', numRoot: '2', den: '5' }), 1, 3, 2, 5), true);
assert.equal(checkFractionRoot(answer(), 1, 1, 1, 1), true, 'blank fields represent 1');
assert.equal(checkFractionRoot(answer({ sign: '-', numCoeff: '-1' }), 1, 1, 1, 1), true, 'negative coefficient -1 flips the selected sign');
assert.equal(checkFractionRoot(answer({ den: '-2' }), -1, 1, 1, 2), true, 'negative denominator flips the sign');
assert.equal(checkFractionRoot(answer({ numRoot: '0' }), 1, 0, 1, 1), true, 'zero radical gives zero');

for (const field of ['numCoeff', 'numRoot', 'den']) {
  for (const invalid of ['1.5', '2abc', '1e2', '9007199254740992']) {
    assert.equal(checkFractionRoot(answer({ [field]: invalid }), 1, 1, 1, 1), false, `${field} rejects ${invalid}`);
  }
}

assert.equal(checkFractionRoot(answer({ den: '0' }), 1, 1, 1, 1), false, 'zero denominator is invalid');
assert.equal(checkFractionRoot(answer({ numRoot: '-2' }), 1, 1, 1, 1), false, 'negative radicand is invalid');
assert.equal(checkFractionRoot(answer({ numCoeff: '-2' }), 1, 1, 1, 1), false, 'negative coefficient other than -1 is invalid');

console.log('Fraction-root answer validation verified: valid equivalent sign forms pass and malformed integer fields are rejected.');
