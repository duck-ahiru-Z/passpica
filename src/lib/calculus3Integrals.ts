import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type IntegralPattern = 'power' | 'substitution' | 'parts' | 'rational' | 'trig' | 'radical';
export type IntegralMode = IntegralPattern | 'mix';
export type IntegralProblem = { pattern: IntegralPattern; expression: string; answer: number; hint: string; explanation: string };

export const integralPatterns: readonly IntegralPattern[] = ['power', 'substitution', 'parts', 'rational', 'trig', 'radical'];
export const integralLabels: Record<IntegralPattern, string> = {
  power: 'べき関数の定積分・面積',
  substitution: '置換積分', parts: '部分積分', rational: '部分分数分解',
  trig: '三角関数の積分', radical: '三角置換（平方根）',
};

export function isIntegralAnswerCorrect(input: string, expected: number): boolean {
  return isNumericAnswerCorrect(input, expected, 3);
}

const picker = new BalancedRandom(integralPatterns);
const variants = {
  power: new BalancedRandom([2, 3, 4, 5, 6]),
  substitution: new BalancedRandom([2, 3, 4, 5]),
  parts: new BalancedRandom([1, 2, 3]),
  rational: new BalancedRandom(Array.from({ length: 9 }, (_, index) => ({ a: Math.floor(index / 3) + 1, b: (index % 3) + 1 }))),
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

export function generateIntegralProblem(mode: IntegralMode, random = Math.random, patternPicker = picker): IntegralProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const power = pattern === 'substitution' ? variants.substitution.next(random) : 2;
  const rate = pattern === 'parts' ? variants.parts.next(random) : 1;
  const { a: partialA, b: partialB } = pattern === 'rational' ? variants.rational.next(random) : { a: 1, b: 1 };
  const oddPower = pattern === 'trig' ? variants.trig.next(random) : 3;
  const radius = pattern === 'radical' ? variants.radical.next(random) : 2;
  const powerIntegral = pattern === 'power' ? variants.power.next(random) : 2;
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
  const rationalNumeratorX = partialA + partialB;
  const rationalNumeratorConstant = 2 * partialA + partialB;
  const problems: Record<IntegralPattern, IntegralProblem> = {
    power: { pattern, expression: `\\int_0^1 x^{${powerIntegral}}\\,dx`, answer: 1 / (powerIntegral + 1), hint: 'べき関数の積分公式', explanation: `\\int x^{${powerIntegral}}dx=\\frac{x^{${powerIntegral + 1}}}{${powerIntegral + 1}}。したがって [\\frac{x^{${powerIntegral + 1}}}{${powerIntegral + 1}}]_0^1=\\frac{1}{${powerIntegral + 1}}\\approx ${(1 / (powerIntegral + 1)).toFixed(3)}。` },
    substitution: { pattern, expression: `\\int_0^1 2x(x^2+1)^{${power}}\\,dx`, answer: (2 ** (power + 1) - 1) / (power + 1), hint: '内側の式を u と置く', explanation: `u=x²+1 と置くと区間は1から2。積分値は (2^${power + 1}−1)/${power + 1}。` },
    parts: { pattern, expression: `\\int_0^1 x e^{${rate === 1 ? 'x' : `${rate}x`}}\\,dx`, answer: (Math.exp(rate) * (rate - 1) + 1) / rate ** 2, hint: '多項式 × 指数関数', explanation: partsExplanation },
    rational: { pattern, expression: `\\int_0^1 \\frac{${rationalNumeratorX}x+${rationalNumeratorConstant}}{(x+1)(x+2)}\\,dx`, answer: partialA * Math.log(2) + partialB * Math.log(1.5), hint: '分母を一次式の積に分ける', explanation: `部分分数分解すると ${partialA}/(x+1)+${partialB}/(x+2)。積分値は ${logTerm(partialA, '2')} + ${logTerm(partialB, '(3/2)')}。` },
    trig: { pattern, expression: `\\int_0^{\\pi/2} \\sin^{${oddPower}} x\\,dx`, answer: trigIntegral, hint: 'sin x を1つ残して cos x に置換し、残りを整理', explanation: trigExplanation },
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
