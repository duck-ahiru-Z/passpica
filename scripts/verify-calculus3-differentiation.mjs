import fs from 'node:fs';
import path from 'node:path';
import { differentiationPatterns, generateDifferentiationProblem, isDifferentiationAnswerCorrect } from '../src/lib/calculus3Differentiation.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-differentiation-drill/page.tsx'), 'utf8');
if (!drillPage.includes('/learn/math/calculus3-parametric-visual') || !drillPage.includes('/learn/math/calculus3-derivative-visual')) {
  throw new Error('differentiation drill must link to its related visual lessons');
}
if (!/type="radio"\s+name="differentiation-strategy"/.test(drillPage) || drillPage.includes('aria-pressed={strategy === p}')) {
  throw new Error('differentiation strategy must be a single-choice radio group');
}
if (!/const correct = strategy === problem\.pattern && isDifferentiationAnswerCorrect\(answer, problem\.answer\)/.test(drillPage)) {
  throw new Error('differentiation answers must require both the correct strategy and numeric value');
}
if (!drillPage.includes('role="status" aria-live="polite"') || !drillPage.includes('!strategyIsCorrect') || !drillPage.includes('!valueIsCorrect')) {
  throw new Error('differentiation feedback must announce the result and distinguish strategy from value errors');
}
if (!drillPage.includes('実戦練習：微分法 全パターンランダム') || !drillPage.includes('基礎練習：{differentiationLabels[p]}だけ')) {
  throw new Error('the learner must be able to choose either mixed differentiation practice or one fixed pattern');
}
if (!drillPage.includes("setStrategy(selectedMode === 'mix' ? '' : selectedMode)") || !drillPage.includes("mode === 'mix' ? <fieldset") || !drillPage.includes('基礎練習：{differentiationLabels[mode]}に固定して繰り返します。')) {
  throw new Error('fixed differentiation practice must lock its pattern while mixed practice asks learners to identify it');
}

const stableRandom = () => 0.37;
const close = (actual, expected) => Math.abs(actual - expected) < 1e-10;
const checks = {
  chain: problem => {
    const [, coefficient, exponent] = problem.expression.match(/y=\((?:(\d+)x\^2|x\^2)\+1\)\^\{(\d+)\}/);
    const a = Number(coefficient ?? 1);
    const n = Number(exponent);
    const expected = 2 * a * n * (a + 1) ** (n - 1);
    return close(problem.answer, expected)
      && problem.explanation.includes(String(expected))
      && !problem.expression.includes('1x')
      && !problem.explanation.includes('^1');
  },
  product: problem => {
    const [, power] = problem.expression.match(/y=x\^\{(\d+)\}\\sin/);
    const n = Number(power);
    return close(problem.answer, n * (Math.PI / 2) ** (n - 1))
      && problem.explanation.includes('積の微分')
      && problem.explanation.includes('sin(π/2)=1')
      && problem.explanation.includes('cos(π/2)=0')
      && problem.explanation.includes(problem.answer.toFixed(3));
  },
  logarithmic: problem => {
    const [, a] = problem.expression.match(/y=x\^\{(\d+)x\}/);
    return problem.answer === Number(a) && problem.explanation.includes('対数微分');
  },
  parametric: problem => {
    const [, c] = problem.expression.match(/y=t\^3-(\d+)t/);
    return close(problem.answer, (3 - Number(c)) / 2)
      && problem.explanation.includes(`dy/dx=`)
      && problem.explanation.includes(problem.answer.toFixed(3));
  },
  'ellipse-parametric': problem => {
    const [, angle] = problem.expression.match(/\\left\.\\frac\{dy\}\{dx\}\\right\|_\{t=([^}]+)\}/);
    const values = { '\\pi/6': Math.PI / 6, '\\pi/4': Math.PI / 4, '\\pi/3': Math.PI / 3, '2\\pi/3': 2 * Math.PI / 3 };
    const t = values[angle];
    const expected = -Math.cos(t) / (2 * Math.sin(t));
    return close(problem.answer, expected) && problem.expression.includes('x=2\\cos t')
      && problem.expression.includes('y=\\sin t') && problem.explanation.includes('dx/dt=−2sin t')
      && problem.explanation.includes(expected.toFixed(3));
  },
  implicit: problem => {
    const [, a, constant] = problem.expression.match(/x\^2\+(?:(\d+)xy|xy)\+y\^2=(\d+)/);
    const n = Number(a ?? 1);
    return Number(constant) === 5 + 2 * n
      && close(problem.answer, -(2 + 2 * n) / (n + 4))
      && problem.explanation.includes('陰関数微分')
      && !problem.expression.includes('1xy')
      && !problem.explanation.includes('1y')
      && !problem.explanation.includes('1x')
      && (n !== 1 || (problem.expression.includes('x^2+xy+y^2') && problem.explanation.includes('2x+y') && problem.explanation.includes('x+2y')))
      && problem.explanation.includes(problem.answer.toFixed(3));
  },
  inverse: problem => {
    const [, a] = problem.expression.match(/f\(x\)=x\^3\+(\d+)x/);
    return close(problem.answer, 1 / (Number(a) + 3))
      && problem.expression.includes('g=f^{-1}')
      && problem.explanation.includes('逆関数の微分公式');
  },
  higher: problem => {
    const [, a] = problem.expression.match(/y=e\^\{(\d+)x\}/);
    return problem.answer === Number(a) ** 2 && problem.explanation.includes('y′′');
  },
};
const expectedVariants = { chain: 9, product: 4, logarithmic: 5, parametric: 4, 'ellipse-parametric': 4, implicit: 5, inverse: 5, higher: 5 };
if (!isDifferentiationAnswerCorrect('0.250', 1 / 4)) throw new Error('three-decimal displayed answers should be accepted');
if (!isDifferentiationAnswerCorrect(String(1 / 3), 1 / 3)) throw new Error('full-precision differentiation answers should be accepted');
if (!isDifferentiationAnswerCorrect('0.333333', 1 / 3)) throw new Error('more precise differentiation answers should be accepted');
if (isDifferentiationAnswerCorrect('0.24', 1 / 4)) throw new Error('answers rounded more coarsely than the display should not be accepted');
if (isDifferentiationAnswerCorrect('', 1) || isDifferentiationAnswerCorrect('Infinity', 1)) throw new Error('empty and non-finite answers should be rejected');

for (const pattern of differentiationPatterns) {
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateDifferentiationProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
      if (/[ぁ-んァ-ヶ一-龠]/u.test(problem.expression)) throw new Error(`non-mathematical text must not be sent to KaTeX in ${pattern}`);
    seen.add(problem.expression);
  }
  if (seen.size !== expectedVariants[pattern]) throw new Error(`${pattern} generated ${seen.size}/${expectedVariants[pattern]} expected variants`);
}

const mixed = Array.from({ length: 700 }, () => generateDifferentiationProblem('mix', stableRandom).pattern);
const deterministicCounts = new Map(differentiationPatterns.map(pattern => [pattern, mixed.filter(item => item === pattern).length]));
if (Math.max(...deterministicCounts.values()) - Math.min(...deterministicCounts.values()) > 2) throw new Error(`mixed differentiation counts are imbalanced: ${JSON.stringify(Object.fromEntries(deterministicCounts))}`);
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed differentiation practice repeated adjacent patterns');

for (let seed = 1; seed <= 20; seed += 1) {
  let state = seed;
  const seededRandom = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const sequence = Array.from({ length: 7_000 }, () => generateDifferentiationProblem('mix', seededRandom).pattern);
  const counts = new Map(differentiationPatterns.map(pattern => [pattern, sequence.filter(item => item === pattern).length]));
  if (Math.max(...counts.values()) - Math.min(...counts.values()) > 2) throw new Error(`seed ${seed} produced imbalanced differentiation counts: ${JSON.stringify(Object.fromEntries(counts))}`);
  if (sequence.some((pattern, index) => index > 0 && pattern === sequence[index - 1])) throw new Error(`seed ${seed} repeated adjacent mixed patterns`);
}

console.log('Calculus III differentiation verified: fixed-pattern options, formulas, answers, and variants; 140,700 mixed questions plus adjacency checks verified.');
