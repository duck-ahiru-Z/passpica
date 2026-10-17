import { differentialEquationPatterns, generateDifferentialEquationProblem, normalizeDifferentialEquationAnswer } from '../src/lib/calculus3DifferentialEquations.ts';
import fs from 'node:fs';
import path from 'node:path';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-differential-equation-drill/page.tsx'), 'utf8');
for (const requirement of ['type="radio" name="differential-equation-strategy"', 'disabled={!strategy || answer.trim() === \'\'}', 'role="status" aria-live="polite"', 'setStrategy(pattern); setChecked(false);', 'setAnswer(event.target.value); setChecked(false);', '入力例：y=2e^(3x)', '実戦練習：微分方程式 全パターンランダム', '基礎練習：{differentialEquationLabels[pattern]}だけ']) {
  if (!drillPage.includes(requirement)) throw new Error(`differential-equation drill is missing accessible input behavior: ${requirement}`);
}
if (drillPage.includes('aria-pressed={strategy === pattern}')) throw new Error('single-choice solution selection must not be exposed as a toggle-button group');

const stableRandom = () => 0.37;
const checks = {
  separation: problem => {
    const [, rate, initial] = problem.expression.match(/dy\/dx = (\d+)y,\s*y\(0\)=(\d+)/);
    return problem.answer === `y=${initial}e^(${rate}x)` && problem.explanation.includes(`dy/y=${rate}dx`);
  },
  initial: problem => {
    const [, rate, initialValue] = problem.expression.match(/dy\/dx = (\d+)x²,\s*y\(1\)=(\d+)/);
    const coefficient = Number(rate) / 3;
    const constant = Number(initialValue) - coefficient;
    const cubicTerm = coefficient === 1 ? 'x^3' : `${coefficient}x^3`;
    return problem.answer === `y=${cubicTerm}+${constant}` && problem.explanation.includes(`C=${constant}`);
  },
  growth: problem => {
    const [, rate] = problem.expression.match(/dN\/dt = ([\d.]+)N/);
    return problem.answer === `${Number(rate) * 100}%/単位時間` && problem.explanation.includes(`k=${rate}`);
  },
  motion: problem => {
    const [, rate, initial] = problem.expression.match(/v\(t\)=(\d+)t、初期位置 x\(0\)=(\d+)/);
    const coefficient = Number(rate) / 2;
    const quadraticTerm = coefficient === 1 ? 't^2' : `${coefficient}t^2`;
    const constantTerm = Number(initial) === 0 ? '' : `+${initial}`;
    return problem.answer === `x=${quadraticTerm}${constantTerm}` && problem.explanation.includes(`C=${initial}`);
  },
};
const expectedVariants = { separation: 25, initial: 25, growth: 8, motion: 25 };

if (normalizeDifferentialEquationAnswer(' y = 2x³ + 4 ') !== normalizeDifferentialEquationAnswer('y=2x^3+4')) {
  throw new Error('equivalent superscript and caret notation should be accepted');
}
if (normalizeDifferentialEquationAnswer('y=4e^(1x)') !== normalizeDifferentialEquationAnswer('y=4e^x')
  || normalizeDifferentialEquationAnswer('y=4e^(5x)') !== normalizeDifferentialEquationAnswer('y=4e^5x')) {
  throw new Error('equivalent exponential notation with an implicit coefficient 1 should be accepted');
}
if (normalizeDifferentialEquationAnswer('y=4e^(5x)') === normalizeDifferentialEquationAnswer('y=4e^(4x)')) {
  throw new Error('different exponential rates must not be normalized to the same answer');
}

for (const pattern of differentialEquationPatterns) {
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateDifferentialEquationProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    seen.add(problem.expression);
  }
  if (seen.size !== expectedVariants[pattern]) throw new Error(`${pattern} generated ${seen.size}/${expectedVariants[pattern]} expected variants`);
}

const mixed = Array.from({ length: 400 }, () => generateDifferentialEquationProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += differentialEquationPatterns.length) {
  if (new Set(mixed.slice(start, start + differentialEquationPatterns.length)).size !== differentialEquationPatterns.length) throw new Error(`mixed set omitted a differential-equation pattern in batch ${start / differentialEquationPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed differential-equation practice repeated adjacent patterns');

for (let seed = 1; seed <= 20; seed += 1) {
  let state = seed;
  const seededRandom = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const sequence = Array.from({ length: 5_000 }, () => generateDifferentialEquationProblem('mix', seededRandom).pattern);
  for (let start = 0; start < sequence.length; start += differentialEquationPatterns.length) {
    const batch = sequence.slice(start, start + differentialEquationPatterns.length);
    if (new Set(batch).size !== differentialEquationPatterns.length) throw new Error(`seed ${seed} omitted a pattern in mixed batch ${start / differentialEquationPatterns.length}`);
  }
  if (sequence.some((pattern, index) => index > 0 && pattern === sequence[index - 1])) throw new Error(`seed ${seed} repeated adjacent mixed patterns`);
}

console.log('Calculus III differential equations verified: fixed-pattern options, formulas, equivalent input notation, and variants; 100,000 seeded mixed questions plus 400 deterministic balance cases checked.');
