import { differentiationPatterns, generateDifferentiationProblem } from '../src/lib/calculus3Differentiation.ts';

const stableRandom = () => 0.37;
const close = (actual, expected) => Math.abs(actual - expected) < 1e-10;
const checks = {
  chain: problem => {
    const [, a, n] = problem.expression.match(/y=\((\d+)x\^2\+1\)\^\{(\d+)\}/);
    const expected = 2 * Number(a) * Number(n) * (Number(a) + 1) ** (Number(n) - 1);
    return close(problem.answer, expected) && problem.explanation.includes(String(expected));
  },
  product: problem => {
    const [, power] = problem.expression.match(/y=x\^\{(\d+)\}\\sin/);
    const n = Number(power);
    return close(problem.answer, n * (Math.PI / 2) ** (n - 1)) && problem.explanation.includes('積の微分');
  },
  logarithmic: problem => {
    const [, a] = problem.expression.match(/y=x\^\{(\d+)x\}/);
    return problem.answer === Number(a) && problem.explanation.includes('対数微分');
  },
  parametric: problem => {
    const [, c] = problem.expression.match(/y=t\^3-(\d+)t/);
    return close(problem.answer, (3 - Number(c)) / 2) && problem.explanation.includes(`dy/dx=`);
  },
  implicit: problem => {
    const [, a, constant] = problem.expression.match(/x\^2\+(\d+)xy\+y\^2=(\d+)/);
    const n = Number(a);
    return Number(constant) === 5 + 2 * n && close(problem.answer, -(2 + 2 * n) / (n + 4)) && problem.explanation.includes('陰関数微分');
  },
  inverse: problem => {
    const [, a] = problem.expression.match(/f\(x\)=x\^3\+(\d+)x/);
    return close(problem.answer, 1 / (Number(a) + 3)) && problem.explanation.includes('逆関数の微分公式');
  },
  higher: problem => {
    const [, a] = problem.expression.match(/y=e\^\{(\d+)x\}/);
    return problem.answer === Number(a) ** 2 && problem.explanation.includes('y′′');
  },
};
const expectedVariants = { chain: 9, product: 4, logarithmic: 5, parametric: 4, implicit: 5, inverse: 5, higher: 5 };

for (const pattern of differentiationPatterns) {
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateDifferentiationProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    seen.add(problem.expression);
  }
  if (seen.size !== expectedVariants[pattern]) throw new Error(`${pattern} generated ${seen.size}/${expectedVariants[pattern]} expected variants`);
}

const mixed = Array.from({ length: 700 }, () => generateDifferentiationProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += differentiationPatterns.length) {
  if (new Set(mixed.slice(start, start + differentiationPatterns.length)).size !== differentiationPatterns.length) throw new Error(`mixed set omitted a differentiation pattern in batch ${start / differentiationPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed differentiation practice repeated adjacent patterns');

console.log('Calculus III differentiation verified: 3,500 fixed-pattern questions and 700 mixed questions; formulas, answers, variants, balance, and adjacency checked.');
