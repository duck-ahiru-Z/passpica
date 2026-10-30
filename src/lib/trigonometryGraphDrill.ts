import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type TrigGraphPattern = 'amplitude' | 'period' | 'horizontalShift' | 'verticalShift' | 'range' | 'tanAsymptote';
export type TrigGraphMode = TrigGraphPattern | 'mix';
export type TrigGraphProblem = {
  pattern: TrigGraphPattern;
  expression: string;
  question: string;
  answers: number[];
  answerLabels: string[];
  unit: string;
  explanation: string;
};

export const trigGraphPatterns: readonly TrigGraphPattern[] = [
  'amplitude', 'period', 'horizontalShift', 'verticalShift', 'range', 'tanAsymptote',
];

export const trigGraphLabels: Record<TrigGraphPattern, string> = {
  amplitude: '振幅',
  period: '周期',
  horizontalShift: '左右の平行移動',
  verticalShift: '上下の平行移動',
  range: '値域',
  tanAsymptote: 'tanの漸近線',
};

const amplitudeVariants = [-3, -2, 2, 3] as const;
const periodVariants = [1, 2, 3, 4] as const;
const horizontalShiftVariants = [-60, -30, 30, 45, 60] as const;
const verticalShiftVariants = [-2, -1, 1, 2] as const;
const rangeVariants = [
  { amplitude: 1, shift: -2 }, { amplitude: 1, shift: 1 },
  { amplitude: 2, shift: -1 }, { amplitude: 2, shift: 2 },
  { amplitude: 3, shift: -2 }, { amplitude: 3, shift: 1 },
] as const;
const tangentVariants = [
  { frequency: 1, shift: -30 }, { frequency: 1, shift: 30 },
  { frequency: 2, shift: -45 }, { frequency: 2, shift: 45 },
  { frequency: 3, shift: 0 }, { frequency: 4, shift: 60 },
] as const;

function signed(value: number): string {
  return value < 0 ? `−${Math.abs(value)}` : `${value}`;
}

function shiftedAngle(value: number): string {
  return value < 0 ? `(θ + ${Math.abs(value)}°)` : value > 0 ? `(θ − ${value}°)` : 'θ';
}

export function createTrigGraphProblemPicker() {
  const patternPicker = new BalancedRandom(trigGraphPatterns);
  const variants = {
    amplitude: new BalancedRandom(amplitudeVariants),
    period: new BalancedRandom(periodVariants),
    horizontalShift: new BalancedRandom(horizontalShiftVariants),
    verticalShift: new BalancedRandom(verticalShiftVariants),
    range: new BalancedRandom(rangeVariants),
    tanAsymptote: new BalancedRandom(tangentVariants),
  };

  return {
    next(mode: TrigGraphMode = 'mix', random = Math.random): TrigGraphProblem {
      const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
      switch (pattern) {
        case 'amplitude': {
          const a = variants.amplitude.next(random);
          const magnitude = Math.abs(a);
          return {
            pattern,
            expression: `y = ${signed(a)} sin θ`,
            question: 'この関数の振幅を求めなさい。',
            answers: [magnitude], answerLabels: ['振幅'], unit: '',
            explanation: `振幅は係数の絶対値 |a| です。|${signed(a)}| = ${magnitude}。符号が負でも振幅は正です。`,
          };
        }
        case 'period': {
          const b = variants.period.next(random);
          const period = 360 / b;
          return {
            pattern,
            expression: `y = sin ${b === 1 ? 'θ' : `${b}θ`}`,
            question: 'この関数の周期を度数法で求めなさい。',
            answers: [period], answerLabels: ['周期'], unit: '°',
            explanation: `y=sin(bθ) の周期は 360°/|b|。360°/${b} = ${period}°。`,
          };
        }
        case 'horizontalShift': {
          const c = variants.horizontalShift.next(random);
          const inner = shiftedAngle(c);
          return {
            pattern,
            expression: `y = cos ${inner}`,
            question: '基本形 y=cos θ から、θ方向へ何度移動していますか。右を正として答えなさい。',
            answers: [c], answerLabels: ['移動量'], unit: '°',
            explanation: `θ−c の形は右へ c°移動です。c=${signed(c)} なので ${c > 0 ? `右へ${c}°` : `左へ${Math.abs(c)}°`}。`,
          };
        }
        case 'verticalShift': {
          const d = variants.verticalShift.next(random);
          return {
            pattern,
            expression: `y = sin θ ${d < 0 ? `− ${Math.abs(d)}` : `+ ${d}`}`,
            question: '基本形 y=sin θ から、y方向へ何だけ移動していますか。上を正として答えなさい。',
            answers: [d], answerLabels: ['移動量'], unit: '',
            explanation: `最後の定数 d が上下の移動量です。d=${signed(d)} なので ${d > 0 ? `上へ${d}` : `下へ${Math.abs(d)}`}。`,
          };
        }
        case 'range': {
          const { amplitude, shift } = variants.range.next(random);
          const minimum = shift - amplitude;
          const maximum = shift + amplitude;
          return {
            pattern,
            expression: `y = ${amplitude} sin θ ${shift < 0 ? `− ${Math.abs(shift)}` : `+ ${shift}`}`,
            question: 'この関数の値域の下端と上端を順に答えなさい。',
            answers: [minimum, maximum], answerLabels: ['下端', '上端'], unit: '',
            explanation: `値域は [d−|a|, d+|a|]。d=${shift}、|a|=${amplitude} より [${minimum}, ${maximum}]。`,
          };
        }
        case 'tanAsymptote': {
          const { frequency, shift } = variants.tanAsymptote.next(random);
          const inner = `${frequency === 1 ? '' : `${frequency}`} ${shiftedAngle(shift)}`;
          const asymptote = shift + 90 / frequency;
          return {
            pattern,
            expression: `y = tan ${inner}`,
            question: 'tan の中身が 0 になる角度より右に最も近い垂直漸近線を、度数法で求めなさい。',
            answers: [asymptote], answerLabels: ['角度'], unit: '°',
            explanation: `tan の中身が 0 になる角度は θ=${signed(shift)}°です。垂直漸近線は中身が 90° になる位置なので、θ=${signed(shift)}°+90°/${frequency}=${asymptote}°。`,
          };
        }
      }
    },
  };
}

export function isTrigGraphStrategyValid(problem: TrigGraphProblem, strategy: TrigGraphPattern | ''): boolean {
  return strategy === problem.pattern;
}

export function isTrigGraphAnswerCorrect(problem: TrigGraphProblem, rawAnswers: readonly string[]): boolean {
  return rawAnswers.length === problem.answers.length
    && problem.answers.every((answer, index) => isNumericAnswerCorrect(rawAnswers[index] ?? '', answer, 2));
}
