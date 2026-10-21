import { generateGeometryProblem, geometryPatterns, getGeometryExplanation, isGeometryStrategyValid } from '../src/lib/calculus3Geometry.ts';
import fs from 'node:fs';
import path from 'node:path';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-area-volume-drill/page.tsx'), 'utf8');
const visualPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-volume-visual/page.tsx'), 'utf8');
if (!/type="radio" name="geometry-strategy"/.test(drillPage) || drillPage.includes('aria-pressed={strategy === p}') || !/disabled=\{!strategy \|\| answer\.trim\(\) === ''\}/.test(drillPage)) {
  throw new Error('geometry drill must expose a single-choice strategy group and require strategy plus answer before checking');
}
if (!drillPage.includes('role="status" aria-live="polite"') || !drillPage.includes('!strategyIsCorrect') || !drillPage.includes('!valueIsCorrect')) {
  throw new Error('geometry feedback must announce the result and distinguish strategy from value errors');
}
if (!drillPage.includes('isGeometryStrategyValid(problem, strategy)') || !drillPage.includes('getGeometryExplanation(problem, strategy)')) {
  throw new Error('geometry feedback must accept and explain mathematically equivalent y-axis washer and shell methods');
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
if (!visualPage.includes('/learn/math/calculus3-area-volume-drill') || !drillPage.includes('/learn/math/calculus3-volume-visual')) {
  throw new Error('volume visual and geometry drill must link to each other');
}

const stableRandom = () => 0.37;
const reducedFraction = (numerator, denominator) => {
  let left = Math.abs(numerator);
  let right = Math.abs(denominator);
  while (right !== 0) [left, right] = [right, left % right];
  const divisor = left || 1;
  const reducedNumerator = numerator / divisor;
  const reducedDenominator = denominator / divisor;
  return reducedDenominator === 1 ? String(reducedNumerator) : `${reducedNumerator}/${reducedDenominator}`;
};
const checks = {
  'between-curves': problem => {
    const [, coefficient] = problem.expression.match(/y=(\d*)x/);
    const value = Number(coefficient || 1);
    const linearTerm = value === 1 ? 'x' : `${value}x`;
    return Math.abs(problem.answer - value ** 3 / 6) < 1e-12
      && problem.explanation.includes(`区間内では ${linearTerm} が上`)
      && problem.explanation.includes(`∫₀^${value}(${linearTerm}−x²)dx=${reducedFraction(value ** 3, 6)}。`);
  },
  'x-axis-rotation': problem => {
    const [, exponent] = problem.expression.match(/y=x(?:\^\{(\d+)\})?/);
    const power = Number(exponent || 1);
    const integrand = power === 1 ? '(x)²' : `(x^${power})²`;
    return Math.abs(problem.answer - Math.PI / (2 * power + 1)) < 1e-12
      && problem.explanation.includes(`π∫₀¹${integrand}dx`);
  },
  'disk-volume': problem => {
    const [, upper] = problem.expression.match(/0\\le x\\le([\d.]+)/);
    const b = Number(upper);
    return Math.abs(problem.answer - Math.PI * b ** 5 / 5) < 1e-10
      && problem.explanation.includes(`V=π∫₀^${b}x⁴dx`)
      && problem.explanation.includes(`上端 b=${b}`);
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
    if (pattern === 'between-curves' && problem.expression.includes('y=1x')) {
      throw new Error('linear coefficient 1 should be omitted from the displayed curve equation');
    }
    if (pattern === 'between-curves' && problem.explanation.includes('1x')) {
      throw new Error('linear coefficient 1 should be omitted from the area explanation');
    }
    if (pattern === 'x-axis-rotation' && problem.expression.includes('x^{1}')) {
      throw new Error('power 1 should be omitted from the displayed curve equation');
    }
    if (pattern === 'x-axis-rotation' && problem.expression.includes('y=x^{2}')) {
      throw new Error('the y=x², [0,1] case belongs to variable-bound disk-volume practice and must not be duplicated here');
    }
    if (pattern === 'x-axis-rotation' && problem.explanation.includes('x^1')) {
      throw new Error('power 1 should be omitted from the disk-method explanation');
    }
    variants.add(problem.expression);
  }
  const expectedVariantCount = ['disk-volume', 'x-axis-rotation'].includes(pattern) ? 4 : 5;
  if (variants.size !== expectedVariantCount) throw new Error(`${pattern} generated ${variants.size}/${expectedVariantCount} expected coefficient or interval variants`);
}

for (let value = 1; value <= 5; value += 1) {
  const washer = generateGeometryProblem('y-axis-rotation', () => (value - 0.5) / 5);
  const shell = generateGeometryProblem('shell-method', () => (value - 0.5) / 5);
  const washerBound = Number(washer.expression.match(/0\\le x\\le(\d+)/)?.[1]);
  const shellBound = Number(shell.expression.match(/0\\le x\\le(\d+)/)?.[1]);
  if (Math.abs(washer.answer - (4 * Math.PI * washerBound ** 2.5) / 5) > 1e-10) throw new Error(`shell-method derivation must equal the washer result for y=√x and upper bound ${washerBound}`);
  if (Math.abs(shell.answer - (2 * Math.PI * shellBound ** 3) / 3) > 1e-10) throw new Error(`washer derivation must equal the shell result for y=x and upper bound ${shellBound}`);
  if (!isGeometryStrategyValid(washer, 'shell-method') || !isGeometryStrategyValid(shell, 'y-axis-rotation')) {
    throw new Error(`equivalent y-axis rotation methods must both be accepted`);
  }
  if (isGeometryStrategyValid(washer, 'x-axis-rotation') || isGeometryStrategyValid(shell, 'curve-length')) {
    throw new Error('unrelated geometry strategies must remain invalid');
  }
  if (!getGeometryExplanation(washer, 'shell-method').includes('円筒殻法')
    || !getGeometryExplanation(shell, 'y-axis-rotation').includes('円環')) {
    throw new Error('accepted alternate method must show its own derivation');
  }
}

const disk = generateGeometryProblem('disk-volume', () => 0);
if (!isGeometryStrategyValid(disk, 'x-axis-rotation')) {
  throw new Error('the y=x² rotating-body problem must accept the general x-axis disk-method strategy');
}
if (!getGeometryExplanation(disk, 'x-axis-rotation').includes('円板法')
  || !getGeometryExplanation(disk, 'x-axis-rotation').includes(disk.answer.toFixed(3))) {
  throw new Error('the accepted disk-method alternative must show its derivation and match the expected volume');
}
if (isGeometryStrategyValid(disk, 'curve-length')) {
  throw new Error('unrelated strategies must remain invalid for the y=x² rotating-body problem');
}

const mixed = Array.from({ length: 500 }, () => generateGeometryProblem('mix', stableRandom).pattern);
const deterministicCounts = new Map(geometryPatterns.map(pattern => [pattern, mixed.filter(item => item === pattern).length]));
if (Math.max(...deterministicCounts.values()) - Math.min(...deterministicCounts.values()) > 2) throw new Error(`mixed geometry counts are imbalanced: ${JSON.stringify(Object.fromEntries(deterministicCounts))}`);
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed geometry practice repeated adjacent patterns');

for (let seed = 1; seed <= 20; seed += 1) {
  let state = seed;
  const seededRandom = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const sequence = Array.from({ length: 5_000 }, () => generateGeometryProblem('mix', seededRandom).pattern);
  const counts = new Map(geometryPatterns.map(pattern => [pattern, sequence.filter(item => item === pattern).length]));
  if (Math.max(...counts.values()) - Math.min(...counts.values()) > 2) throw new Error(`seed ${seed} produced imbalanced geometry counts: ${JSON.stringify(Object.fromEntries(counts))}`);
  if (sequence.some((pattern, index) => index > 0 && pattern === sequence[index - 1])) throw new Error(`seed ${seed} repeated adjacent mixed patterns`);
}
console.log('Calculus III geometry verified: fixed-pattern options, formulas and answers; 100,000 seeded mixed questions plus 500 deterministic balance cases checked.');
