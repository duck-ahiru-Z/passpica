import { readFileSync } from 'node:fs';
import {
  formatRlcCalculationAnswer,
  generateRlcCalculationProblem,
  isRlcCalculationAnswerCorrect,
  rlcCalculationPatterns,
} from '../src/lib/rlcCalculationDrill.ts';

const page = readFileSync('src/app/learn/physics/ac-circuit-drill/page.tsx', 'utf8');
const learningPortal = readFileSync('src/app/learn/page.tsx', 'utf8');
const drillPortal = readFileSync('src/app/drill/page.tsx', 'utf8');
const packageScripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
if (!packageScripts['test:rlc-calculation-drill']?.includes('verify-rlc-calculation-drill.mjs')) {
  throw new Error('RLC calculation drill verifier must be available as a dedicated npm script');
}
for (const requirement of [
  'aria-label="計算結果"',
  'name="rlc-method"',
  'role="status" aria-live="polite"',
  'method === problem.pattern && isRlcCalculationAnswerCorrect(answer, problem.answer)',
  '計算方法は「${rlcCalculationLabels[problem.pattern]}」、正解は ${formatRlcCalculationAnswer(problem.answer)} ${problem.unit} です。',
  '<span className="ml-2 font-bold">{problem.unit}</span>',
]) {
  if (!page.includes(requirement)) throw new Error(`RLC calculation drill UI is missing required behavior: ${requirement}`);
}
if (!page.includes('実戦練習：交流回路 全パターンランダム') || !page.includes("mode === 'mix' ?")
  || !page.includes('基礎練習：{rlcCalculationLabels[mode]}に固定して繰り返します。')) {
  throw new Error('RLC drill must offer both method-specific practice and mixed method selection');
}
if (!learningPortal.includes("practiceLink: '/learn/physics/ac-circuit-drill'")
  || !drillPortal.includes("link: '/learn/physics/ac-circuit-drill'")) {
  throw new Error('RLC visual and drill must both be linked from their portals');
}

const stableRandom = (() => {
  let state = 0x6d2b79f5;
  return () => {
    state = Math.imul(state ^ (state >>> 15), state | 1);
    state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
})();

function expectedAnswer(problem) {
  const { resistance: r, inductance: l, capacitanceMicrofarads: cMicro, frequency: f, voltagePeak: v } = problem.input;
  const c = cMicro * 1e-6;
  const xl = 2 * Math.PI * f * l;
  const xc = 1 / (2 * Math.PI * f * c);
  switch (problem.pattern) {
    case 'inductiveReactance': return xl;
    case 'capacitiveReactance': return xc;
    case 'impedance': return Math.hypot(r, xl - xc);
    case 'current': return v / Math.hypot(r, xl - xc);
    case 'resonanceFrequency': return 1 / (2 * Math.PI * Math.sqrt(l * c));
  }
}

for (const pattern of rlcCalculationPatterns) {
  for (let i = 0; i < 800; i += 1) {
    const problem = generateRlcCalculationProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || Math.abs(problem.answer - expectedAnswer(problem)) > 1e-10 || !problem.explanation.includes(formatRlcCalculationAnswer(problem.answer))) {
      throw new Error(`formula, answer, or explanation mismatch for ${pattern}: ${JSON.stringify(problem)}`);
    }
  }
}

const mixed = Array.from({ length: 1000 }, () => generateRlcCalculationProblem('mix', stableRandom));
for (let start = 0; start < mixed.length; start += rlcCalculationPatterns.length) {
  if (new Set(mixed.slice(start, start + rlcCalculationPatterns.length).map(problem => problem.pattern)).size !== rlcCalculationPatterns.length) {
    throw new Error(`mixed set omitted an RLC pattern in batch ${start / rlcCalculationPatterns.length}`);
  }
}
if (mixed.some((problem, index) => index > 0 && problem.pattern === mixed[index - 1].pattern)) {
  throw new Error('mixed RLC practice repeated adjacent patterns');
}
if (!isRlcCalculationAnswerCorrect(formatRlcCalculationAnswer(2 / 3), 2 / 3)
  || isRlcCalculationAnswerCorrect('0.66', 2 / 3)
  || isRlcCalculationAnswerCorrect('', 1)
  || isRlcCalculationAnswerCorrect('Infinity', 1)) {
  throw new Error('RLC answer validation must accept displayed rounding and reject empty, coarse, and non-finite values');
}

console.log('RLC calculation drill verified: 4,000 fixed and 1,000 mixed questions; reactance, impedance, current, resonance, answer formatting, balanced coverage, and portal links checked.');
