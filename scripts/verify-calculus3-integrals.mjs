import fs from 'node:fs';
import path from 'node:path';
import { generateIntegralProblem, integralPatterns, isIntegralAnswerCorrect } from '../src/lib/calculus3Integrals.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-integral-drill/page.tsx'), 'utf8');
if (!/type="radio"\s+name="integral-strategy"/.test(drillPage) || drillPage.includes('aria-pressed={strategy === p}')) {
  throw new Error('integral strategy must be a single-choice radio group');
}
if (!/const isCorrect = strategy === problem\.pattern && isIntegralAnswerCorrect\(answer, problem\.answer\)/.test(drillPage)) {
  throw new Error('integral answers must require both the correct strategy and numeric value');
}
if (!drillPage.includes('role="status" aria-live="polite"') || !drillPage.includes('!strategyIsCorrect') || !drillPage.includes('!valueIsCorrect')) {
  throw new Error('integral feedback must announce the result and distinguish strategy from value errors');
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
    const [, rate] = problem.expression.match(/e\^\{(\d+)x\}/);
    const n = Number(rate);
    const expected = (Math.exp(n) * (n - 1) + 1) / n ** 2;
    return close(problem.answer, expected)
      && problem.explanation.includes(`xe^(${n}x)/${n}−e^(${n}x)/${n}²]₀¹`)
      && problem.explanation.includes(`≈ ${expected.toFixed(3)}`);
  },
  rational: problem => {
    const [, xCoefficient, constant] = problem.expression.match(/\\frac\{(\d+)x\+(\d+)\}/);
    const a = Number(constant) - Number(xCoefficient);
    const b = 2 * Number(xCoefficient) - Number(constant);
    return close(problem.answer, a * Math.log(2) + b * Math.log(1.5))
      && problem.explanation.includes(`${a}/(x+1)+${b}/(x+2)`);
  },
  trig: problem => {
    const [, exponent] = problem.expression.match(/\\sin\^\{(\d+)\}/);
    const n = Number(exponent);
    const expected = Array.from({ length: (n - 1) / 2 }, (_, index) => 2 * (index + 1) / (2 * (index + 1) + 1)).reduce((product, factor) => product * factor, 1);
    return close(problem.answer, expected) && problem.hint.includes('置換');
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
if (isIntegralAnswerCorrect('1.71', Math.E - 1)) throw new Error('answers rounded more coarsely than the display should not be accepted');
if (isIntegralAnswerCorrect('', 1) || isIntegralAnswerCorrect('Infinity', 1)) throw new Error('empty and non-finite answers should be rejected');
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

console.log('Calculus III integration verified: 2,500 fixed-pattern questions and 600 mixed questions; answers, formulas, all variants, balance, and adjacency checked.');
