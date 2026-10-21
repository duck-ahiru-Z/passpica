import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateMathAQuestion, mathAAreas } from '../src/lib/mathAMixedQuestions.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/matha-mixed-drill/page.tsx'), 'utf8');
assert.ok(page.includes('aria-pressed={answer === option}'));
assert.ok(page.includes('disabled={!answer}'));
assert.ok(page.includes('role="status" aria-live="polite"'));

for (const area of mathAAreas) {
  const seen = new Set();
  for (let i = 0; i < 500; i += 1) {
    const question = generateMathAQuestion(area);
    assert.equal(question.area, area);
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.options.includes(question.answer));
    assert.ok(question.explanation.length > 0);
    seen.add(question.prompt);
  }
  assert.equal(seen.size, 5, `${area} should rotate through all five patterns`);
}

const seenAreas = new Set();
const seenQuestions = new Set();
let previous;
for (let i = 0; i < 1000; i += 1) {
  const question = generateMathAQuestion('all');
  assert.notEqual(question.area, previous, 'mixed mode should avoid consecutive area repeats');
  previous = question.area;
  seenAreas.add(question.area);
  seenQuestions.add(question.prompt);
}
assert.equal(seenAreas.size, mathAAreas.length);
assert.equal(seenQuestions.size, mathAAreas.length * 5);

let gcdQuestion;
for (let i = 0; i < 5 && !gcdQuestion; i += 1) {
  const question = generateMathAQuestion('integer');
  if (question.prompt.includes('252と198')) gcdQuestion = question;
}
assert.ok(gcdQuestion, 'integer practice must include the 252/198 gcd strategy question');
assert.equal(gcdQuestion.answer, 'ユークリッドの互除法');
const explanation = gcdQuestion.explanation;
const operands = gcdQuestion.prompt.match(/(\d+)と(\d+)/);
assert.ok(operands, 'gcd question must name both operands');
const [firstOperand, secondOperand] = operands.slice(1).map(Number);
const divisions = [...explanation.matchAll(/(\d+)=(?:(\d+)×)?(\d+)(?:\+(\d+))?/g)];
assert.ok(divisions.length >= 3, 'explanation must show the Euclidean division chain');
let dividend = firstOperand;
let divisor = secondOperand;
let reachedZeroRemainder = false;
for (const [, leftText, quotientText, divisorText, remainderText] of divisions) {
  const left = Number(leftText);
  const quotient = quotientText ? Number(quotientText) : 1;
  const rightDivisor = Number(divisorText);
  const remainder = remainderText ? Number(remainderText) : 0;
  assert.equal(left, dividend, 'each division must use the preceding dividend');
  assert.equal(rightDivisor, divisor, 'each division must use the preceding divisor');
  assert.equal(left, quotient * rightDivisor + remainder, 'every displayed division equation must be arithmetically true');
  assert.ok(remainder >= 0 && remainder < rightDivisor, 'each remainder must satisfy the division algorithm');
  dividend = divisor;
  divisor = remainder;
  if (remainder === 0) {
    reachedZeroRemainder = true;
    break;
  }
}
assert.ok(reachedZeroRemainder, 'Euclidean chain must terminate with remainder zero');
const gcdFromDivisionChain = dividend;
let gcdFromCommonDivisors = 0;
for (let candidate = 1; candidate <= Math.min(firstOperand, secondOperand); candidate += 1) {
  if (firstOperand % candidate === 0 && secondOperand % candidate === 0) gcdFromCommonDivisors = candidate;
}
assert.equal(gcdFromDivisionChain, gcdFromCommonDivisors, 'last nonzero remainder must equal the greatest common divisor');
assert.match(explanation, new RegExp(`最大公約数は${gcdFromCommonDivisors}(?:。|$)`));
console.log('Math A: all 20 patterns verified across focused and mixed practice.');
