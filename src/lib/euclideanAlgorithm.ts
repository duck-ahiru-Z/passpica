import { BalancedRandom } from './balancedRandom.ts';

export type EuclideanPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type EuclideanMode = EuclideanPattern | 'mix';

export interface EuclideanStep {
  a: number;
  b: number;
  q: number;
  r: number;
}

export interface EuclideanProblem {
  pattern: EuclideanPattern;
  A: number;
  B: number;
  steps: EuclideanStep[];
  ans: number;
}

const patterns: readonly EuclideanPattern[] = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
const mixedPatternPicker = new BalancedRandom(patterns);

export function getEuclideanSteps(a: number, b: number): EuclideanStep[] {
  const steps: EuclideanStep[] = [];
  let currentA = a;
  let currentB = b;
  while (currentB > 0) {
    const q = Math.floor(currentA / currentB);
    const r = currentA % currentB;
    steps.push({ a: currentA, b: currentB, q, r });
    currentA = currentB;
    currentB = r;
  }
  return steps;
}

function getGreatestCommonDivisor(a: number, b: number): number {
  let currentA = a;
  let currentB = b;
  while (currentB !== 0) {
    [currentA, currentB] = [currentB, currentA % currentB];
  }
  return currentA;
}

export function generateEuclideanProblem(
  selectedPattern: EuclideanMode,
  random: () => number = Math.random,
): EuclideanProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;

  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    let a: number;
    let b: number;
    if (pattern === 'pattern1') {
      a = Math.floor(random() * 80) + 20;
      b = Math.floor(random() * (a - 10)) + 10;
    } else if (pattern === 'pattern2') {
      a = Math.floor(random() * 800) + 150;
      b = Math.floor(random() * 80) + 20;
    } else if (pattern === 'pattern3') {
      a = Math.floor(random() * 800) + 150;
      b = Math.floor(random() * (a - 100)) + 100;
    } else {
      a = Math.floor(random() * 8000) + 1500;
      b = Math.floor(random() * (a - 500)) + 500;
    }

    const steps = getEuclideanSteps(a, b);
    const ans = getGreatestCommonDivisor(a, b);
    const matchesPattern =
      (pattern === 'pattern1' && steps.length <= 2)
      || (pattern === 'pattern2' && steps.length >= 3)
      || (pattern === 'pattern3' && ans === 1 && steps.length >= 2)
      || (pattern === 'pattern4' && steps.length >= 4);

    if (matchesPattern) return { pattern, A: a, B: b, steps, ans };
  }

  throw new Error(`Could not generate a valid Euclidean problem for ${pattern} after 10,000 attempts.`);
}
