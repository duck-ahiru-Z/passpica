import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRootsCoefficientsProblemPicker } from '../src/lib/rootsCoefficients.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/roots-coefficients-drill/page.tsx'), 'utf8');
const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];

function gcd(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) [x, y] = [y, x % y];
  return x;
}

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (1664525 * value + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function expectedFor(problem) {
  const { a, b, c, pattern, questionText } = problem;
  if (pattern === 'pattern1') return { numerator: b * b - 2 * a * c, denominator: a * a };
  if (pattern === 'pattern2') return { numerator: -(b ** 3) + 3 * a * b * c, denominator: a ** 3 };
  if (pattern === 'pattern3' && questionText.includes('\\frac{1}')) return { numerator: -b, denominator: c };
  if (pattern === 'pattern3') return { numerator: b * b - 2 * a * c, denominator: a * c };
  return { numerator: b * b - 4 * a * c, denominator: a * a };
}

function validate(problem, requestedPattern) {
  assert.equal(problem.pattern, requestedPattern);
  assert.notEqual(problem.a, 0);
  assert.ok(problem.ansDen > 0, 'answers must use a positive denominator');
  assert.equal(gcd(problem.ansNum, problem.ansDen), 1, 'answers must be reduced, including zero as 0/1');
  if (problem.pattern === 'pattern2') assert.equal(problem.a, 1);
  if (problem.pattern === 'pattern3') assert.notEqual(problem.c, 0);
  const expected = expectedFor(problem);
  assert.equal(problem.ansNum * expected.denominator, expected.numerator * problem.ansDen,
    `${problem.pattern}: answer must match the Vieta identity for ${problem.a}x²+${problem.b}x+${problem.c}=0`);
}

for (const [index, pattern] of patterns.entries()) {
  const next = createRootsCoefficientsProblemPicker();
  const random = seeded(20261023 + index);
  const pattern3Forms = new Set();
  for (let i = 0; i < 5_000; i += 1) validate(next(pattern, random), pattern);
  if (pattern === 'pattern3') {
    const variantRandom = seeded(31023);
    for (let i = 0; i < 1_000; i += 1) {
      const problem = next(pattern, variantRandom);
      validate(problem, pattern);
      pattern3Forms.add(problem.questionText);
    }
    assert.deepEqual([...pattern3Forms].sort(), ['\\frac{1}{\\alpha} + \\frac{1}{\\beta}', '\\frac{\\beta}{\\alpha} + \\frac{\\alpha}{\\beta}'].sort(),
      'focused fractional symmetric-expression practice must cover both expression forms');
  }
}

for (const boundaryRandom of [() => 4 / 9, () => 5 / 11, () => 1, () => Number.NaN]) {
  for (const pattern of patterns) {
    const problem = createRootsCoefficientsProblemPicker()(pattern, boundaryRandom);
    validate(problem, pattern);
  }
}

const next = createRootsCoefficientsProblemPicker();
const random = seeded(241023);
const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let batch = [];
for (let i = 0; i < 40_000; i += 1) {
  const problem = next('mix', random);
  validate(problem, problem.pattern);
  assert.notEqual(problem.pattern, previous, 'mixed practice must not repeat a pattern consecutively');
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  previous = problem.pattern;
  batch.push(problem.pattern);
  if (i % patterns.length === patterns.length - 1) {
    assert.deepEqual([...batch].sort(), [...patterns].sort(), 'each mixed batch must include each pattern exactly once');
    batch = [];
  }
}
assert.deepEqual([...counts.values()], [10_000, 10_000, 10_000, 10_000]);

for (const accessibleName of ['練習する解と係数のパターン', '答えの符号', '答えの分子', '答えの分母']) {
  assert.ok(drillPage.includes(`aria-label="${accessibleName}"`), `missing accessible name: ${accessibleName}`);
}
assert.ok(drillPage.includes('role="status" aria-live="polite"'), 'answer feedback must be announced to assistive technology');
assert.ok(drillPage.includes('grid grid-cols-1 lg:grid-cols-2'), 'keep the question and explanation stacked until a wide viewport');

console.log('Roots and coefficients verified: 20,000 focused + 40,000 mixed problems, exact Vieta identities, balanced batches, both fractional variants, accessible controls, and responsive layout guard.');
