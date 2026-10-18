import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { checkSymmetricPolynomialAnswer, generateSymmetricPolynomialProblem, parseSymmetricPolynomialAnswer, symmetricPolynomialPatterns } from '../src/lib/symmetricPolynomial.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/symmetric-polynomial-drill/page.tsx'), 'utf8');
for (const text of ['実戦練習：対称式 全パターンランダム', '基礎練習：x²＋y²だけ', '基礎練習：x³＋y³だけ', '基礎練習：x²y＋xy²だけ', 'checkSymmetricPolynomialAnswer(problem, ua)', 'parseSymmetricPolynomialAnswer(ansStr)']) {
  assert.ok(page.includes(text), `symmetric polynomial drill UI is missing ${text}`);
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 0x100000000);
}

for (const [input, expected] of [['0', 0], ['-12', -12], [' +4 ', 4], ['', null], ['2.8', null], ['2abc', null], ['1e2', null], ['9007199254740992', null]]) {
  assert.equal(parseSymmetricPolynomialAnswer(input), expected, `answer parser for ${JSON.stringify(input)}`);
}

function verify(problem, expectedPattern) {
  assert.equal(problem.pattern, expectedPattern);
  assert.ok(problem.sum >= -5 && problem.sum <= 5 && problem.sum !== 0);
  assert.ok(problem.product >= -5 && problem.product <= 5 && problem.product !== 0);
  assert.ok(problem.sum * problem.sum - 4 * problem.product >= 0, 'inputs must describe real x and y');
  const root = Math.sqrt(problem.sum * problem.sum - 4 * problem.product);
  const x = (problem.sum + root) / 2;
  const y = (problem.sum - root) / 2;
  const actual = expectedPattern === 'x2+y2'
    ? x * x + y * y
    : expectedPattern === 'x3+y3'
      ? x ** 3 + y ** 3
      : x * x * y + x * y * y;
  assert.ok(Math.abs(actual - problem.answer) < 1e-9, `identity failed for ${JSON.stringify(problem)}`);
  assert.equal(checkSymmetricPolynomialAnswer(problem, problem.answer), true);
  assert.equal(checkSymmetricPolynomialAnswer(problem, problem.answer + 1), false);
}

for (const [index, pattern] of symmetricPolynomialPatterns.entries()) {
  const random = seeded(6100 + index);
  const questions = Array.from({ length: 2_000 }, () => generateSymmetricPolynomialProblem(pattern, random));
  questions.forEach(problem => verify(problem, pattern));
  assert.ok(new Set(questions.map(problem => `${problem.sum}:${problem.product}`)).size > 20, `${pattern} parameters should vary`);
}

const random = seeded(20261018);
const mixed = Array.from({ length: 2_001 }, () => generateSymmetricPolynomialProblem('mix', random));
for (let start = 0; start < mixed.length - 2; start += symmetricPolynomialPatterns.length) {
  const batch = mixed.slice(start, start + symmetricPolynomialPatterns.length);
  assert.deepEqual(new Set(batch.map(problem => problem.pattern)), new Set(symmetricPolynomialPatterns), `mixed batch ${start / symmetricPolynomialPatterns.length}`);
}
for (const problem of mixed) verify(problem, problem.pattern);
for (let index = 1; index < mixed.length; index += 1) assert.notEqual(mixed[index].pattern, mixed[index - 1].pattern);

console.log('Symmetric polynomial drills verified: 6,000 fixed and 2,001 mixed questions; real-root constraints, all three identities, varied parameters, balanced pattern scheduling, and strict integer input.');
