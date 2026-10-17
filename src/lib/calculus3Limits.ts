import { BalancedRandom } from './balancedRandom.ts';

export type LimitPattern = 'factor' | 'rationalize' | 'dominant' | 'squeeze' | 'sequence';
export type LimitMode = LimitPattern | 'mix';
export type LimitProblem = { pattern: LimitPattern; expression: string; answer: string; explanation: string };

export const limitPatterns: readonly LimitPattern[] = ['factor', 'rationalize', 'dominant', 'squeeze', 'sequence'];
export const limitLabels: Record<LimitPattern, string> = {
  factor: '因数分解・約分', rationalize: '有理化', dominant: '最高次の比較', squeeze: 'はさみうち', sequence: '数列の極限',
};

const picker = new BalancedRandom(limitPatterns);
const leadingCoefficientPairs = [
  { a: 1, c: 1 }, { a: 2, c: 1 }, { a: 3, c: 2 }, { a: 4, c: 3 },
  { a: 5, c: 2 }, { a: 3, c: 4 }, { a: 5, c: 3 }, { a: 6, c: 5 }, { a: 7, c: 4 },
];
const variants = {
  factor: new BalancedRandom([2, 3, 4, 5, 6, 7, 8]),
  rationalize: new BalancedRandom([1, 2, 3, 4, 5, 6, 8, 10]),
  dominant: new BalancedRandom(leadingCoefficientPairs),
  squeeze: new BalancedRandom([1, 2, 3, 4, 5]),
  sequence: new BalancedRandom(leadingCoefficientPairs),
};

export function generateLimitProblem(mode: LimitMode, random = Math.random): LimitProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const factorPoint = pattern === 'factor' ? variants.factor.next(random) : 2;
  const radicalCoefficient = pattern === 'rationalize' ? variants.rationalize.next(random) : 1;
  const dominant = pattern === 'dominant' ? variants.dominant.next(random) : { a: 1, c: 1 };
  const squeezeCoefficient = pattern === 'squeeze' ? variants.squeeze.next(random) : 1;
  const sequence = pattern === 'sequence' ? variants.sequence.next(random) : { a: 1, c: 1 };
  const all: Record<LimitPattern, LimitProblem> = {
    factor: { pattern, expression: `\\lim_{x\\to ${factorPoint}}\\frac{x^2-${factorPoint ** 2}}{x-${factorPoint}}`, answer: String(2 * factorPoint), explanation: `分子を (x−${factorPoint})(x+${factorPoint}) と因数分解して約分する。極限値は ${2 * factorPoint}。` },
    rationalize: { pattern, expression: `\\lim_{x\\to 0}\\frac{\\sqrt{1+${radicalCoefficient}x}-1}{x}`, answer: String(radicalCoefficient / 2), explanation: `分子の共役を掛けると ${radicalCoefficient}/(√(1+${radicalCoefficient}x)+1) となり、極限値は ${radicalCoefficient / 2}。` },
    dominant: { pattern, expression: `\\lim_{x\\to\\infty}\\frac{${dominant.a}x^2-x+1}{${dominant.c}x^2+4}`, answer: String(dominant.a / dominant.c), explanation: `分子・分母をx²で割り、最高次係数の比 ${dominant.a}/${dominant.c} を得る。` },
    squeeze: { pattern, expression: `\\lim_{x\\to 0}x\\sin\\frac{${squeezeCoefficient}}{x}`, answer: '0', explanation: `−|x|≤x sin(${squeezeCoefficient}/x)≤|x| とはさめ、両端が0へ近づくことを使う。` },
    sequence: { pattern, expression: `\\lim_{n\\to\\infty}\\left(\\frac{${sequence.a}n+1}{${sequence.c}n+2}\\right)`, answer: String(sequence.a / sequence.c), explanation: `分子・分母をnで割ると、最高次係数の比 ${sequence.a}/${sequence.c} が残る。` },
  };
  return all[pattern];
}
