import { BalancedRandom } from './balancedRandom.ts';

export type DifferentialEquationPattern = 'separation' | 'initial' | 'growth' | 'motion';
export type DifferentialEquationMode = DifferentialEquationPattern | 'mix';
export type DifferentialEquationProblem = { pattern: DifferentialEquationPattern; expression: string; answer: string; explanation: string };

export const differentialEquationPatterns: readonly DifferentialEquationPattern[] = ['separation', 'initial', 'growth', 'motion'];
export const differentialEquationLabels: Record<DifferentialEquationPattern, string> = {
  separation: '変数分離', initial: '初期条件を使う積分', growth: '指数成長率', motion: '速度から位置',
};

export function normalizeDifferentialEquationAnswer(value: string): string {
  return value.trim().replaceAll(/\s+/g, '').replaceAll('²', '^2').replaceAll('³', '^3').replaceAll('−', '-');
}

const picker = new BalancedRandom(differentialEquationPatterns);
const variants = {
  separation: new BalancedRandom(Array.from({ length: 25 }, (_, index) => ({ rate: Math.floor(index / 5) + 1, initial: (index % 5) + 1 }))),
  initial: new BalancedRandom(Array.from({ length: 25 }, (_, index) => ({ coefficient: Math.floor(index / 5) + 1, constant: (index % 5) + 1 }))),
  growth: new BalancedRandom([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]),
  motion: new BalancedRandom(Array.from({ length: 25 }, (_, index) => ({ coefficient: (Math.floor(index / 5) + 1) * 2, initial: index % 5 }))),
};

export function generateDifferentialEquationProblem(mode: DifferentialEquationMode, random = Math.random): DifferentialEquationProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  switch (pattern) {
    case 'separation': {
      const { rate, initial } = variants.separation.next(random);
      return { pattern, expression: `dy/dx = ${rate}y,  y(0)=${initial} の解`, answer: `y=${initial}e^(${rate}x)`, explanation: `dy/y=${rate}dx と変数分離して積分する。初期条件 y(0)=${initial} から積分定数を決め、解は y=${initial}e^(${rate}x)。` };
    }
    case 'initial': {
      const { coefficient, constant } = variants.initial.next(random);
      const initialValue = coefficient + constant;
      const cubicTerm = coefficient === 1 ? 'x^3' : `${coefficient}x^3`;
      return { pattern, expression: `dy/dx = ${3 * coefficient}x²,  y(1)=${initialValue} の解`, answer: `y=${cubicTerm}+${constant}`, explanation: `積分して y=${cubicTerm.replace('^3', '³')}+C。初期条件 y(1)=${initialValue} を代入すると C=${constant}。` };
    }
    case 'growth': {
      const rate = variants.growth.next(random);
      const percent = rate * 100;
      return { pattern, expression: `dN/dt = ${rate}N のとき、相対成長率（単位時間あたり）`, answer: `${percent}%/単位時間`, explanation: `相対成長率 (1/N)(dN/dt)=k=${rate}。したがって単位時間あたり${percent}%で増加する割合を表す。` };
    }
    case 'motion': {
      const { coefficient, initial } = variants.motion.next(random);
      const positionCoefficient = coefficient / 2;
      const quadraticTerm = positionCoefficient === 1 ? 't^2' : `${positionCoefficient}t^2`;
      const constantTerm = initial === 0 ? '' : `+${initial}`;
      return { pattern, expression: `速度 v(t)=${coefficient}t、初期位置 x(0)=${initial} のときの位置 x(t)`, answer: `x=${quadraticTerm}${constantTerm}`, explanation: `位置は速度の積分。x(t)=∫${coefficient}t dt=${quadraticTerm.replace('^2', '²')}+C。x(0)=${initial} より C=${initial}。` };
    }
  }
}
