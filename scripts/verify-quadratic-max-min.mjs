import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  generateQuadraticMaxMinProblem,
  isQuadraticExtremumAnswerCorrect,
} from '../src/lib/quadraticMaxMin.ts';

const inputChecks = [
  ['10', '4', '10', 10, [4, 10], true],
  ['10', '10', '4', 10, [4, 10], true],
  ['1', '7', '', 1, [7], true],
  ['1', '', '', 1, [7], false],
  ['1', '7', '8.5', 1, [7], false],
  ['10.5', '4', '10', 10, [4, 10], false],
  ['10', '4.5', '10', 10, [4, 10], false],
  ['10', '4', '', 10, [4, 10], false],
  ['10', '4', '10', 10, [4], false],
  ['1e1', '4', '10', 10, [4, 10], false],
  ['10.0', '4', '10', 10, [4, 10], false],
  ['', '4', '10', 10, [4, 10], false],
  ['+10', '-4', '10', 10, [-4, 10], true],
];
for (const [value, x1, x2, expectedValue, expectedXs, expected] of inputChecks) {
  assert.equal(
    isQuadraticExtremumAnswerCorrect(value, x1, x2, expectedValue, expectedXs),
    expected,
    `strict answer comparison for ${JSON.stringify([value, x1, x2])}`,
  );
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 0x100000000);
}

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
function verifyProblem(problem, requestedPattern) {
  assert.equal(problem.pattern, requestedPattern);
  assert.ok(problem.alpha < problem.beta);
  assert.ok(problem.alpha >= -4 && problem.alpha <= 4);
  assert.ok(problem.a !== 0 && Math.abs(problem.a) <= 3);
  assert.ok(problem.q >= -4 && problem.q <= 4);
  assert.equal(problem.isDownward, problem.a < 0);
  assert.ok(!problem.eq.includes('x0'), `zero-axis form must not render an extraneous 0: ${problem.eq}`);
  assert.ok(!problem.eq.includes('+ 0') && !problem.eq.includes('- 0'), `zero constant should be omitted: ${problem.eq}`);
  if (problem.p === 0) assert.match(problem.eq, /^y = -?(?:[23])?x\^2(?: |$)/, `zero-axis form should render as x²: ${problem.eq}`);
  if (requestedPattern === 'pattern1') {
    assert.ok(problem.p > problem.alpha && problem.p < problem.beta);
    assert.notEqual(problem.p - problem.alpha, problem.beta - problem.p);
  }
  if (requestedPattern === 'pattern2') assert.ok(problem.p < problem.alpha || problem.p > problem.beta);
  if (requestedPattern === 'pattern3') {
    assert.equal(problem.p - problem.alpha, problem.beta - problem.p);
    assert.equal((problem.beta - problem.alpha) % 2, 0);
  }
  if (requestedPattern === 'pattern4') assert.ok(problem.a < 0);

  const candidates = [problem.alpha, problem.beta];
  if (problem.p >= problem.alpha && problem.p <= problem.beta) candidates.push(problem.p);
  const valueAt = x => problem.a * (x - problem.p) ** 2 + problem.q;
  const maxValue = Math.max(...candidates.map(valueAt));
  const minValue = Math.min(...candidates.map(valueAt));
  assert.equal(problem.maxV, maxValue);
  assert.equal(problem.minV, minValue);
  assert.deepEqual(problem.maxX, candidates.filter(x => valueAt(x) === maxValue).sort((a, b) => a - b));
  assert.deepEqual(problem.minX, candidates.filter(x => valueAt(x) === minValue).sort((a, b) => a - b));
}

const zeroAxisZeroConstantRandomValues = [3 / 9, 0, 0.4, 4 / 9];
const zeroAxisZeroConstant = generateQuadraticMaxMinProblem(
  'pattern3',
  () => zeroAxisZeroConstantRandomValues.shift() ?? 0.5,
);
assert.equal(zeroAxisZeroConstant.p, 0);
assert.equal(zeroAxisZeroConstant.q, 0);
assert.equal(zeroAxisZeroConstant.eq, 'y = 2x^2');
assert.equal(zeroAxisZeroConstant.maxV, 2);
assert.deepEqual(zeroAxisZeroConstant.maxX, [-1, 1]);
assert.equal(zeroAxisZeroConstant.minV, 0);
assert.deepEqual(zeroAxisZeroConstant.minX, [0]);

for (const [index, pattern] of patterns.entries()) {
  const random = seeded(42_300 + index);
  for (let count = 0; count < 5_000; count += 1) {
    verifyProblem(generateQuadraticMaxMinProblem(pattern, random), pattern);
  }
}

const random = seeded(20261023);
const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
for (let count = 0; count < 20_000; count += 1) {
  const problem = generateQuadraticMaxMinProblem('mix', random);
  verifyProblem(problem, problem.pattern);
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  assert.notEqual(problem.pattern, previous, 'mixed mode must not repeat its pattern consecutively');
  previous = problem.pattern;
}
for (const pattern of patterns) assert.equal(counts.get(pattern), 5_000);

const page = fs.readFileSync('src/app/learn/math/quadratic-max-min-drill/page.tsx', 'utf8');
assert.ok(page.includes('generateQuadraticMaxMinProblem'), 'page must use the verified production generator');
assert.ok(page.includes('aria-label="最大・最小問題の出題パターン"'));
assert.ok(page.includes('role="img"') && page.includes('aria-label={`定義域'));
for (const label of [
  '最大値の答え', '最大値をとる x の値', '最大値をとる2つ目の x の値。1つだけなら空欄',
  '最小値の答え', '最小値をとる x の値', '最小値をとる2つ目の x の値。1つだけなら空欄',
]) assert.ok(page.includes(`aria-label="${label}"`), `missing accessible field name: ${label}`);

console.log('Quadratic max/min verified: 20,000 fixed-pattern and 20,000 mixed generated problems; extrema, ties, location patterns, strict input and balanced scheduling.');
