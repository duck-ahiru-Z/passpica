import fs from 'node:fs';
import path from 'node:path';
import { generateLimitProblem, limitPatterns } from '../src/lib/calculus3Limits.ts';
import { exponentialSequenceTerm, sineRatioForNonzeroRadians } from '../src/lib/calculus3LimitVisual.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-limit-drill/page.tsx'), 'utf8');
const visualPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-limit-visual/page.tsx'), 'utf8');
const learningPortal = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/page.tsx'), 'utf8');
if (!visualPage.includes('xはラジアンで測ります') || !visualPage.includes('x（ラジアン）= ±')
  || !visualPage.includes('aria-label="x（ラジアン）の大きさ"')
  || !visualPage.includes('sineRatioForNonzeroRadians')) {
  throw new Error('the sin(x)/x visual must state the radian convention visibly, accessibly, and in its production calculation');
}
if (!visualPage.includes('x軸はラジアンで−π、−1、0、1、π')
  || !visualPage.includes('[-Math.PI, -1, 1, Math.PI].map')) {
  throw new Error('the limit graph must label its horizontal scale in radians');
}
if (!visualPage.includes('数列 (1 + a/n)ⁿ は eᵃ に近づく')
  || !visualPage.includes('aria-label="指数型数列の係数 a"')
  || !visualPage.includes('aria-label="数列の項番号 n"')
  || !visualPage.includes('極限値との差')) {
  throw new Error('the limit visual must include an accessible, interactive exponential-sequence demonstration');
}
if (!learningPortal.includes("title: '極限の直感：関数・指数型数列ビジュアル'")
  || !learningPortal.includes('(1+a/n)ⁿ→eᵃ')) {
  throw new Error('the learning portal card must describe both function and sequence limit visuals');
}
if (!drillPage.includes("href=\"/learn/math/calculus3-limit-visual\"")) {
  throw new Error('the limit drill must link directly to its related limit-intuition visual');
}
if (!visualPage.includes('href="/learn/math/calculus3-limit-drill"') || !visualPage.includes('極限の解法選択を問題で練習する →')) {
  throw new Error('the limit-intuition visual must link directly to the fixed-pattern and mixed limit drill');
}
const close = (actual, expected, tolerance = 1e-12) => Math.abs(actual - expected) <= tolerance;
for (const coefficient of [0.5, 1, 2, 2.5]) {
  let previous = 0;
  for (const n of [1, 2, 5, 10, 50, 100, 1000, 100_000]) {
    const value = exponentialSequenceTerm(coefficient, n);
    if (!(value > previous) || value >= Math.exp(coefficient)) throw new Error(`(1+${coefficient}/n)^n should increase toward e^${coefficient} from below at n=${n}`);
    previous = value;
  }
  if (Math.abs(Math.exp(coefficient) - exponentialSequenceTerm(coefficient, 100_000)) > 0.001) {
    throw new Error(`the exponential sequence should approach e^${coefficient}`);
  }
}
for (const invalidN of [0, -1, 1.5, Infinity]) {
  let rejected = false;
  try { exponentialSequenceTerm(1, invalidN); } catch (error) { rejected = error instanceof RangeError; }
  if (!rejected) throw new Error(`invalid sequence index ${invalidN} must be rejected`);
}
for (const x of [0.05, 0.1, 0.5, 1, 2.8]) {
  const right = sineRatioForNonzeroRadians(x);
  const left = sineRatioForNonzeroRadians(-x);
  if (!close(right, left) || !close(right, Math.sin(x) / x)) throw new Error(`radian sine ratio mismatch at x=${x}`);
}
if (!(sineRatioForNonzeroRadians(0.05) < 1) || !(sineRatioForNonzeroRadians(0.05) > sineRatioForNonzeroRadians(0.1))) {
  throw new Error('positive values near zero should approach the y=1 limit from below');
}
let rejectedZero = false;
try { sineRatioForNonzeroRadians(0); } catch (error) { rejectedZero = error instanceof RangeError; }
if (!rejectedZero) throw new Error('the visual calculation must preserve the hole at x=0 instead of defining the function there');
let rejectedDegrees = false;
try { sineRatioForNonzeroRadians(Infinity); } catch (error) { rejectedDegrees = error instanceof RangeError; }
if (!rejectedDegrees) throw new Error('non-finite slider values must be rejected');
if (!/type="radio"\s+name="limit-strategy"/.test(drillPage) || drillPage.includes('onClick={() => setStrategy(p)}')) {
  throw new Error('limit strategy must be a single-choice radio group');
}
if (!/const correct = .*strategy === problem\.pattern.*Math\.abs\(numericAnswer - Number\(problem\.answer\)\) <= 0\.0005/.test(drillPage)) {
  throw new Error('limit answers must require the correct strategy and the rounded numeric value');
}
if (!drillPage.includes('role="status" aria-live="polite"') || !drillPage.includes('!strategyIsCorrect') || !drillPage.includes('!valueIsCorrect')) {
  throw new Error('limit feedback must announce the result and distinguish strategy from value errors');
}
if (!drillPage.includes('実戦練習：極限 全パターンランダム') || !drillPage.includes('基礎練習：{limitLabels[pattern]}だけ')) {
  throw new Error('the learner must be able to choose either mixed limit practice or one fixed pattern');
}
if (!drillPage.includes("setStrategy(selectedMode === 'mix' ? '' : selectedMode)") || !drillPage.includes("{mode === 'mix' ? (") || !drillPage.includes('基礎練習：{limitLabels[mode]}に固定して繰り返します。')) {
  throw new Error('fixed limit practice must lock its pattern while mixed practice asks learners to identify it');
}
if (!drillPage.includes("isContinuity ? 'overflow-x-auto p-3 text-base sm:p-6 sm:text-lg lg:text-xl' : 'p-8 text-2xl'")
  || !drillPage.includes("isContinuity ? 'whitespace-nowrap' : undefined")) {
  throw new Error('the long continuity piecewise expression must remain legible without awkward line breaks on narrow screens');
}

const stableRandom = () => 0.37;
const checks = {
  factor: problem => {
    const [, point] = problem.expression.match(/\\lim_\{x\\to (\d+)\}/);
    const n = Number(point);
    return Number(problem.answer) === 2 * n && problem.explanation.includes(`(x−${n})(x+${n})`);
  },
  rationalize: problem => {
    const [, coefficient] = problem.expression.match(/\\sqrt\{1\+(?:(\d+)x|x)\}/);
    const n = Number(coefficient ?? 1);
    const radicalTerm = n === 1 ? 'x' : `${n}x`;
    return Number(problem.answer) === n / 2 && problem.explanation.includes(`${n}/(√(1+${radicalTerm})+1)`);
  },
  dominant: problem => {
    const [, aText, cText] = problem.expression.match(/\\frac\{(?:(\d+)x\^2|x\^2)-x\+1\}\{(?:(\d+)x\^2|x\^2)\+4\}/);
    const a = Number(aText ?? 1); const c = Number(cText ?? 1);
    return close(Number(problem.answer), a / c) && problem.explanation.includes(`${a}/${c}`);
  },
  squeeze: problem => {
    const [, coefficient] = problem.expression.match(/\\sin\\frac\{(\d+)\}\{x\}/);
    const k = Number(coefficient);
    const boundHoldsForBothSigns = [-0.1, -0.01, -0.001, 0.001, 0.01, 0.1].every(x => {
      const value = x * Math.sin(k / x);
      return -Math.abs(x) <= value && value <= Math.abs(x);
    });
    return Number(problem.answer) === 0 && problem.explanation.includes(`sin(${coefficient}/x)`)
      && problem.explanation.includes('−|x|≤') && boundHoldsForBothSigns;
  },
  sequence: problem => {
    if (problem.expression.includes('\\sqrt')) {
      const [, aText] = problem.expression.match(/\\sqrt\{n\^2\+(\d+)n\}-n/);
      const a = Number(aText);
      return close(Number(problem.answer), a / 2)
        && problem.explanation.includes(`${a}n/(√(n²+${a}n)+n)`)
        && problem.explanation.includes(`極限値は ${a}/2`);
    }
    if (problem.expression.includes('n^2')) {
      const [, aText, cText] = problem.expression.match(/\\frac\{(?:(\d+)n\^2|n\^2)\+n\}\{(?:(\d+)n\^2|n\^2)\+2\}/);
      const a = Number(aText ?? 1); const c = Number(cText ?? 1);
      return close(Number(problem.answer), a / c) && problem.explanation.includes(`最高次係数の比 ${a}/${c}`)
        && !problem.expression.includes('1n^2');
    }
    const [, aText, cText] = problem.expression.match(/\\frac\{(?:(\d+)n|n)\+1\}\{(?:(\d+)n|n)\+2\}/);
    const a = Number(aText ?? 1); const c = Number(cText ?? 1);
    return close(Number(problem.answer), a / c) && problem.explanation.includes(`${a}/${c}`);
  },
  exponentialSequence: problem => {
    const [, coefficientText] = problem.expression.match(/\\left\(1\+\\frac\{(\d+)\}\{n\}\\right\)\^n/);
    const coefficient = Number(coefficientText);
    return close(Number(problem.answer), Math.exp(coefficient))
      && problem.explanation.includes(`極限値は e^${coefficient}`)
      && problem.explanation.includes('(1+u)^(1/u)→e')
      && !problem.explanation.includes('\\\\frac')
      && problem.explanation.includes(Math.exp(coefficient).toFixed(3));
  },
  trigonometric: problem => {
    const [, coefficient] = problem.expression.match(/\\sin\((?:(\d+)x|x)\)/);
    const n = Number(coefficient ?? 1);
    return Number(problem.answer) === n && problem.expression.includes('ラジアン')
      && problem.explanation.includes(`sin(${n === 1 ? 'x' : `${n}x`})/x=${n}·sin u/u`)
      && problem.explanation.includes('sin u/u=1') && problem.explanation.includes(`極限値は ${n}`);
  },
  tangent: problem => {
    const [, coefficient] = problem.expression.match(/\\tan\((?:(\d+)x|x)\)/);
    const n = Number(coefficient ?? 1);
    return Number(problem.answer) === n && problem.expression.includes('ラジアン')
      && problem.explanation.includes(`tan(${n === 1 ? 'x' : `${n}x`})/x=${n}·tan u/u`)
      && problem.explanation.includes('tan u/u=1') && problem.explanation.includes(`極限値は ${n}`);
  },
  sineRatio: problem => {
    const [, aText, bText] = problem.expression.match(/\\frac\{\\sin\((?:(\d+)x|x)\)\}\{\\sin\((?:(\d+)x|x)\)\}/);
    const a = Number(aText ?? 1); const b = Number(bText ?? 1);
    return close(Number(problem.answer), a / b) && problem.expression.includes('ラジアン')
      && problem.explanation.includes(`(${a}/${b})·[sin(`) && problem.explanation.includes(`極限値は ${a}/${b}`);
  },
  continuity: problem => {
    const [, squared, denominatorPoint, point] = problem.expression.match(/x\^2-(\d+)\}\{x-(\d+)\} & \(x\\ne (\d+)\)/);
    const n = Number(point);
    return Number(squared) === n ** 2 && Number(denominatorPoint) === n && Number(problem.answer) === 2 * n
      && problem.expression.includes(`x=${n}`) && problem.explanation.includes(`極限値=f(${n})=k`);
  },
};
const expectedVariants = { factor: 7, rationalize: 8, dominant: 9, squeeze: 5, sequence: 27, exponentialSequence: 3, trigonometric: 5, tangent: 5, sineRatio: 5, continuity: 5 };

for (const pattern of limitPatterns) {
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateLimitProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    if (pattern === 'rationalize' && problem.expression.includes('+1x')) throw new Error('radical coefficient 1 should be omitted');
    if (pattern === 'dominant' && /\\frac\{1x\^2|\}\{1x\^2/.test(problem.expression)) throw new Error('leading coefficient 1 should be omitted in rational functions');
    if (pattern === 'sequence' && /\\frac\{1n|\}\{1n/.test(problem.expression)) throw new Error('leading coefficient 1 should be omitted in sequence terms');
    seen.add(problem.expression);
  }
  if (seen.size !== expectedVariants[pattern]) throw new Error(`${pattern} generated ${seen.size}/${expectedVariants[pattern]} expected variants`);
  if (pattern === 'sequence') {
    const forms = new Set([...seen].map(expression => expression.includes('\\sqrt') ? 'radical' : expression.includes('n^2') ? 'quadratic-ratio' : 'linear-ratio'));
    if (forms.size !== 3) throw new Error(`sequence limits must include linear ratios, higher-degree ratios, and radical differences: ${JSON.stringify([...forms])}`);
  }
}

const mixed = Array.from({ length: 900 }, () => generateLimitProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += limitPatterns.length) {
  if (new Set(mixed.slice(start, start + limitPatterns.length)).size !== limitPatterns.length) throw new Error(`mixed set omitted a limit pattern in batch ${start / limitPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed limit practice repeated adjacent patterns');

for (let seed = 1; seed <= 20; seed += 1) {
  let state = seed;
  const seededRandom = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const sequence = Array.from({ length: 10_000 }, () => generateLimitProblem('mix', seededRandom).pattern);
  for (let start = 0; start < sequence.length; start += limitPatterns.length) {
    const batch = sequence.slice(start, start + limitPatterns.length);
    if (new Set(batch).size !== limitPatterns.length) throw new Error(`seed ${seed} omitted a pattern in mixed batch ${start / limitPatterns.length}`);
  }
  if (sequence.some((pattern, index) => index > 0 && pattern === sequence[index - 1])) throw new Error(`seed ${seed} repeated adjacent mixed patterns`);
}

console.log('Calculus III limits verified: ten fixed patterns, formulas, answers, and variants; 200,000 seeded mixed questions plus 900 deterministic balance cases checked.');
