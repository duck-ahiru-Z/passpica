import { generateGeometryProblem, geometryPatterns } from '../src/lib/calculus3Geometry.ts';
import fs from 'node:fs';
import path from 'node:path';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-area-volume-drill/page.tsx'), 'utf8');
if (!/type="radio" name="geometry-strategy"/.test(drillPage) || drillPage.includes('aria-pressed={strategy === p}') || !/disabled=\{!strategy \|\| answer\.trim\(\) === ''\}/.test(drillPage)) {
  throw new Error('geometry drill must expose a single-choice strategy group and require strategy plus answer before checking');
}
if (!drillPage.includes('role="status" aria-live="polite"') || !drillPage.includes('!strategyIsCorrect') || !drillPage.includes('!valueIsCorrect')) {
  throw new Error('geometry feedback must announce the result and distinguish strategy from value errors');
}
if (!drillPage.includes('setStrategy(pattern); setChecked(false);') || !drillPage.includes('setAnswer(e.target.value); setChecked(false);')) {
  throw new Error('changing a geometry strategy or answer must clear stale feedback');
}
if (!drillPage.includes('実戦練習：面積・体積 全パターンランダム') || !drillPage.includes('基礎練習：{geometryLabels[pattern]}だけ')) {
  throw new Error('the learner must be able to choose mixed practice or one fixed geometry pattern');
}
if (!drillPage.includes("setStrategy(selectedMode === 'mix' ? '' : selectedMode)") || !drillPage.includes("{mode === 'mix' ? (") || !drillPage.includes('基礎練習：{geometryLabels[mode]}に固定して繰り返します。')) {
  throw new Error('fixed geometry practice must lock its pattern while mixed practice asks learners to identify it');
}
if (!drillPage.includes('<= 0.0005 + 1e-12') || !drillPage.includes('小数第3位まで入力')) {
  throw new Error('geometry answer precision guidance and accepted rounding tolerance must match');
}

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
    return Math.abs(problem.answer - (4 * Math.PI * Number(radius) ** 2.5) / 5) < 1e-10
      && problem.prompt.includes(`x=0およびx=${radius}`)
      && problem.explanation.includes(`4π×${radius}^(5/2)/5`);
  },
  'shell-method': problem => {
    const [, upper] = problem.expression.match(/0\\le x\\le(\d+)/);
    const value = Number(upper);
    return Math.abs(problem.answer - (2 * Math.PI * value ** 3) / 3) < 1e-10
      && problem.prompt.includes(`x=${value}`)
      && problem.explanation.includes(`V=2π∫₀^${value} x·x dx`);
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

const mixed = Array.from({ length: 500 }, () => generateGeometryProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += geometryPatterns.length) {
  if (new Set(mixed.slice(start, start + geometryPatterns.length)).size !== geometryPatterns.length) throw new Error(`mixed set omitted a geometry pattern in batch ${start / geometryPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed geometry practice repeated adjacent patterns');

for (let seed = 1; seed <= 20; seed += 1) {
  let state = seed;
  const seededRandom = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const sequence = Array.from({ length: 5_000 }, () => generateGeometryProblem('mix', seededRandom).pattern);
  for (let start = 0; start < sequence.length; start += geometryPatterns.length) {
    const batch = sequence.slice(start, start + geometryPatterns.length);
    if (new Set(batch).size !== geometryPatterns.length) throw new Error(`seed ${seed} omitted a pattern in mixed batch ${start / geometryPatterns.length}`);
  }
  if (sequence.some((pattern, index) => index > 0 && pattern === sequence[index - 1])) throw new Error(`seed ${seed} repeated adjacent mixed patterns`);
}
console.log('Calculus III geometry verified: fixed-pattern options, formulas and answers; 100,000 seeded mixed questions plus 500 deterministic balance cases checked.');
