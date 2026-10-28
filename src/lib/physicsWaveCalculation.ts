import { BalancedRandom } from './balancedRandom.ts';

export type WaveCalculationPattern = 'waveSpeed' | 'frequency' | 'period' | 'phaseDifference' | 'resultantAmplitude';
export type WaveCalculationMode = WaveCalculationPattern | 'mix';
export type WaveCalculationProblem = {
  pattern: WaveCalculationPattern;
  question: string;
  answer: number;
  unit: string;
  explanation: string;
};

export const waveCalculationPatterns: readonly WaveCalculationPattern[] = [
  'waveSpeed', 'frequency', 'period', 'phaseDifference', 'resultantAmplitude',
];
export const waveCalculationLabels: Record<WaveCalculationPattern, string> = {
  waveSpeed: '波の速さ v=fλ',
  frequency: '周期から振動数 f=1/T',
  period: '振動数から周期 T=1/f',
  phaseDifference: '経路差から位相差',
  resultantAmplitude: '位相差から合成振幅',
};

const patternPicker = new BalancedRandom(waveCalculationPatterns);
const pick = <T,>(items: readonly T[], random: () => number): T => {
  const value = random();
  const index = Number.isFinite(value) ? Math.min(items.length - 1, Math.max(0, Math.floor(value * items.length))) : 0;
  return items[index];
};

export function formatWaveAnswer(value: number): string {
  return Number(value.toFixed(3)).toString();
}

export function isWaveAnswerCorrect(raw: string, answer: number): boolean {
  if (raw.trim() === '') return false;
  const value = Number(raw);
  return Number.isFinite(value) && Math.round(value * 1000) === Math.round(answer * 1000);
}

export function generateWaveCalculationProblem(mode: WaveCalculationMode, random = Math.random): WaveCalculationProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  switch (pattern) {
    case 'waveSpeed': {
      const frequency = pick([2, 3, 4, 5, 8], random);
      const wavelength = pick([0.5, 1, 1.5, 2, 2.5], random);
      const answer = frequency * wavelength;
      return { pattern, question: `振動数 f=${frequency} Hz、波長 λ=${wavelength} m の波の速さ v は？`, answer, unit: 'm/s', explanation: `波の基本式 v=fλ より、v=${frequency}×${wavelength}=${formatWaveAnswer(answer)} m/s。` };
    }
    case 'frequency': {
      const period = pick([0.1, 0.2, 0.25, 0.4, 0.5, 2], random);
      const answer = 1 / period;
      return { pattern, question: `周期 T=${period} s の波の振動数 f は？`, answer, unit: 'Hz', explanation: `振動数と周期は逆数の関係です。f=1/T=1/${period}=${formatWaveAnswer(answer)} Hz。` };
    }
    case 'period': {
      const frequency = pick([0.5, 1, 2, 2.5, 4, 5, 10], random);
      const answer = 1 / frequency;
      return { pattern, question: `振動数 f=${frequency} Hz の波の周期 T は？`, answer, unit: 's', explanation: `周期と振動数は逆数の関係です。T=1/f=1/${frequency}=${formatWaveAnswer(answer)} s。` };
    }
    case 'phaseDifference': {
      const wavelength = pick([2, 3, 4, 6], random);
      const fraction = pick([1 / 6, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 5 / 6], random);
      const pathDifference = wavelength * fraction;
      const answer = 360 * fraction;
      return { pattern, question: `波長 λ=${wavelength} m の2つの波の経路差が ${formatWaveAnswer(pathDifference)} m のとき、位相差 Δφ は何度？`, answer, unit: '°', explanation: `Δφ=360°×経路差/λ=360°×${formatWaveAnswer(pathDifference)}/${wavelength}=${formatWaveAnswer(answer)}°。` };
    }
    case 'resultantAmplitude': {
      const amplitude = pick([1, 2, 3, 4], random);
      const phase = pick([0, 60, 90, 120, 180, 240, 270, 300, 360], random);
      const answer = 2 * amplitude * Math.abs(Math.cos(phase * Math.PI / 360));
      return { pattern, question: `振幅 ${amplitude} cm の同じ波が同じ向きに進み、位相差が ${phase}° のとき、合成波の振幅 A は？`, answer, unit: 'cm', explanation: `A=2a|cos(Δφ/2)|=2×${amplitude}×|cos(${phase}°/2)|=${formatWaveAnswer(answer)} cm。0°では強め合い、180°では打ち消し合います。` };
    }
  }
}
