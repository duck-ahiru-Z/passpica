import fs from 'node:fs';
import path from 'node:path';
import { generateIntegralProblem, getIntegralExplanation, integralPatterns, isIntegralAnswerCorrect, isIntegralStrategyValid } from '../src/lib/calculus3Integrals.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-integral-drill/page.tsx'), 'utf8');
if (!/type="radio"\s+name="integral-strategy"/.test(drillPage) || drillPage.includes('aria-pressed={strategy === p}')) {
  throw new Error('integral strategy must be a single-choice radio group');
}
if (!/const isCorrect = isIntegralStrategyValid\(problem, strategy\) && isIntegralAnswerCorrect\(answer, problem\.answer\)/.test(drillPage)) {
  throw new Error('integral answers must accept valid alternate strategies and require the correct numeric value');
}
if (!drillPage.includes('role="status" aria-live="polite"') || !drillPage.includes('!strategyIsCorrect') || !drillPage.includes('!valueIsCorrect')) {
  throw new Error('integral feedback must announce the result and distinguish strategy from value errors');
}
if (!drillPage.includes('実戦練習：積分法 全パターンランダム') || !drillPage.includes('基礎練習：{integralLabels[p]}だけ')) {
  throw new Error('the learner must be able to choose either mixed strategy practice or one fixed integration pattern');
}
if (!drillPage.includes('小数第3位まで入力しなさい（許容誤差 ±0.0005）')) {
  throw new Error('integral answer precision guidance must match the accepted rounding tolerance');
}
if (!drillPage.includes("setStrategy(selectedMode === 'mix' ? '' : selectedMode)") || !drillPage.includes("mode === 'mix' ? (") || !drillPage.includes('基礎練習：{integralLabels[mode]}に固定して繰り返します。')) {
  throw new Error('fixed-pattern practice must lock the target method while mixed practice asks the learner to choose it');
}
if (drillPage.includes('role="img" aria-label={`積分問題: ${accessibleMath}`}') || drillPage.includes('.replace(/[{}_^]/g')) {
  throw new Error('KaTeX MathML should remain available instead of flattening equations into ambiguous spoken text');
}

const stableRandom = () => 0.37;
const close = (actual, expected) => Math.abs(actual - expected) < 1e-10;
const checks = {
  substitution: problem => {
    const [, power] = problem.expression.match(/\^\{(\d+)\}/);
    const p = Number(power);
    return close(problem.answer, (2 ** (p + 1) - 1) / (p + 1)) && problem.explanation.includes(`2^${p + 1}`);
  },
  parts: problem => {
    const [, exponent] = problem.expression.match(/e\^\{(x|\d+x)\}/);
    const n = exponent === 'x' ? 1 : Number(exponent.slice(0, -1));
    const expected = (Math.exp(n) * (n - 1) + 1) / n ** 2;
    return close(problem.answer, expected)
      && (n === 1
        ? problem.expression.includes('e^{x}') && problem.explanation.includes('[xeˣ−eˣ]₀¹ = e−(e−1)=1') && !problem.explanation.includes('1x')
        : problem.explanation.includes(`xe^(${n}x)/${n}−e^(${n}x)/${n}²]₀¹`))
      && problem.explanation.includes(`≈ ${expected.toFixed(3)}`);
  },
  rational: problem => {
    const [, xCoefficient, constant] = problem.expression.match(/\\frac\{(\d+)x\+(\d+)\}/);
    const a = Number(constant) - Number(xCoefficient);
    const b = 2 * Number(xCoefficient) - Number(constant);
    const logTerm = (coefficient, argument) => `${coefficient === 1 ? '' : `${coefficient} `}ln ${argument}`;
    return close(problem.answer, a * Math.log(2) + b * Math.log(1.5))
      && problem.explanation.includes(`${a}/(x+1)+${b}/(x+2)`)
      && problem.explanation.includes(`${logTerm(a, '2')} + ${logTerm(b, '(3/2)')}`)
      && !problem.explanation.includes('1 ln')
      && (a + b) === Number(xCoefficient)
      && (2 * a + b) === Number(constant);
  },
  trig: problem => {
    const [, exponent] = problem.expression.match(/\\sin\^\{(\d+)\}/);
    const n = Number(exponent);
    const factors = Array.from({ length: (n - 1) / 2 }, (_, index) => `${n - 1 - 2 * index}/${n - 2 * index}`);
    const expected = factors.reduce((product, factor) => {
      const [numerator, denominator] = factor.split('/').map(Number);
      return product * numerator / denominator;
    }, 1);
    return close(problem.answer, expected) && problem.hint.includes('置換')
      && problem.explanation.includes(`I_${n}=${factors.join('×')}=${expected.toFixed(3)}`);
  },
  radical: problem => {
    const [, upper, radius] = problem.expression.match(/\\int_0\^\{(.*?)\} \\sqrt\{(\d+)\^2-x\^2\}/);
    const r = Number(radius);
    const expectedUpper = r % 2 === 0 ? String(r / 2) : `\\frac{${r}}{2}`;
    const expected = r ** 2 * (Math.PI / 12 + Math.sqrt(3) / 8);
    return upper === expectedUpper && close(problem.answer, expected)
      && problem.hint.includes('上端が R/2') && problem.explanation.includes('sin θ=1/2 より θ=π/6')
      && !problem.explanation.includes('\\frac')
      && problem.explanation.includes(expected.toFixed(3));
  },
};

const expectedVariants = { substitution: 4, parts: 3, rational: 9, trig: 4, radical: 5 };
if (!isIntegralAnswerCorrect('1.718', Math.E - 1)) throw new Error('three-decimal displayed answers should be accepted');
if (!isIntegralAnswerCorrect(String(Math.E - 1), Math.E - 1)) throw new Error('full-precision integral answers should be accepted');
if (!isIntegralAnswerCorrect('1.718281', Math.E - 1)) throw new Error('more precise integral answers should be accepted');
if (isIntegralAnswerCorrect('1.71', Math.E - 1)) throw new Error('answers rounded more coarsely than the display should not be accepted');
if (isIntegralAnswerCorrect('', 1) || isIntegralAnswerCorrect('Infinity', 1)) throw new Error('empty and non-finite answers should be rejected');
const trigProblem = generateIntegralProblem('trig', () => 0);
if (!isIntegralStrategyValid(trigProblem, 'trig') || !isIntegralStrategyValid(trigProblem, 'substitution')) {
  throw new Error('odd-powered sine integrals must accept both the trigonometric-integral method and u=cos x substitution');
}
if (isIntegralStrategyValid(trigProblem, 'parts') || !getIntegralExplanation(trigProblem, 'substitution').includes('u=cos x')) {
  throw new Error('only valid alternative methods should pass, and each accepted method must have its own explanation');
}
for (const pattern of integralPatterns) {
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateIntegralProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    seen.add(problem.expression);
  }
  if (seen.size !== expectedVariants[pattern]) throw new Error(`${pattern} generated ${seen.size}/${expectedVariants[pattern]} expected variants`);
}

const mixed = Array.from({ length: 600 }, () => generateIntegralProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += integralPatterns.length) {
  const batch = mixed.slice(start, start + integralPatterns.length);
  if (new Set(batch).size !== integralPatterns.length) throw new Error(`mixed set omitted an integral pattern in batch ${start / integralPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed integral practice repeated adjacent patterns');

for (let seed = 1; seed <= 20; seed += 1) {
  let state = seed;
  const seededRandom = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const sequence = Array.from({ length: 5_000 }, () => generateIntegralProblem('mix', seededRandom).pattern);
  for (let start = 0; start < sequence.length; start += integralPatterns.length) {
    const batch = sequence.slice(start, start + integralPatterns.length);
    if (new Set(batch).size !== integralPatterns.length) throw new Error(`seed ${seed} omitted a pattern in mixed batch ${start / integralPatterns.length}`);
  }
  if (sequence.some((pattern, index) => index > 0 && pattern === sequence[index - 1])) throw new Error(`seed ${seed} repeated adjacent mixed patterns`);
}

console.log('Calculus III integration verified: fixed-pattern options, formulas, answers, and variants; 100,000 seeded mixed questions plus 600 deterministic balance cases checked.');
