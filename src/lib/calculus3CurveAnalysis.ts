import { BalancedRandom } from './balancedRandom.ts';

export type CurvePattern = 'increase' | 'extrema' | 'concavity' | 'tangent' | 'normal' | 'motion';
export type CurveMode = CurvePattern | 'mix';
export type CurveProblem = { pattern: CurvePattern; expression: string; prompt: string; answer: number; explanation: string };

export const curvePatterns: readonly CurvePattern[] = ['increase', 'extrema', 'concavity', 'tangent', 'normal', 'motion'];
export const curveLabels: Record<CurvePattern, string> = { increase: '増減', extrema: '極大・極小', concavity: '凹凸・変曲点', tangent: '接線', normal: '法線', motion: '速度・加速度' };
const picker = new BalancedRandom(curvePatterns);
const variants = {
  increase: new BalancedRandom([1, 2, 3, 4, 5]),
  extrema: new BalancedRandom([1, 2, 3, 4, 5]),
  concavity: new BalancedRandom([1, 2, 3, 4, 5]),
  tangent: new BalancedRandom([1, 2, 3, 4, 5]),
  normal: new BalancedRandom([1, 2, 3, 4, 5]),
  motion: new BalancedRandom(Array.from({ length: 10 }, (_, index) => ({ n: Math.floor(index / 2) + 1, quantity: index % 2 === 0 ? 'velocity' as const : 'acceleration' as const }))),
};

export function generateCurveProblem(mode: CurveMode, random = Math.random): CurveProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const variant = variants[pattern].next(random);
  const n = typeof variant === 'number' ? variant : variant.n;
  const all: Record<CurvePattern, CurveProblem> = {
    increase: { pattern, expression: `f(x)=x^3-${3 * n ** 2}x`, prompt: 'x>0 の範囲で増加・減少が切り替わる境界 x を求めなさい。', answer: n, explanation: `f′(x)=3(x²−${n ** 2})。x>0 では x=${n} で f′ の符号が負から正に変わるため、この境界で減少から増加に切り替わります。` },
    extrema: { pattern, expression: `f(x)=x^3-${3 * n ** 2}x`, prompt: 'この関数の極大値と極小値の差（極大値−極小値）を求めなさい。', answer: 4 * n ** 3, explanation: `f′(x)=3(x²−${n ** 2}) より臨界点は ±${n}。f(−${n})=${2 * n ** 3}、f(${n})=−${2 * n ** 3}。差は ${4 * n ** 3}。` },
    concavity: { pattern, expression: `f(x)=x^3-${3 * n}x^2`, prompt: '変曲点の x 座標を求めなさい。', answer: n, explanation: `f′′(x)=6x−${6 * n} は x=${n} の前後で符号が変わるため、変曲点の x 座標は ${n}。` },
    tangent: { pattern, expression: `y=x^2+${n}x,\\; x=1`, prompt: '指定された点での接線の傾きを求めなさい。', answer: 2 + n, explanation: `y′=2x+${n}。x=1 での傾きは ${2 + n}。` },
    normal: { pattern, expression: `y=x^2+${n}x,\\; x=1`, prompt: '指定された点での法線の傾きを求めなさい。', answer: -1 / (2 + n), explanation: `接線の傾きは y′(1)=${2 + n}。法線の傾きはその負の逆数 −1/${2 + n}。` },
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
