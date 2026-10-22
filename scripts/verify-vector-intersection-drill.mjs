import assert from 'node:assert/strict';
import fs from 'node:fs';
import { calculateVectorIntersectionWeights } from '../src/lib/vectorIntersection.ts';

const page = fs.readFileSync('src/app/learn/math/vector-drill/page.tsx', 'utf8');
const portal = fs.readFileSync('src/app/drill/page.tsx', 'utf8');
assert.ok(page.includes('基礎練習：メネラウスの定理だけ'));
assert.ok(page.includes('基礎練習：係数比較と連立方程式だけ'));
assert.ok(page.includes('実戦練習：交点の解法を全方針ランダム'));
assert.ok(page.includes('どちらも有効です。'));
assert.ok(page.includes('if (answerIsCorrect)'));
assert.ok(!page.includes('selectedStrategy === strategy'), 'a mathematically valid alternate strategy must not be marked wrong');
assert.ok(!page.includes('strategyPicker'), 'the selected strategy must not be arbitrarily preassigned to a valid alternate-method problem');
assert.ok(portal.includes('どちらも使える交点問題で自分の解法を選びます。'));
for (const label of ['ベクトルOAの係数の分子', 'ベクトルOAの係数の分母', 'ベクトルOBの係数の分子', 'ベクトルOBの係数の分母']) {
  assert.ok(page.includes(`aria-label="${label}"`), `answer input must expose the accessible name ${label}`);
}

let seed = 0x6d2b79f5;
const randomInt = max => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return (seed % max) + 1;
};
const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} != ${expected}`);

for (let index = 0; index < 10_000; index += 1) {
  const m = randomInt(5), n = randomInt(5), s = randomInt(5), t = randomInt(5);
  const { x, y } = calculateVectorIntersectionWeights(m, n, s, t);
  assert.equal(gcd(x.numerator, x.denominator), 1, 'OA coefficient must be reduced');
  assert.equal(gcd(y.numerator, y.denominator), 1, 'OB coefficient must be reduced');
  const xValue = x.numerator / x.denominator;
  const yValue = y.numerator / y.denominator;
  assert.ok(xValue > 0 && yValue > 0 && xValue + yValue < 1, 'intersection must remain inside the triangle');

  // Verify that P lies on both AD and BC in affine coordinates O=(0,0), A=(1,0), B=(0,1).
  close(yValue * (s + t), s * (1 - xValue));
  close(xValue * (m + n), m * (1 - yValue));
}

for (const inputs of [[0, 1, 1, 1], [1.5, 1, 1, 1], [-1, 1, 1, 1], [1, 1, Number.MAX_SAFE_INTEGER + 1, 1]]) {
  assert.throws(() => calculateVectorIntersectionWeights(...inputs), RangeError);
}

console.log('Vector-intersection drill verified: 10,000 generated ratio sets, both affine line constraints, reduced weights, and valid alternate-method acceptance.');
