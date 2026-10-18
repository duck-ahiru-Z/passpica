import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { checkRationalizationAnswer, generateRationalizationProblem, parseRationalizationInteger } from '../src/lib/rationalizationProblem.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/rationalization-drill/page.tsx'), 'utf8');
for (const text of [
  '実戦練習：足し算・引き算ランダム',
  '基礎練習：足し算型だけ',
  '基礎練習：引き算型だけ',
  'checkRationalizationAnswer(problem',
  'parseRationalizationInteger(ansA)',
  'aria-label="有理化の演習モード"',
]) assert.ok(page.includes(text), `rationalization drill UI is missing ${text}`);

function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (1664525 * state + 1013904223) >>> 0) / 0x100000000);
}

for (const [input, expected] of [['3', 3], [' 12 ', 12], ['+4', 4], ['-2', -2], ['', null], ['3.8', null], ['3abc', null], ['1e2', null], ['9007199254740992', null]]) {
  assert.equal(parseRationalizationInteger(input), expected, `integer answer parser for ${JSON.stringify(input)}`);
}

for (const [mode, expectedSign] of [['+', '+'], ['-', '-']]) {
  const random = seeded(mode === '+' ? 91 : 92);
  for (let index = 0; index < 2_000; index += 1) {
    const problem = generateRationalizationProblem(mode, random);
    assert.equal(problem.denominatorSign, expectedSign);
    assert.equal(problem.answerSign, expectedSign === '+' ? '-' : '+');
    assert.ok(problem.a > problem.b && problem.b >= 1 && problem.a <= 16);
    for (const radicand of [problem.a, problem.b]) {
      for (let factor = 2; factor * factor <= radicand; factor += 1) {
        assert.notEqual(radicand % (factor * factor), 0, `radicand ${radicand} should be square-free`);
      }
    }
    assert.ok(problem.coefficient >= 1 && problem.coefficient <= 3);
    assert.equal(problem.numerator, problem.coefficient * (problem.a - problem.b));
    const expected = { coefficientA: problem.coefficient, radicandA: problem.a, coefficientB: problem.coefficient, radicandB: problem.b };
    assert.equal(checkRationalizationAnswer(problem, expected), true);
    for (const key of Object.keys(expected)) assert.equal(checkRationalizationAnswer(problem, { ...expected, [key]: expected[key] + 1 }), false);

    const denominator = Math.sqrt(problem.a) + (problem.denominatorSign === '+' ? 1 : -1) * Math.sqrt(problem.b);
    const rationalized = problem.coefficient * (Math.sqrt(problem.a) + (problem.answerSign === '+' ? 1 : -1) * Math.sqrt(problem.b));
    assert.ok(Math.abs(problem.numerator / denominator - rationalized) < 1e-10, 'rationalization identity must hold');
  }
}

// Also exercise one continuous seeded sequence to verify cycle balance and no repeated signs.
const random = seeded(20261018);
const sequential = Array.from({ length: 2_000 }, () => generateRationalizationProblem('mix', random));
for (let start = 0; start < sequential.length; start += 2) {
  assert.equal(new Set(sequential.slice(start, start + 2).map(problem => problem.denominatorSign)).size, 2, `mixed sign cycle ${start / 2} must include both signs`);
}
for (let index = 1; index < sequential.length; index += 1) assert.notEqual(sequential[index].denominatorSign, sequential[index - 1].denominatorSign);
console.log('Rationalization drills verified: 4,000 fixed-sign and 2,000 mixed problems; exact answers, sign selection, square-free radicands, and rationalization identities checked.');
