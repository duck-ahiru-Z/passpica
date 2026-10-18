import assert from 'node:assert/strict';
import katex from 'katex';
import { generateSequenceSumProblem, sequenceSumPatterns } from '../src/lib/sequenceSumQuestions.ts';

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function parameters(problem) {
  const nums = [...problem.qStr.matchAll(/-?\d+/g)].map(([n]) => Number(n));
  return nums;
}

function expected(problem) {
  const nums = parameters(problem);
  const a = nums[0];
  const n = nums.at(-1);
  const second = nums[1];
  if (problem.pattern === 'pattern1') return n * (2 * a + (n - 1) * second) / 2;
  if (problem.pattern === 'pattern2') return n * (a + second) / 2;
  if (problem.pattern === 'pattern3') return a * (second ** n - 1) / (second - 1);
  const ratio = problem.qStr.includes('公比 -2') ? -2 : problem.qStr.includes('公比 -\\frac{1}{2}') ? -0.5 : 0.5;
  return a * (1 - ratio ** n) / (1 - ratio);
}

const random = seeded(0x5eed1234);
for (const pattern of sequenceSumPatterns) {
  const seen = new Set();
  for (let i = 0; i < 1200; i++) {
    const problem = generateSequenceSumProblem(pattern, random);
    assert.equal(problem.pattern, pattern);
    assert.ok(!problem.qStr.includes('$'), 'question text must not contain math delimiters');
    assert.ok(Number.isFinite(problem.ansNum) && Number.isInteger(problem.ansNum));
    assert.ok(Number.isInteger(problem.ansDen) && problem.ansDen > 0);
    assert.equal(gcd(problem.ansNum, problem.ansDen), 1, 'answer must be a normalized rational');
    assert.ok(Math.abs(problem.ansNum / problem.ansDen - expected(problem)) < 1e-10, `incorrect answer for ${problem.qStr}`);
    seen.add(problem.qStr);
    if (i < 80) {
      for (const line of problem.expLines) {
        assert.doesNotThrow(() => katex.renderToString(line, { throwOnError: true, strict: 'ignore' }), `${pattern}: ${line}`);
      }
    }
  }
  assert.ok(seen.size > (pattern === 'pattern3' ? 50 : pattern === 'pattern4' ? 5 : 80), `${pattern} should produce varied questions`);
  console.log(`${pattern}: 1,200 generated; answers, normalization and sampled explanations passed (${seen.size} unique)`);
}

const mixedRandom = seeded(0xc0ffee);
let previous;
const counts = Object.fromEntries(sequenceSumPatterns.map((pattern) => [pattern, 0]));
for (let i = 0; i < 8000; i++) {
  const problem = generateSequenceSumProblem('mix', mixedRandom);
  counts[problem.pattern]++;
  assert.notEqual(problem.pattern, previous, 'mixed mode must not repeat the same pattern consecutively');
  assert.ok(Math.abs(problem.ansNum / problem.ansDen - expected(problem)) < 1e-10);
  previous = problem.pattern;
}
for (const [pattern, count] of Object.entries(counts)) {
  assert.ok(count > 1900 && count < 2100, `${pattern} mix count out of balance: ${count}`);
}
console.log(`mix: 8,000 generated with no adjacent repeat; distribution ${JSON.stringify(counts)}`);

console.log('Sequence-sum question generation checks passed.');
