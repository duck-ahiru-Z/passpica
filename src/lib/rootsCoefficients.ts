import { BalancedRandom } from './balancedRandom.ts';

export type RootsCoefficientsPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type RootsCoefficientsMode = RootsCoefficientsPattern | 'mix';

export interface RootsCoefficientsProblem {
  pattern: RootsCoefficientsPattern;
  a: number;
  b: number;
  c: number;
  ansNum: number;
  ansDen: number;
  questionText: string;
}

const patterns: readonly RootsCoefficientsPattern[] = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];

function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) [x, y] = [y, x % y];
  return x;
}

function getRand(random: () => number, min: number, max: number, nonZero = true): number {
  const excludesZero = nonZero && min <= 0 && max >= 0;
  const choices = max - min + 1 - Number(excludesZero);
  const sample = random();
  const normalized = Number.isFinite(sample)
    ? Math.min(1 - Number.EPSILON, Math.max(0, sample))
    : 0;
  const index = Math.floor(normalized * choices);
  const value = min + index;
  // Map the compact index around zero instead of retrying. This guarantees
  // progress even when a deterministic random source keeps returning the
  // exact bucket that would otherwise produce zero forever.
  return excludesZero && value >= 0 ? value + 1 : value;
}

export function createRootsCoefficientsProblemPicker() {
  const mixedPatternPicker = new BalancedRandom(patterns);

  return function generateProblem(selectedPattern: RootsCoefficientsMode, random = Math.random): RootsCoefficientsProblem {
    const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;

    while (true) {
      let a = getRand(random, -4, 4);
      const b = getRand(random, -5, 5, false);
      const c = getRand(random, -5, 5);

      if (pattern === 'pattern2') a = 1;
      if (pattern === 'pattern3' && c === 0) continue;

      let numerator = 0;
      let denominator = 1;
      let questionText = '';

      if (pattern === 'pattern1') {
        numerator = b * b - 2 * a * c;
        denominator = a * a;
        questionText = '\\alpha^2 + \\beta^2';
      } else if (pattern === 'pattern2') {
        numerator = -b * b * b + 3 * a * b * c;
        denominator = a * a * a;
        questionText = '\\alpha^3 + \\beta^3';
      } else if (pattern === 'pattern3') {
        if (random() > 0.5) {
          numerator = -b;
          denominator = c;
          questionText = '\\frac{1}{\\alpha} + \\frac{1}{\\beta}';
        } else {
          numerator = b * b - 2 * a * c;
          denominator = a * c;
          questionText = '\\frac{\\beta}{\\alpha} + \\frac{\\alpha}{\\beta}';
        }
      } else {
        numerator = b * b - 4 * a * c;
        denominator = a * a;
        questionText = '(\\alpha - \\beta)^2';
      }

      const divisor = gcd(numerator, denominator);
      numerator /= divisor;
      denominator /= divisor;
      if (denominator < 0) {
        numerator = -numerator;
        denominator = -denominator;
      }

      return { pattern, a, b, c, ansNum: numerator, ansDen: denominator, questionText };
    }
  };
}

const defaultPicker = createRootsCoefficientsProblemPicker();

export function generateRootsCoefficientsProblem(mode: RootsCoefficientsMode, random = Math.random): RootsCoefficientsProblem {
  return defaultPicker(mode, random);
}
