import { BalancedRandom } from './balancedRandom.ts';

export const symmetricPolynomialPatterns = ['x2+y2', 'x3+y3', 'x2y+xy2'] as const;
export type SymmetricPolynomialPattern = (typeof symmetricPolynomialPatterns)[number];
export type SymmetricPolynomialMode = 'mix' | SymmetricPolynomialPattern;

export interface SymmetricPolynomialProblem {
  sum: number;
  product: number;
  pattern: SymmetricPolynomialPattern;
  answer: number;
}

const mixedPatternPicker = new BalancedRandom<SymmetricPolynomialPattern>(symmetricPolynomialPatterns);

export function generateSymmetricPolynomialProblem(
  mode: SymmetricPolynomialMode = 'mix',
  random: () => number = Math.random,
): SymmetricPolynomialProblem {
  let sum: number;
  let product: number;
  do {
    sum = Math.floor(random() * 11) - 5;
    product = Math.floor(random() * 11) - 5;
  } while (sum === 0 || product === 0 || sum * sum - 4 * product < 0);

  const pattern = mode === 'mix' ? mixedPatternPicker.next(random) : mode;
  const answer = pattern === 'x2+y2'
    ? sum * sum - 2 * product
    : pattern === 'x3+y3'
      ? sum * sum * sum - 3 * sum * product
      : sum * product;

  return { sum, product, pattern, answer };
}

export function parseSymmetricPolynomialAnswer(value: string): number | null {
  const normalized = value.trim();
  if (!/^[+-]?\d+$/.test(normalized)) return null;
  const answer = Number(normalized);
  return Number.isSafeInteger(answer) ? answer : null;
}

export function checkSymmetricPolynomialAnswer(problem: SymmetricPolynomialProblem, answer: number): boolean {
  return Number.isSafeInteger(answer) && answer === problem.answer;
}
