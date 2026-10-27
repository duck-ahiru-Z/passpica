import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type IntegralPattern = 'power-area' | 'substitution' | 'parts' | 'rational' | 'trig' | 'radical';
export type IntegralMode = IntegralPattern | 'mix';
export type IntegralProblem = { pattern: IntegralPattern; expression: string; answer: number; hint: string; explanation: string; alternativeStrategies?: Partial<Record<IntegralPattern, string>> };
type RationalVariant = { kind: 'linear' | 'repeated' | 'quadratic'; a: number; b: number };

export const integralPatterns: readonly IntegralPattern[] = ['power-area', 'substitution', 'parts', 'rational', 'trig', 'radical'];
export const integralLabels: Record<IntegralPattern, string> = {
  'power-area': 'べき関数の定積分・面積',
  substitution: '置換積分', parts: '部分積分', rational: '部分分数分解',
  trig: '三角関数の積分', radical: '三角置換（平方根）',
};

export function isIntegralAnswerCorrect(input: string, expected: number): boolean {
  return isNumericAnswerCorrect(input, expected, 3);
}

export function isIntegralStrategyValid(problem: IntegralProblem, strategy: IntegralPattern | ''): boolean {
  return strategy === problem.pattern || Boolean(strategy && problem.alternativeStrategies?.[strategy]);
}

export function getIntegralExplanation(problem: IntegralProblem, strategy: IntegralPattern | ''): string {
  return (strategy && problem.alternativeStrategies?.[strategy]) || problem.explanation;
}

const variants = {
  'power-area': new BalancedRandom([0.5, 1, 1.5, 2, 2.5]),
  substitution: new BalancedRandom([2, 3, 4, 5]),
  parts: new BalancedRandom([1, 2, 3]),
  rational: new BalancedRandom<RationalVariant>([
    ...Array.from({ length: 9 }, (_, index) => ({ kind: 'linear' as const, a: Math.floor(index / 3) + 1, b: (index % 3) + 1 })),
    ...Array.from({ length: 6 }, (_, index) => ({ kind: 'repeated' as const, a: Math.floor(index / 3) + 1, b: (index % 3) + 1 })),
    ...Array.from({ length: 6 }, (_, index) => ({ kind: 'quadratic' as const, a: Math.floor(index / 3) + 1, b: (index % 3) + 1 })),
  ]),
  trig: new BalancedRandom([3, 5, 7, 9]),
  radical: new BalancedRandom([2, 3, 4, 5, 6]),
};

export function createIntegralProblemPicker() {
  const patternPicker = new BalancedRandom(integralPatterns);
  return {
    next(mode: IntegralMode = 'mix', random = Math.random): IntegralProblem {
      return generateIntegralProblem(mode, random, patternPicker);
    },
  };
}

export function generateIntegralProblem(mode: IntegralMode, random = Math.random, patternPicker = new BalancedRandom(integralPatterns)): IntegralProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const power = pattern === 'substitution' ? variants.substitution.next(random) : 2;
  const rate = pattern === 'parts' ? variants.parts.next(random) : 1;
  const rational = pattern === 'rational' ? variants.rational.next(random) : { kind: 'linear' as const, a: 1, b: 1 };
  const { a: partialA, b: partialB } = rational;
  const oddPower = pattern === 'trig' ? variants.trig.next(random) : 3;
  const radius = pattern === 'radical' ? variants.radical.next(random) : 2;
  const areaUpper = pattern === 'power-area' ? variants['power-area'].next(random) : 2;
  const radicalUpper = radius % 2 === 0 ? String(radius / 2) : `\\frac{${radius}}{2}`;
  const radicalUpperText = radius % 2 === 0 ? String(radius / 2) : `${radius}/2`;
  const trigFactors = Array.from({ length: (oddPower - 1) / 2 }, (_, index) => `${oddPower - 1 - 2 * index}/${oddPower - 2 * index}`);
  const trigIntegral = trigFactors.reduce((value, factor) => {
    const [numerator, denominator] = factor.split('/').map(Number);
    return value * numerator / denominator;
  }, 1);
  const trigExplanation = `I_n=∫₀^{π/2}sinⁿx dx とすると、部分積分から I_n=(n−1)/n・I_{n−2}、I₁=1。したがって I_${oddPower}=${trigFactors.join('×')}=${trigIntegral.toFixed(3)}。`;
  const partsExplanation = rate === 1
    ? '部分積分で [xeˣ−eˣ]₀¹ = e−(e−1)=1 ≈ 1.000。'
    : `部分積分で [xe^(${rate}x)/${rate}−e^(${rate}x)/${rate}²]₀¹ = e^${rate}/${rate}−(e^${rate}−1)/${rate}² = (${rate}e^${rate}−e^${rate}+1)/${rate}² ≈ ${((Math.exp(rate) * (rate - 1) + 1) / rate ** 2).toFixed(3)}。`;
  const logTerm = (coefficient: number, argument: string) => `${coefficient === 1 ? '' : `${coefficient} `}ln ${argument}`;
  const rationalNumeratorX = rational.kind === 'linear' ? partialA + partialB : partialA;
  const rationalNumeratorConstant = rational.kind === 'linear' ? 2 * partialA + partialB : rational.kind === 'repeated' ? partialA + partialB : partialB;
  const problems: Record<IntegralPattern, IntegralProblem> = {
    'power-area': { pattern, expression: `\\int_0^{${areaUpper}} x^2\\,dx`, answer: areaUpper ** 3 / 3, hint: 'べき関数の積分公式を使い、上端と下端を代入する', explanation: `[x³/3]₀^${areaUpper} = ${areaUpper}³/3 = ${(areaUpper ** 3 / 3).toFixed(3)}。これはビジュアルで示す y=x² の区間 [0, ${areaUpper}] の正確な面積です。` },
    substitution: { pattern, expression: `\\int_0^1 2x(x^2+1)^{${power}}\\,dx`, answer: (2 ** (power + 1) - 1) / (power + 1), hint: '内側の式を u と置く', explanation: `u=x²+1 と置くと区間は1から2。積分値は (2^${power + 1}−1)/${power + 1}。` },
    parts: { pattern, expression: `\\int_0^1 x e^{${rate === 1 ? 'x' : `${rate}x`}}\\,dx`, answer: (Math.exp(rate) * (rate - 1) + 1) / rate ** 2, hint: '多項式 × 指数関数', explanation: partsExplanation },
    rational: rational.kind === 'linear'
      ? { pattern, expression: `\\int_0^1 \\frac{${rationalNumeratorX}x+${rationalNumeratorConstant}}{(x+1)(x+2)}\\,dx`, answer: partialA * Math.log(2) + partialB * Math.log(1.5), hint: '分母を異なる一次式の積に分ける', explanation: `部分分数分解すると ${partialA}/(x+1)+${partialB}/(x+2)。積分値は ${logTerm(partialA, '2')} + ${logTerm(partialB, '(3/2)')}。` }
      : rational.kind === 'repeated'
        ? { pattern, expression: `\\int_0^1 \\frac{${rationalNumeratorX}x+${rationalNumeratorConstant}}{(x+1)^2}\\,dx`, answer: partialA * Math.log(2) + partialB / 2, hint: '重解では A/(x+1)+B/(x+1)² と置く', explanation: `部分分数分解すると ${partialA}/(x+1)+${partialB}/(x+1)²。積分値は ${logTerm(partialA, '2')} + ${partialB}/2。` }
      : { pattern, expression: `\\int_0^1 \\frac{${rationalNumeratorX}x+${rationalNumeratorConstant}}{x^2+1}\\,dx`, answer: partialA * Math.log(2) / 2 + partialB * Math.PI / 4, hint: '既約二次式には (Ax+B)/(x²+1) の形を使う', explanation: `分子を ${partialA}x+${partialB} と分ける。${partialA}x/(x²+1) は対数置換、${partialB}/(x²+1) は arctan 積分なので、値は ${partialA}/2 ln 2 + ${partialB}π/4。` },
    trig: { pattern, expression: `\\int_0^{\\pi/2} \\sin^{${oddPower}} x\\,dx`, answer: trigIntegral, hint: 'sin x を1つ残して cos x に置換し、残りを整理', explanation: trigExplanation,
      alternativeStrategies: { substitution: `u=cos x と置くと、sin^${oddPower}x dx=−(1−u²)^${(oddPower - 1) / 2}du。区間は x=0 で u=1、x=π/2 で u=0 なので、積分は ∫₀¹(1−u²)^${(oddPower - 1) / 2}du=${trigIntegral.toFixed(3)}。` } },
    radical: {
      pattern,
      expression: `\\int_0^{${radicalUpper}} \\sqrt{${radius}^2-x^2}\\,dx`,
      answer: radius ** 2 * (Math.PI / 12 + Math.sqrt(3) / 8),
      hint: 'x=R sin θ と置き、上端が R/2 のとき sin θ=1/2 となる角を考える',
      explanation: `x=${radius} sin θ と置く。x=0ならθ=0、x=${radicalUpperText}なら sin θ=1/2 より θ=π/6。√(${radius}²−x²)=${radius} cos θ、dx=${radius} cos θ dθ なので、${radius}²∫₀^{π/6}cos²θ dθ=${radius}²(π/12+√3/8)≈${(radius ** 2 * (Math.PI / 12 + Math.sqrt(3) / 8)).toFixed(3)}。`,
    },
  };
  return problems[pattern];
}
