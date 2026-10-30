import { BalancedRandom } from './balancedRandom.ts';

export type LimitPattern = 'factor' | 'rationalize' | 'dominant' | 'squeeze' | 'sequence' | 'exponentialSequence' | 'trigonometric' | 'tangent' | 'sineRatio' | 'continuity';
export type LimitMode = LimitPattern | 'mix';
export type LimitProblem = { pattern: LimitPattern; expression: string; answer: string; explanation: string };
type SequenceVariant =
  | { kind: 'linear-ratio'; a: number; c: number }
  | { kind: 'quadratic-ratio'; a: number; c: number }
  | { kind: 'radical-difference'; a: number };

export const limitPatterns: readonly LimitPattern[] = ['factor', 'rationalize', 'dominant', 'squeeze', 'sequence', 'exponentialSequence', 'trigonometric', 'tangent', 'sineRatio', 'continuity'];
export const limitLabels: Record<LimitPattern, string> = {
  factor: '因数分解・約分', rationalize: '有理化', dominant: '最高次の比較', squeeze: 'はさみうち', sequence: '数列の極限',
  exponentialSequence: '指数型数列の極限',
  trigonometric: 'sin(kx)/x 型', tangent: 'tan(kx)/x 型', sineRatio: 'sin(ax)/sin(bx) 型', continuity: '連続条件',
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
  sequence: new BalancedRandom<SequenceVariant>([
    ...leadingCoefficientPairs.map(({ a, c }) => ({ kind: 'linear-ratio' as const, a, c })),
    ...leadingCoefficientPairs.map(({ a, c }) => ({ kind: 'quadratic-ratio' as const, a, c })),
    ...Array.from({ length: 9 }, (_, index) => ({ kind: 'radical-difference' as const, a: index + 1 })),
  ]),
  exponentialSequence: new BalancedRandom([1, 2, 3]),
  trigonometric: new BalancedRandom([1, 2, 3, 4, 5]),
  tangent: new BalancedRandom([1, 2, 3, 4, 5]),
  sineRatio: new BalancedRandom([{ a: 1, b: 1 }, { a: 2, b: 1 }, { a: 3, b: 2 }, { a: 4, b: 3 }, { a: 5, b: 2 }]),
  continuity: new BalancedRandom([1, 2, 3, 4, 5]),
};

export function generateLimitProblem(mode: LimitMode, random = Math.random): LimitProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const factorPoint = pattern === 'factor' ? variants.factor.next(random) : 2;
  const radicalCoefficient = pattern === 'rationalize' ? variants.rationalize.next(random) : 1;
  const dominant = pattern === 'dominant' ? variants.dominant.next(random) : { a: 1, c: 1 };
  const squeezeCoefficient = pattern === 'squeeze' ? variants.squeeze.next(random) : 1;
  const sequence = pattern === 'sequence' ? variants.sequence.next(random) : { kind: 'linear-ratio' as const, a: 1, c: 1 };
  const exponentialCoefficient = pattern === 'exponentialSequence' ? variants.exponentialSequence.next(random) : 1;
  const trigCoefficient = pattern === 'trigonometric' ? variants.trigonometric.next(random) : 1;
  const trigArgument = trigCoefficient === 1 ? 'x' : `${trigCoefficient}x`;
  const tangentCoefficient = pattern === 'tangent' ? variants.tangent.next(random) : 1;
  const tangentArgument = tangentCoefficient === 1 ? 'x' : `${tangentCoefficient}x`;
  const sineRatio = pattern === 'sineRatio' ? variants.sineRatio.next(random) : { a: 1, b: 1 };
  const sineNumeratorArgument = sineRatio.a === 1 ? 'x' : `${sineRatio.a}x`;
  const sineDenominatorArgument = sineRatio.b === 1 ? 'x' : `${sineRatio.b}x`;
  const continuityPoint = pattern === 'continuity' ? variants.continuity.next(random) : 1;
  const radicalTerm = radicalCoefficient === 1 ? 'x' : `${radicalCoefficient}x`;
  const sequenceC = 'c' in sequence ? sequence.c : 1;
  const dominantNumerator = dominant.a === 1 ? 'x^2' : `${dominant.a}x^2`;
  const dominantDenominator = dominant.c === 1 ? 'x^2' : `${dominant.c}x^2`;
  const sequenceNumerator = sequence.a === 1 ? 'n' : `${sequence.a}n`;
  const sequenceDenominator = sequenceC === 1 ? 'n' : `${sequenceC}n`;
  const sequenceNumeratorQuadratic = sequence.a === 1 ? 'n^2' : `${sequence.a}n^2`;
  const sequenceDenominatorQuadratic = sequenceC === 1 ? 'n^2' : `${sequenceC}n^2`;
  const sequenceProblem: LimitProblem = sequence.kind === 'linear-ratio'
    ? {
      pattern,
      expression: `\\lim_{n\\to\\infty}\\left(\\frac{${sequenceNumerator}+1}{${sequenceDenominator}+2}\\right)`,
      answer: String(sequence.a / sequenceC),
      explanation: `分子・分母をnで割ると、最高次係数の比 ${sequence.a}/${sequenceC} が残る。`,
    }
    : sequence.kind === 'quadratic-ratio'
      ? {
        pattern,
        expression: `\\lim_{n\\to\\infty}\\left(\\frac{${sequenceNumeratorQuadratic}+n}{${sequenceDenominatorQuadratic}+2}\\right)`,
        answer: String(sequence.a / sequenceC),
        explanation: `分子・分母をn²で割ると、低次の項は0に近づき、最高次係数の比 ${sequence.a}/${sequenceC} が残る。`,
      }
      : {
        pattern,
        expression: `\\lim_{n\\to\\infty}(\\sqrt{n^2+${sequence.a}n}-n)`,
        answer: String(sequence.a / 2),
        explanation: `共役な式を掛けると ${sequence.a}n/(√(n²+${sequence.a}n)+n)=${sequence.a}/(√(1+${sequence.a}/n)+1)。n→∞で分母は2に近づくので、極限値は ${sequence.a}/2。`,
      };
  const all: Record<LimitPattern, LimitProblem> = {
    factor: { pattern, expression: `\\lim_{x\\to ${factorPoint}}\\frac{x^2-${factorPoint ** 2}}{x-${factorPoint}}`, answer: String(2 * factorPoint), explanation: `分子を (x−${factorPoint})(x+${factorPoint}) と因数分解して約分する。極限値は ${2 * factorPoint}。` },
    rationalize: { pattern, expression: `\\lim_{x\\to 0}\\frac{\\sqrt{1+${radicalTerm}}-1}{x}`, answer: String(radicalCoefficient / 2), explanation: `分子の共役を掛けると ${radicalCoefficient}/(√(1+${radicalTerm})+1) となり、極限値は ${radicalCoefficient / 2}。` },
    dominant: { pattern, expression: `\\lim_{x\\to\\infty}\\frac{${dominantNumerator}-x+1}{${dominantDenominator}+4}`, answer: String(dominant.a / dominant.c), explanation: `分子・分母をx²で割り、最高次係数の比 ${dominant.a}/${dominant.c} を得る。` },
    squeeze: { pattern, expression: `\\lim_{x\\to 0}x\\sin\\frac{${squeezeCoefficient}}{x}`, answer: '0', explanation: `−|x|≤x sin(${squeezeCoefficient}/x)≤|x| とはさめ、両端が0へ近づくことを使う。` },
    sequence: sequenceProblem,
    exponentialSequence: {
      pattern,
      expression: `\\lim_{n\\to\\infty}\\left(1+\\frac{${exponentialCoefficient}}{n}\\right)^n`,
      answer: String(Math.exp(exponentialCoefficient)),
      explanation: `基本極限 (1+1/m)^m→e を使う。u=${exponentialCoefficient}/n とおくと (1+${exponentialCoefficient}/n)^n=[(1+u)^(1/u)]^${exponentialCoefficient}。u→0+ で (1+u)^(1/u)→e だから、極限値は e^${exponentialCoefficient}≈${Math.exp(exponentialCoefficient).toFixed(3)}。`,
    },
    trigonometric: { pattern, expression: `\\lim_{x\\to 0}\\frac{\\sin(${trigArgument})}{x},\\quad \\text{（x はラジアン）}`, answer: String(trigCoefficient), explanation: `xはラジアンで考える。u=${trigArgument} と置くと sin(${trigArgument})/x=${trigCoefficient}·sin u/u。基本極限 lim(u→0) sin u/u=1 より、極限値は ${trigCoefficient}。` },
    tangent: { pattern, expression: `\\lim_{x\\to 0}\\frac{\\tan(${tangentArgument})}{x},\\quad \\text{（x はラジアン）}`, answer: String(tangentCoefficient), explanation: `xはラジアンで考える。u=${tangentArgument} と置くと tan(${tangentArgument})/x=${tangentCoefficient}·tan u/u。基本極限 lim(u→0) tan u/u=1 より、極限値は ${tangentCoefficient}。` },
    sineRatio: { pattern, expression: `\\lim_{x\\to 0}\\frac{\\sin(${sineNumeratorArgument})}{\\sin(${sineDenominatorArgument})},\\quad \\text{（x はラジアン）}`, answer: String(sineRatio.a / sineRatio.b), explanation: `xはラジアンで考える。sin(${sineNumeratorArgument})/sin(${sineDenominatorArgument})=(${sineRatio.a}/${sineRatio.b})·[sin(${sineNumeratorArgument})/${sineNumeratorArgument}]/[sin(${sineDenominatorArgument})/${sineDenominatorArgument}] と変形する。各 sin u/u は1に近づくので、極限値は ${sineRatio.a}/${sineRatio.b}。` },
    continuity: { pattern, expression: `f(x)=\\begin{cases}\\frac{x^2-${continuityPoint ** 2}}{x-${continuityPoint}} & (x\\ne ${continuityPoint})\\\\ k & (x=${continuityPoint})\\end{cases},\\quad x=${continuityPoint}\\text{ で連続となる }k`, answer: String(2 * continuityPoint), explanation: `x≠${continuityPoint}では (x²−${continuityPoint ** 2})/(x−${continuityPoint})=x+${continuityPoint}。したがって x→${continuityPoint} の極限は ${2 * continuityPoint}。連続条件「極限値=f(${continuityPoint})=k」から k=${2 * continuityPoint}。` },
  };
  return all[pattern];
}
