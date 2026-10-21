import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type CurvePattern = 'increase' | 'extrema' | 'concavity' | 'quartic-inflection' | 'tangent' | 'normal' | 'motion';
export type CurveMode = CurvePattern | 'mix';
export type CurveProblem = { pattern: CurvePattern; expression: string; prompt: string; answer: number; explanation: string };

export const curvePatterns: readonly CurvePattern[] = ['increase', 'extrema', 'concavity', 'quartic-inflection', 'tangent', 'normal', 'motion'];
export const curveLabels: Record<CurvePattern, string> = { increase: '増減', extrema: '極大・極小', concavity: '三次関数の凹凸・変曲点', 'quartic-inflection': '四次関数の変曲点', tangent: '接線', normal: '法線', motion: '速度・加速度' };

export function isCurveAnswerCorrect(input: string, expected: number): boolean {
  return isNumericAnswerCorrect(input, expected, 3);
}

const picker = new BalancedRandom(curvePatterns);
const variants = {
  increase: new BalancedRandom([1, 2, 3, 4, 5]),
  extrema: new BalancedRandom([1, 2, 3, 4, 5]),
  concavity: new BalancedRandom([1, 2, 3, 4, 5]),
  'quartic-inflection': new BalancedRandom([1, 2, 3, 4, 5]),
  tangent: new BalancedRandom([1, 2, 3, 4, 5]),
  normal: new BalancedRandom([1, 2, 3, 4, 5]),
  motion: new BalancedRandom(Array.from({ length: 10 }, (_, index) => ({ n: Math.floor(index / 2) + 1, quantity: index % 2 === 0 ? 'velocity' as const : 'acceleration' as const }))),
};

export function generateCurveProblem(mode: CurveMode, random = Math.random): CurveProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const variant = variants[pattern].next(random);
  const n = typeof variant === 'number' ? variant : variant.n;
  const linearTerm = n === 1 ? 'x' : `${n}x`;
  const all: Record<CurvePattern, CurveProblem> = {
    increase: { pattern, expression: `f(x)=x^3-${3 * n ** 2}x`, prompt: 'x>0 の範囲で増加・減少が切り替わる境界 x を求めなさい。', answer: n, explanation: `f′(x)=3(x²−${n ** 2})。x>0 では x=${n} で f′ の符号が負から正に変わるため、この境界で減少から増加に切り替わります。` },
    extrema: { pattern, expression: `f(x)=x^3-${3 * n ** 2}x`, prompt: 'この関数の極大値と極小値の差（極大値−極小値）を求めなさい。', answer: 4 * n ** 3, explanation: `f′(x)=3(x²−${n ** 2}) より臨界点は ±${n}。f(−${n})=${2 * n ** 3}、f(${n})=−${2 * n ** 3}。差は ${4 * n ** 3}。` },
    concavity: { pattern, expression: `f(x)=x^3-${3 * n}x^2`, prompt: '変曲点の x 座標を求めなさい。', answer: n, explanation: `f′′(x)=6x−${6 * n} は x=${n} の前後で符号が変わるため、変曲点の x 座標は ${n}。` },
    'quartic-inflection': { pattern, expression: `f(x)=x^4-${n}x^2`, prompt: '正の x 座標をもつ変曲点の x 座標を求めなさい。', answer: Math.sqrt(n / 6), explanation: `f′′(x)=12x²−${2 * n}。f′′(x)=0 より x=±√(${n}/6)。正の変曲点は x=√(${n}/6)≈${Math.sqrt(n / 6).toFixed(3)}。係数2ではビジュアルと同じ f(x)=x⁴−2x² となります。` },
    tangent: { pattern, expression: `y=x^2+${linearTerm},\\; x=1`, prompt: '指定された点での接線の傾きを求めなさい。', answer: 2 + n, explanation: `y′=2x+${n}。x=1 での傾きは ${2 + n}。` },
    normal: { pattern, expression: `y=x^2+${linearTerm},\\; x=1`, prompt: '指定された点での法線の傾きを求めなさい。', answer: -1 / (2 + n), explanation: `接線の傾きは y′(1)=${2 + n}。接線に垂直な法線の傾き m は m×${2 + n}=−1 を満たすので、m=−1/${2 + n}≈${(-1 / (2 + n)).toFixed(3)}。` },
    motion: {
      pattern,
      expression: `x(t)=t^3-${3 * n}t,\\; t=1`,
      prompt: variant !== undefined && typeof variant !== 'number' && variant.quantity === 'acceleration' ? '時刻 t=1 における加速度を求めなさい。' : '時刻 t=1 における速度を求めなさい。',
      answer: variant !== undefined && typeof variant !== 'number' && variant.quantity === 'acceleration' ? 6 : 3 - 3 * n,
      explanation: variant !== undefined && typeof variant !== 'number' && variant.quantity === 'acceleration' ? `速度 v(t)=x′(t)=3t²−${3 * n}、加速度 a(t)=v′(t)=6t。t=1 で a=6。` : `速度 v(t)=x′(t)=3t²−${3 * n}。t=1 で v=${3 - 3 * n}。`,
    },
  };
  return all[pattern];
}
