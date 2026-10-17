import { BalancedRandom } from './balancedRandom.ts';

export type IntegralPattern = 'substitution' | 'parts' | 'rational' | 'trig' | 'radical';
export type IntegralMode = IntegralPattern | 'mix';
export type IntegralProblem = { pattern: IntegralPattern; expression: string; answer: number; hint: string; explanation: string };

export const integralPatterns: readonly IntegralPattern[] = ['substitution', 'parts', 'rational', 'trig', 'radical'];
export const integralLabels: Record<IntegralPattern, string> = {
  substitution: '置換積分', parts: '部分積分', rational: '部分分数分解',
  trig: '三角関数の積分', radical: '三角置換（平方根）',
};

const picker = new BalancedRandom(integralPatterns);
const variants = {
  substitution: new BalancedRandom([2, 3, 4, 5]),
  parts: new BalancedRandom([1, 2, 3]),
  rational: new BalancedRandom(Array.from({ length: 9 }, (_, index) => ({ a: Math.floor(index / 3) + 1, b: (index % 3) + 1 }))),
  trig: new BalancedRandom([3, 5, 7, 9]),
  radical: new BalancedRandom([2, 3, 4, 5, 6]),
};

export function generateIntegralProblem(mode: IntegralMode, random = Math.random): IntegralProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const power = pattern === 'substitution' ? variants.substitution.next(random) : 2;
  const rate = pattern === 'parts' ? variants.parts.next(random) : 1;
  const { a: partialA, b: partialB } = pattern === 'rational' ? variants.rational.next(random) : { a: 1, b: 1 };
  const oddPower = pattern === 'trig' ? variants.trig.next(random) : 3;
  const radius = pattern === 'radical' ? variants.radical.next(random) : 2;
  const radicalUpper = radius % 2 === 0 ? String(radius / 2) : `\\frac{${radius}}{2}`;
  const radicalUpperText = radius % 2 === 0 ? String(radius / 2) : `${radius}/2`;
  const trigIntegral = Array.from({ length: (oddPower - 1) / 2 }, (_, index) => 2 * (index + 1) / (2 * (index + 1) + 1)).reduce((value, factor) => value * factor, 1);
  const problems: Record<IntegralPattern, IntegralProblem> = {
    substitution: { pattern, expression: `\\int_0^1 2x(x^2+1)^{${power}}\\,dx`, answer: (2 ** (power + 1) - 1) / (power + 1), hint: '内側の式を u と置く', explanation: `u=x²+1 と置くと区間は1から2。積分値は (2^${power + 1}−1)/${power + 1}。` },
    parts: { pattern, expression: `\\int_0^1 x e^{${rate}x}\\,dx`, answer: (Math.exp(rate) * (rate - 1) + 1) / rate ** 2, hint: '多項式 × 指数関数', explanation: `部分積分で [xe^(${rate}x)/${rate}−e^(${rate}x)/${rate}²]₀¹。` },
    rational: { pattern, expression: `\\int_0^1 \\frac{${partialA + partialB}x+${2 * partialA + partialB}}{(x+1)(x+2)}\\,dx`, answer: partialA * Math.log(2) + partialB * Math.log(1.5), hint: '分母を一次式の積に分ける', explanation: `部分分数分解すると ${partialA}/(x+1)+${partialB}/(x+2)。積分値は ${partialA} ln 2 + ${partialB} ln(3/2)。` },
    trig: { pattern, expression: `\\int_0^{\\pi/2} \\sin^{${oddPower}} x\\,dx`, answer: trigIntegral, hint: 'sin x を1つ残して cos x に置換し、残りを整理', explanation: `sin の奇数乗を1つ残して置換するか、漸化式を使う。積分値は約 ${trigIntegral.toFixed(3)}。` },
    radical: {
      pattern,
      expression: `\\int_0^{${radicalUpper}} \\sqrt{${radius}^2-x^2}\\,dx`,
      answer: radius ** 2 * (Math.PI / 12 + Math.sqrt(3) / 8),
      hint: '三角置換で x=R sin θ と置く',
      explanation: `x=${radius} sin θ と置くと、x=0から${radicalUpperText}のとき θ=0からπ/6。√(${radius}²−x²)=${radius} cos θ、dx=${radius} cos θ dθ なので、${radius}²∫₀^{π/6}cos²θ dθ=${radius}²(π/12+√3/8)≈${(radius ** 2 * (Math.PI / 12 + Math.sqrt(3) / 8)).toFixed(3)}。`,
    },
  };
  return problems[pattern];
}
