import fs from 'node:fs';
import path from 'node:path';
import {
  completingSquarePatterns,
  generateCompletingSquareProblem,
  isCompletingSquareAnswerCorrect,
} from '../src/lib/completingSquare.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/completing-square-drill/page.tsx'), 'utf8');
for (const phrase of ['実戦練習：平方完成 全パターンランダム', ...completingSquarePatterns.map((_, index) => `value="pattern${index + 1}"`)]) {
  if (!page.includes(phrase)) throw new Error(`Completing-square UI is missing a practice mode: ${phrase}`);
}
if (!page.includes('isCompletingSquareAnswerCorrect(problem, answer)')) {
  throw new Error('Completing-square UI must use the strict answer validator.');
}
for (const label of ['平方完成の演習パターン', '二次項の係数 a', '平方内の分数の分子', '平方内の分数の分母', '定数項の分子', '定数項の分母']) {
  if (!page.includes(`aria-label="${label}"`)) throw new Error(`Completing-square UI is missing an accessible label: ${label}`);
}
if (!page.includes('role="status" aria-live="polite"')) throw new Error('Completing-square answer feedback must be announced to assistive technology.');

const close = (actual, expected) => Math.abs(actual - expected) < 1e-9;
const answerFor = problem => ({
  a: problem.a === 1 ? '' : String(problem.a),
  pSign: problem.P.num < 0 ? '-' : '+',
  pNum: String(Math.abs(problem.P.num)),
  pDen: problem.P.den === 1 ? '' : String(problem.P.den),
  qSign: problem.Q.num < 0 ? '-' : '+',
  qNum: String(Math.abs(problem.Q.num)),
  qDen: problem.Q.den === 1 ? '' : String(problem.Q.den),
});

const fixedCount = 3000;
for (const pattern of completingSquarePatterns) {
  for (let index = 0; index < fixedCount; index++) {
    const problem = generateCompletingSquareProblem(pattern);
    if (problem.pattern !== pattern || problem.a === 0) throw new Error(`${pattern}: invalid fixed-pattern metadata`);
    if (pattern === 'pattern1' && (problem.a !== 1 || problem.b % 2 !== 0)) throw new Error('pattern1 must use a=1 and an even x coefficient');
    if (pattern === 'pattern2' && (problem.a === 1 || problem.a === 0 || (problem.b / (2 * problem.a)) % 1 !== 0)) throw new Error('pattern2 must have a non-unit leading coefficient and an integer square shift');
    if (pattern === 'pattern3' && (problem.a !== 1 || Math.abs(problem.P.num / problem.P.den) % 1 === 0)) throw new Error('pattern3 must have a fractional square shift');
    if (pattern === 'pattern4' && (problem.a === 1 || problem.a === 0 || Math.abs(problem.P.num / problem.P.den) % 1 === 0)) throw new Error('pattern4 must combine a non-unit leading coefficient with a fractional shift');

    const correct = answerFor(problem);
    if (!isCompletingSquareAnswerCorrect(problem, correct)) throw new Error(`${pattern}: canonical answer was rejected`);
    const invalidAnswers = [
      { ...correct, a: '1.5' },
      { ...correct, a: '1e0' },
      { ...correct, pNum: `${correct.pNum}.9` },
      { ...correct, pDen: '0' },
      { ...correct, qNum: `${correct.qNum}.9` },
      { ...correct, qDen: '0' },
      { ...correct, qDen: '-2' },
      { ...correct, pNum: '9007199254740992' },
    ];
    if (invalidAnswers.some(answer => isCompletingSquareAnswerCorrect(problem, answer))) {
      throw new Error(`${pattern}: malformed, decimal, zero-denominator, or unsafe-number input was accepted`);
    }
    if (isCompletingSquareAnswerCorrect(problem, { ...correct, qNum: `${Number(correct.qNum) + 1}` })) throw new Error(`${pattern}: an incorrect constant was accepted`);

    for (const x of [-3.25, -0.5, 0, 1.75, 4]) {
      const original = problem.a * x * x + problem.b * x + problem.c;
      const transformed = problem.a * (x + problem.P.num / problem.P.den) ** 2 + problem.Q.num / problem.Q.den;
      if (!close(original, transformed)) throw new Error(`${pattern}: completed-square identity failed at x=${x}`);
    }
  }
}

const mixedCount = 4000;
const mixed = Array.from({ length: mixedCount }, () => generateCompletingSquareProblem('mix'));
const counts = Object.fromEntries(completingSquarePatterns.map(pattern => [pattern, mixed.filter(problem => problem.pattern === pattern).length]));
if (completingSquarePatterns.some(pattern => counts[pattern] !== mixedCount / completingSquarePatterns.length)) {
  throw new Error(`Mixed pattern distribution is unbalanced: ${JSON.stringify(counts)}`);
}
if (mixed.some((problem, index) => index > 0 && problem.pattern === mixed[index - 1].pattern)) {
  throw new Error('Mixed practice contains adjacent repeats.');
}

console.log(`Completing-square drills verified: ${fixedCount * completingSquarePatterns.length} fixed and ${mixedCount} mixed questions; identities, pattern constraints, strict answer validation, balance, and adjacency checked.`);
