import { generateEuclideanProblem, getEuclideanSteps } from '../src/lib/euclideanAlgorithm.ts';
import fs from 'node:fs';

const drillPage = fs.readFileSync('src/app/learn/math/euclidean-algorithm-drill/page.tsx', 'utf8');
for (const pattern of ['pattern1', 'pattern2', 'pattern3', 'pattern4']) {
  if (!drillPage.includes(`<option value="${pattern}">`)) throw new Error(`${pattern} must remain independently selectable`);
}
if (!drillPage.includes('<option value="mix">')) throw new Error('Mixed practice must remain selectable');
if (!drillPage.includes('aria-label="互除法ドリルの出題パターン"')) throw new Error('Pattern selector must have an accessible name');
if (!drillPage.includes('aria-label="最大公約数の答え"')) throw new Error('Answer field must have an accessible name');
if (!drillPage.includes('role="img"') || !drillPage.includes('aria-label={`ユークリッドの互除法の図。')) throw new Error('Diagram must describe the current operands to assistive technology');

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
let seed = 0x4e71d;
const seededRandom = () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function verifyProblem(problem, expectedPattern) {
  if (problem.pattern !== expectedPattern) throw new Error(`Expected ${expectedPattern}, got ${problem.pattern}`);
  if (!(problem.A >= problem.B && problem.B > 0)) throw new Error(`Invalid operand bounds: ${problem.A}, ${problem.B}`);
  if (problem.ans !== gcd(problem.A, problem.B) || problem.ans < 1) {
    throw new Error(`Incorrect GCD for ${problem.A}, ${problem.B}: ${problem.ans}`);
  }

  const steps = getEuclideanSteps(problem.A, problem.B);
  if (JSON.stringify(problem.steps) !== JSON.stringify(steps)) throw new Error('Displayed division steps differ from the generated operands');
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    if (step.a !== step.b * step.q + step.r || step.r < 0 || step.r >= step.b) {
      throw new Error(`Invalid division at step ${index}: ${JSON.stringify(step)}`);
    }
    if (index + 1 < steps.length && (steps[index + 1].a !== step.b || steps[index + 1].b !== step.r)) {
      throw new Error(`Broken Euclidean chain at step ${index}`);
    }
  }
  const lastStep = steps.at(-1);
  if (lastStep?.r !== 0 || lastStep.b !== problem.ans) throw new Error('The final nonzero divisor must be the GCD');

  const meetsPattern =
    (expectedPattern === 'pattern1' && steps.length <= 2)
    || (expectedPattern === 'pattern2' && steps.length >= 3)
    || (expectedPattern === 'pattern3' && problem.ans === 1 && steps.length >= 2)
    || (expectedPattern === 'pattern4' && steps.length >= 4);
  if (!meetsPattern) throw new Error(`${expectedPattern} produced a question outside its stated pattern`);
}

for (const pattern of patterns) {
  for (let index = 0; index < 1_000; index += 1) {
    verifyProblem(generateEuclideanProblem(pattern, seededRandom), pattern);
  }
}

const mixed = Array.from({ length: 4_000 }, () => generateEuclideanProblem('mix', seededRandom));
for (let start = 0; start < mixed.length; start += patterns.length) {
  const batch = mixed.slice(start, start + patterns.length).map(problem => problem.pattern);
  if (new Set(batch).size !== patterns.length) throw new Error(`Mixed batch ${start / patterns.length} omitted a pattern`);
}
for (let index = 0; index < mixed.length; index += 1) {
  verifyProblem(mixed[index], mixed[index].pattern);
  if (index > 0 && mixed[index].pattern === mixed[index - 1].pattern) throw new Error(`Adjacent pattern repeat at ${index}`);
}

console.log('Euclidean algorithm verified: 4,000 fixed and 4,000 mixed problems, division steps, GCD answer keys, all four pattern constraints, balance, and adjacency.');
