import { BalancedRandom } from './balancedRandom.ts';
import { mechanicalEnergyGravity } from './mechanicalEnergy.ts';

export type MotionPattern = 'speed' | 'acceleration' | 'freefall' | 'work' | 'momentum' | 'kineticEnergy' | 'potentialEnergy' | 'energyConservation' | 'spring';
export type MotionMode = MotionPattern | 'mix';
export type MotionProblem = { pattern: MotionPattern; question: string; answer: number; unit: string; explanation: string };

export const motionPatterns: readonly MotionPattern[] = ['speed', 'acceleration', 'freefall', 'work', 'momentum', 'kineticEnergy', 'potentialEnergy', 'energyConservation', 'spring'];
export const motionLabels: Record<MotionPattern, string> = { speed: '平均の速さ', acceleration: '加速度', freefall: '自由落下', work: '仕事', momentum: '運動量', kineticEnergy: '運動エネルギー', potentialEnergy: '位置エネルギー', energyConservation: '力学的エネルギー保存', spring: 'ばねの力' };

const picker = new BalancedRandom(motionPatterns);
const variants = {
  speed: new BalancedRandom([
    { distance: 180, time: 15 }, { distance: 240, time: 20 }, { distance: 450, time: 30 },
    { distance: 325, time: 25 }, { distance: 84, time: 7 },
  ]),
  acceleration: new BalancedRandom([
    { initial: 4, final: 10, time: 3 }, { initial: 4, final: 16, time: 4 }, { initial: 6, final: 18, time: 3 },
    { initial: 10, final: 25, time: 5 }, { initial: 15, final: 3, time: 4 },
  ]),
  freefall: new BalancedRandom([
    { gravity: 9.8, time: 1 }, { gravity: 9.8, time: 2 }, { gravity: 10, time: 3 },
    { gravity: 10, time: 4 }, { gravity: 9.8, time: 5 },
  ]),
  work: new BalancedRandom([
    { force: 20, distance: 3, angle: 0 }, { force: 15, distance: 4, angle: 60 },
    { force: 8, distance: 5, angle: 90 }, { force: 12, distance: 2, angle: 180 },
    { force: 10, distance: 6, angle: 60 },
  ]),
  momentum: new BalancedRandom([
    { mass: 2, velocity: 6 }, { mass: 1.5, velocity: 8 }, { mass: 4, velocity: 3 },
    { mass: 0.5, velocity: 14 }, { mass: 3, velocity: 5 },
  ]),
  kineticEnergy: new BalancedRandom([
    { mass: 2, velocity: 3 }, { mass: 4, velocity: 5 }, { mass: 1.5, velocity: 4 },
    { mass: 8, velocity: 2 }, { mass: 3, velocity: 6 },
  ]),
  potentialEnergy: new BalancedRandom([
    { mass: 2, height: 5 }, { mass: 1.5, height: 8 }, { mass: 0.5, height: 12 },
    { mass: 4, height: 2.5 }, { mass: 3, height: 6 },
  ]),
  energyConservation: new BalancedRandom([
    { mass: 1, height: 5, gravity: 9.8 }, { mass: 2, height: 10, gravity: 10 },
    { mass: 1.5, height: 8, gravity: 9.8 }, { mass: 4, height: 2, gravity: 10 },
    { mass: 0.5, height: 12, gravity: 9.8 },
  ]),
  spring: new BalancedRandom([
    { constant: 200, extension: 0.1 }, { constant: 150, extension: 0.2 }, { constant: 80, extension: 0.25 },
    { constant: 300, extension: 0.05 }, { constant: 500, extension: 0.08 },
  ]),
};

const displayNumber = (value: number) => Number(value.toFixed(6)).toString();
export const formatMotionAnswer = displayNumber;

function angleCosine(angle: number): number {
  if (angle === 0) return 1;
  if (angle === 60) return 0.5;
  if (angle === 90) return 0;
  if (angle === 180) return -1;
  return Math.cos((angle * Math.PI) / 180);
}

export function generateMotionProblem(mode: MotionMode, random = Math.random): MotionProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  switch (pattern) {
    case 'speed': {
      const value = variants.speed.next(random); const answer = value.distance / value.time;
      return { pattern, question: `物体が ${value.distance} m を ${value.time} s で進んだ。平均の速さは？`, answer, unit: 'm/s', explanation: `平均の速さ=移動距離/時間=${value.distance}/${value.time}=${displayNumber(answer)} m/s。` };
    }
    case 'acceleration': {
      const value = variants.acceleration.next(random); const answer = (value.final - value.initial) / value.time;
      return { pattern, question: `速度が ${value.initial} m/s から ${value.final} m/s に ${value.time} s で変化した。平均加速度は？`, answer, unit: 'm/s²', explanation: `a=(v−u)/t=(${value.final}−${value.initial})/${value.time}=${displayNumber(answer)} m/s²。負の場合は速度が減る向きの加速度。` };
    }
    case 'freefall': {
      const value = variants.freefall.next(random); const answer = value.gravity * value.time;
      return { pattern, question: `空気抵抗を無視して静かに落とした物体の ${value.time} s 後の速さを求めよ。（g=${value.gravity} m/s²）`, answer, unit: 'm/s', explanation: `初速度0より v=gt=${value.gravity}×${value.time}=${displayNumber(answer)} m/s。` };
    }
    case 'work': {
      const value = variants.work.next(random); const answer = value.force * value.distance * angleCosine(value.angle);
      return { pattern, question: `${value.force} N の力を、移動方向に対して ${value.angle}° の向きに加え、物体が ${value.distance} m 移動した。力のした仕事は？`, answer, unit: 'J', explanation: `仕事 W=Fs cosθ=${value.force}×${value.distance}×cos${value.angle}°=${displayNumber(answer)} J。垂直なら0、反対向きなら負になる。` };
    }
    case 'momentum': {
      const value = variants.momentum.next(random); const answer = value.mass * value.velocity;
      return { pattern, question: `質量 ${value.mass} kg の物体が速さ ${value.velocity} m/s で動く。運動量の大きさは？`, answer, unit: 'kg·m/s', explanation: `運動量 p=mv=${value.mass}×${value.velocity}=${displayNumber(answer)} kg·m/s。` };
    }
    case 'kineticEnergy': {
      const value = variants.kineticEnergy.next(random); const answer = 0.5 * value.mass * value.velocity ** 2;
      return { pattern, question: `質量 ${value.mass} kg の物体が速さ ${value.velocity} m/s で動く。運動エネルギーは？`, answer, unit: 'J', explanation: `K=(1/2)mv²=(1/2)×${value.mass}×${value.velocity}²=${displayNumber(answer)} J。速さを2乗する。` };
    }
    case 'potentialEnergy': {
      const value = variants.potentialEnergy.next(random); const answer = value.mass * mechanicalEnergyGravity * value.height;
      return { pattern, question: `質量 ${value.mass} kg の物体が基準面より ${value.height} m 高い位置にある。（g=${mechanicalEnergyGravity} m/s²）位置エネルギーは？`, answer, unit: 'J', explanation: `位置エネルギー Eₚ=mgh=${value.mass}×${mechanicalEnergyGravity}×${value.height}=${displayNumber(answer)} J。基準面を h=0 とする。` };
    }
    case 'energyConservation': {
      const value = variants.energyConservation.next(random); const answer = Math.sqrt(2 * value.gravity * value.height);
      return { pattern, question: `質量 ${value.mass} kg の物体を高さ ${value.height} m から静かに落とす。空気抵抗を無視し、g=${value.gravity} m/s² とする。地面直前の速さは？`, answer, unit: 'm/s', explanation: `力学的エネルギー保存より mgh=(1/2)mv²。質量 m が消え、v=√(2gh)=√(2×${value.gravity}×${value.height})=${displayNumber(answer)} m/s。` };
    }
    case 'spring': {
      const value = variants.spring.next(random); const answer = value.constant * value.extension;
      return { pattern, question: `ばね定数 ${value.constant} N/m のばねを ${value.extension} m 伸ばした。弾性力の大きさは？`, answer, unit: 'N', explanation: `フックの法則より弾性力の大きさ F=kx=${value.constant}×${value.extension}=${displayNumber(answer)} N（向きは伸びと反対）。` };
    }
  }
}
