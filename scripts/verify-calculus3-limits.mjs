import fs from 'node:fs';
import path from 'node:path';
import { generateLimitProblem, limitPatterns } from '../src/lib/calculus3Limits.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-limit-drill/page.tsx'), 'utf8');
if (!/type="radio"\s+name="limit-strategy"/.test(drillPage) || drillPage.includes('onClick={() => setStrategy(p)}')) {
  throw new Error('limit strategy must be a single-choice radio group');
}
if (!/const correct = .*strategy === problem\.pattern.*Math\.abs\(numericAnswer - Number\(problem\.answer\)\) <= 0\.0005/.test(drillPage)) {
  throw new Error('limit answers must require the correct strategy and the rounded numeric value');
}
if (!drillPage.includes('role="status" aria-live="polite"') || !drillPage.includes('!strategyIsCorrect') || !drillPage.includes('!valueIsCorrect')) {
  throw new Error('limit feedback must announce the result and distinguish strategy from value errors');
}

const stableRandom = () => 0.37;
const close = (actual, expected) => Math.abs(actual - expected) < 1e-12;
const checks = {
  factor: problem => {
    const [, point] = problem.expression.match(/\\lim_\{x\\to (\d+)\}/);
    const n = Number(point);
    return Number(problem.answer) === 2 * n && problem.explanation.includes(`(x−${n})(x+${n})`);
  },
  rationalize: problem => {
    const [, coefficient] = problem.expression.match(/\\sqrt\{1\+(\d+)x\}/);
    const n = Number(coefficient);
    return Number(problem.answer) === n / 2 && problem.explanation.includes(`${n}/(√(1+${n}x)+1)`);
  },
  dominant: problem => {
    const [, a, c] = problem.expression.match(/\\frac\{(\d+)x\^2-x\+1\}\{(\d+)x\^2\+4\}/);
    return close(Number(problem.answer), Number(a) / Number(c)) && problem.explanation.includes(`${a}/${c}`);
  },
  squeeze: problem => {
    const [, coefficient] = problem.expression.match(/\\sin\\frac\{(\d+)\}\{x\}/);
    return Number(problem.answer) === 0 && problem.explanation.includes(`sin(${coefficient}/x)`);
  },
  sequence: problem => {
    const [, a, c] = problem.expression.match(/\\frac\{(\d+)n\+1\}\{(\d+)n\+2\}/);
    return close(Number(problem.answer), Number(a) / Number(c)) && problem.explanation.includes(`${a}/${c}`);
  },
  trigonometric: problem => {
    const [, coefficient] = problem.expression.match(/\\sin\((?:(\d+)x|x)\)/);
    const n = Number(coefficient ?? 1);
    return Number(problem.answer) === n && problem.expression.includes('ラジアン')
      && problem.explanation.includes('sin u/u=1') && problem.explanation.includes(`極限値は ${n}`);
  },
  continuity: problem => {
    const [, squared, denominatorPoint, point] = problem.expression.match(/x\^2-(\d+)\}\{x-(\d+)\} & \(x\\ne (\d+)\)/);
    const n = Number(point);
    return Number(squared) === n ** 2 && Number(denominatorPoint) === n && Number(problem.answer) === 2 * n
      && problem.expression.includes(`x=${n}`) && problem.explanation.includes(`極限値=f(${n})=k`);
  },
};
const expectedVariants = { factor: 7, rationalize: 8, dominant: 9, squeeze: 5, sequence: 9, trigonometric: 5, continuity: 5 };

for (const pattern of limitPatterns) {
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateLimitProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    seen.add(problem.expression);
  }
  if (seen.size !== expectedVariants[pattern]) throw new Error(`${pattern} generated ${seen.size}/${expectedVariants[pattern]} expected variants`);
}

const mixed = Array.from({ length: 700 }, () => generateLimitProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += limitPatterns.length) {
  if (new Set(mixed.slice(start, start + limitPatterns.length)).size !== limitPatterns.length) throw new Error(`mixed set omitted a limit pattern in batch ${start / limitPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed limit practice repeated adjacent patterns');

console.log('Calculus III limits verified: 3,500 fixed-pattern questions and 700 mixed questions; formulas, answers, all variants, balance, and adjacency checked.');
