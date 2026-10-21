import { BalancedRandom } from './balancedRandom.ts';
import { calculateRlcSeriesState, type RlcSeriesInput } from './rlcSeriesCircuit.ts';

export type RlcCalculationPattern =
  | 'inductiveReactance'
  | 'capacitiveReactance'
  | 'impedance'
  | 'current'
  | 'resonanceFrequency';
export type RlcCalculationMode = RlcCalculationPattern | 'mix';
export type RlcCalculationProblem = {
  pattern: RlcCalculationPattern;
  input: RlcSeriesInput;
  question: string;
  answer: number;
  unit: string;
  explanation: string;
};

export const rlcCalculationPatterns: readonly RlcCalculationPattern[] = [
  'inductiveReactance',
  'capacitiveReactance',
  'impedance',
  'current',
  'resonanceFrequency',
];

export const rlcCalculationLabels: Record<RlcCalculationPattern, string> = {
  inductiveReactance: 'コイルのリアクタンス',
  capacitiveReactance: 'コンデンサーのリアクタンス',
  impedance: 'インピーダンス',
  current: '回路電流',
  resonanceFrequency: '共振周波数',
};

const patternPicker = new BalancedRandom(rlcCalculationPatterns);
const pick = <T,>(items: readonly T[], random: () => number): T => {
  const sample = random();
  const index = Number.isFinite(sample)
    ? Math.min(items.length - 1, Math.max(0, Math.floor(sample * items.length)))
    : 0;
  return items[index];
};

export function formatRlcCalculationAnswer(answer: number): string {
  return answer.toFixed(2);
}

export function isRlcCalculationAnswerCorrect(raw: string, answer: number): boolean {
  if (raw.trim() === '') return false;
  const value = Number(raw);
  return Number.isFinite(value)
    && Math.round(value * 100) === Math.round(answer * 100);
}

export function generateRlcCalculationProblem(
  mode: RlcCalculationMode,
  random = Math.random,
): RlcCalculationProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const input: RlcSeriesInput = {
    resistance: pick([20, 30, 40, 50, 100], random),
    inductance: pick([0.1, 0.2, 0.25, 0.5], random),
    capacitanceMicrofarads: pick([20, 40, 50, 80, 100], random),
    frequency: pick([10, 20, 25, 50, 60, 100], random),
    voltagePeak: pick([12, 24, 48, 60], random),
  };
  const state = calculateRlcSeriesState(input);
  const parameters = `R=${input.resistance} Ω、L=${input.inductance} H、C=${input.capacitanceMicrofarads} μF、f=${input.frequency} Hz`;

  switch (pattern) {
    case 'inductiveReactance':
      return {
        pattern,
        input,
        question: `コイルについて、L=${input.inductance} H、f=${input.frequency} Hz のとき、誘導リアクタンス Xₗ は？`,
        answer: state.inductiveReactance,
        unit: 'Ω',
        explanation: `Xₗ=2πfL=2π×${input.frequency}×${input.inductance}=${formatRlcCalculationAnswer(state.inductiveReactance)} Ω。`,
      };
    case 'capacitiveReactance':
      return {
        pattern,
        input,
        question: `コンデンサーについて、C=${input.capacitanceMicrofarads} μF、f=${input.frequency} Hz のとき、容量リアクタンス X꜀ は？`,
        answer: state.capacitiveReactance,
        unit: 'Ω',
        explanation: `X꜀=1/(2πfC)。C=${input.capacitanceMicrofarads}×10⁻⁶ F を代入すると X꜀=${formatRlcCalculationAnswer(state.capacitiveReactance)} Ω。`,
      };
    case 'impedance':
      return {
        pattern,
        input,
        question: `${parameters} のRLC直列回路のインピーダンス Z は？`,
        answer: state.impedance,
        unit: 'Ω',
        explanation: `Xₗ=${formatRlcCalculationAnswer(state.inductiveReactance)} Ω、X꜀=${formatRlcCalculationAnswer(state.capacitiveReactance)} Ω。Z=√(R²+(Xₗ−X꜀)²)=${formatRlcCalculationAnswer(state.impedance)} Ω。`,
      };
    case 'current':
      return {
        pattern,
        input,
        question: `電圧の最大値 V₀=${input.voltagePeak} V、${parameters} の回路を流れる電流の最大値 I₀ は？`,
        answer: state.currentPeak,
        unit: 'A',
        explanation: `Z=${formatRlcCalculationAnswer(state.impedance)} Ω より、オームの法則で I₀=V₀/Z=${input.voltagePeak}/${formatRlcCalculationAnswer(state.impedance)}=${formatRlcCalculationAnswer(state.currentPeak)} A。`,
      };
    case 'resonanceFrequency':
      return {
        pattern,
        input,
        question: `L=${input.inductance} H、C=${input.capacitanceMicrofarads} μF のRLC直列回路の共振周波数 f₀ は？`,
        answer: state.resonanceFrequency,
        unit: 'Hz',
        explanation: `C=${input.capacitanceMicrofarads}×10⁻⁶ F として、f₀=1/(2π√(LC))=${formatRlcCalculationAnswer(state.resonanceFrequency)} Hz。共振時は Xₗ=X꜀ です。`,
      };
  }
}
