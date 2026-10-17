import { generateGeometryProblem, geometryPatterns } from '../src/lib/calculus3Geometry.ts';

const stableRandom = () => 0.37;
const checks = {
  'between-curves': problem => {
    const [, a] = problem.expression.match(/y=(\d+)x/);
    const value = Number(a);
    return Math.abs(problem.answer - value ** 3 / 6) < 1e-12 && problem.explanation.includes(`∫₀^${value}`);
  },
  'x-axis-rotation': problem => {
    const [, power] = problem.expression.match(/y=x\^\{(\d+)\}/);
    return Math.abs(problem.answer - Math.PI / (2 * Number(power) + 1)) < 1e-12;
  },
  'y-axis-rotation': problem => {
    const [, radius] = problem.expression.match(/0\\le x\\le(\d+)/);
    return Math.abs(problem.answer - (4 * Math.PI * Number(radius) ** 2.5) / 5) < 1e-10;
  },
  'curve-length': problem => {
    const [, upper] = problem.expression.match(/0\\le x\\le(\d+)/);
    return Math.abs(problem.answer - (2 / 3) * ((Number(upper) + 1) ** 1.5 - 1)) < 1e-12;
  },
};

for (const pattern of geometryPatterns) {
  const variants = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateGeometryProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    variants.add(problem.expression);
  }
  if (variants.size !== 5) throw new Error(`${pattern} generated ${variants.size}/5 expected coefficient or interval variants`);
}

const mixed = Array.from({ length: 400 }, () => generateGeometryProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += geometryPatterns.length) {
  if (new Set(mixed.slice(start, start + geometryPatterns.length)).size !== geometryPatterns.length) throw new Error(`mixed set omitted a geometry pattern in batch ${start / geometryPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed geometry practice repeated adjacent patterns');
console.log('Calculus III geometry verified: 2,000 fixed-pattern questions and 400 mixed questions; formulas, answers, variants, balance, and adjacency checked.');
