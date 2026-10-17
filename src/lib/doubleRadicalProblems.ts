import { BalancedRandom } from './balancedRandom.ts';

export const doubleRadicalPatterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'] as const;
export type DoubleRadicalPattern = (typeof doubleRadicalPatterns)[number];
export type DoubleRadicalMode = DoubleRadicalPattern | 'mix';

export interface DoubleRadicalProblem {
  pattern: DoubleRadicalPattern;
  a: number;
  b: number;
  eq: string;
  sign: '+' | '-';
  sum: number;
  prod: number;
  k?: number;
  inner?: number;
  X?: number;
}

const mixedPatternPicker = new BalancedRandom<DoubleRadicalPattern>(doubleRadicalPatterns);
const randomInteger = (random: () => number, max: number) => Math.floor(random() * max) + 2;

function getSquareFactors(n: number): number[] {
  const factors = [];
  for (let k = 2; k * k <= n; k += 1) if (n % (k * k) === 0) factors.push(k);
  return factors;
}

export function generateDoubleRadicalProblem(mode: DoubleRadicalMode, random = Math.random): DoubleRadicalProblem {
  const pattern = mode === 'mix' ? mixedPatternPicker.next(random) : mode;
  while (true) {
    const a = randomInteger(random, 8);
    const b = randomInteger(random, 8);
    if (a <= b) continue;
    const sum = a + b;
    const prod = a * b;

    if (pattern === 'pattern1' || pattern === 'pattern2') {
      const sign = pattern === 'pattern1' ? '+' : '-';
      return { pattern, a, b, eq: `\\sqrt{${sum} ${sign} 2\\sqrt{${prod}}}`, sign, sum, prod };
    }
    if (pattern === 'pattern3') {
      const factors = getSquareFactors(prod);
      if (factors.length === 0) continue;
      const k = factors.at(-1)!;
      const inner = prod / (k * k);
      const sign = random() < 0.5 ? '+' : '-';
      return { pattern, a, b, eq: `\\sqrt{${sum} ${sign} ${2 * k}\\sqrt{${inner}}}`, sign, sum, prod, k, inner };
    }

    if (a % 2 === 0 || b % 2 === 0) continue;
    const X = sum / 2;
    const sign = random() < 0.5 ? '+' : '-';
    return { pattern, a, b, eq: `\\sqrt{${X} ${sign} \\sqrt{${prod}}}`, sign, sum, prod, X };
  }
}
