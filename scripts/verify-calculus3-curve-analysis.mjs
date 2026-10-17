import { curvePatterns, generateCurveProblem } from '../src/lib/calculus3CurveAnalysis.ts';

const stableRandom = () => 0.37;
const checks = {
  increase: problem => {
    const [, coefficient] = problem.expression.match(/x\^3-(\d+)x/);
    const n = Math.sqrt(Number(coefficient) / 3);
    return problem.answer === n && problem.explanation.includes(`x=${n}`);
  },
  extrema: problem => {
    const [, coefficient] = problem.expression.match(/x\^3-(\d+)x/);
    const n = Math.sqrt(Number(coefficient) / 3);
    return problem.answer === 4 * n ** 3 && problem.explanation.includes(`差は ${4 * n ** 3}`);
  },
  concavity: problem => {
    const [, n] = problem.expression.match(/x\^3-(\d+)x\^2/);
    return problem.answer === Number(n) / 3 && problem.explanation.includes(`x=${Number(n) / 3}`);
  },
  tangent: problem => {
    const [, n] = problem.expression.match(/x\^2\+(\d+)x/);
    return problem.answer === 2 + Number(n);
  },
  normal: problem => {
    const [, n] = problem.expression.match(/x\^2\+(\d+)x/);
    return Math.abs(problem.answer + 1 / (2 + Number(n))) < 1e-12;
  },
  motion: problem => {
    const [, coefficient] = problem.expression.match(/t\^3-(\d+)t/);
    const n = Number(coefficient) / 3;
    const acceleration = problem.prompt.includes('加速度');
    return acceleration ? problem.answer === 6 && problem.explanation.includes('a=6') : problem.answer === 3 - 3 * n && problem.explanation.includes(`v=${3 - 3 * n}`);
  },
};

for (const pattern of curvePatterns) {
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateCurveProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    seen.add(`${problem.expression}|${problem.prompt}`);
  }
  const expectedVariants = pattern === 'motion' ? 10 : 5;
  if (seen.size !== expectedVariants) throw new Error(`${pattern} generated ${seen.size}/${expectedVariants} expected variants`);
  if (pattern === 'motion') {
    const prompts = new Set(Array.from({ length: 20 }, () => generateCurveProblem(pattern, stableRandom).prompt));
    if (prompts.size !== 2) throw new Error('motion practice must include both velocity and acceleration');
  }
}

const mixed = Array.from({ length: 600 }, () => generateCurveProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += curvePatterns.length) {
  if (new Set(mixed.slice(start, start + curvePatterns.length)).size !== curvePatterns.length) throw new Error(`mixed set omitted a curve pattern in batch ${start / curvePatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed curve practice repeated adjacent patterns');
console.log('Calculus III curve analysis verified: 3,000 fixed-pattern questions and 600 mixed questions; formulas, answers, velocity/acceleration, pattern balance, and adjacency checked.');
