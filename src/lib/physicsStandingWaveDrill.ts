import { BalancedRandom } from './balancedRandom.ts';
import { standingWaveFrequency, standingWaveWavelength } from './physicsStandingWave.ts';
import type { StandingWaveBoundary } from './physicsStandingWave.ts';

export type StandingWavePattern = 'stringFrequency' | 'stringWaveSpeed' | 'stringWavelength' | 'openPipeFrequency' | 'closedPipeFrequency';
export type StandingWaveMode = StandingWavePattern | 'mix';
export type StandingWaveProblem = { pattern: StandingWavePattern; question: string; answer: number; unit: string; explanation: string };
export const standingWavePatterns: readonly StandingWavePattern[] = ['stringFrequency', 'stringWaveSpeed', 'stringWavelength', 'openPipeFrequency', 'closedPipeFrequency'];
export const standingWaveLabels: Record<StandingWavePattern, string> = {
  stringFrequency: '弦の倍振動の振動数',
  stringWaveSpeed: '弦の条件から波の速さ',
  stringWavelength: '弦の倍振動から波長',
  openPipeFrequency: '両端開管の固有振動数',
  closedPipeFrequency: '片端閉管の奇数次固有振動数',
};
const patternPicker = new BalancedRandom(standingWavePatterns);
const pick = <T,>(items: readonly T[], random: () => number): T => {
  const value = random();
  const index = Number.isFinite(value) ? Math.min(items.length - 1, Math.max(0, Math.floor(value * items.length))) : 0;
  return items[index];
};
export function formatStandingWaveAnswer(value: number): string { return Number(value.toFixed(2)).toString(); }
export function isStandingWaveAnswerCorrect(raw: string, answer: number): boolean {
  if (raw.trim() === '') return false;
  const value = Number(raw);
  return Number.isFinite(value) && Math.round(value * 100) === Math.round(answer * 100);
}

export function generateStandingWaveProblem(mode: StandingWaveMode, random = Math.random): StandingWaveProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const harmonic = pick([1, 2, 3], random);
  const length = pick([0.5, 0.75, 1, 1.5], random);
  const speed = pick([240, 300, 320, 340], random);
  if (pattern === 'stringFrequency') {
    const answer = standingWaveFrequency(speed, length, harmonic, 'string');
    return { pattern, question: `両端を固定した弦（長さ ${length} m、波の速さ ${speed} m/s）の第${harmonic}倍振動の振動数 f は？`, answer, unit: 'Hz', explanation: `弦の長さ L に半波長が n 個入るので、fₙ=nv/(2L)=${harmonic}×${speed}/(2×${length})=${formatStandingWaveAnswer(answer)} Hz。` };
  }
  if (pattern === 'stringWaveSpeed') {
    const waveLength = standingWaveWavelength(length, harmonic, 'string');
    const frequency = pick([60, 80, 100, 120, 150, 200], random);
    const answer = frequency * waveLength;
    return { pattern, question: `両端固定の弦（長さ ${length} m）の第${harmonic}倍振動で、振動数が ${frequency} Hz である。弦を伝わる波の速さ v は？`, answer, unit: 'm/s', explanation: `第n倍振動の波長 λ=2L/n=2×${length}/${harmonic}=${formatStandingWaveAnswer(waveLength)} m。よって v=fλ=${frequency}×${formatStandingWaveAnswer(waveLength)}=${formatStandingWaveAnswer(answer)} m/s。` };
  }
  if (pattern === 'stringWavelength') {
    const answer = standingWaveWavelength(length, harmonic, 'string');
    return { pattern, question: `長さ ${length} m の両端固定弦が第${harmonic}倍振動している。弦上の定常波の波長 λ は？`, answer, unit: 'm', explanation: `両端固定弦では L=nλ/2。したがって λ=2L/n=2×${length}/${harmonic}=${formatStandingWaveAnswer(answer)} m。` };
  }
  const boundary: StandingWaveBoundary = pattern === 'openPipeFrequency' ? 'openPipe' : 'closedPipe';
  const pipeHarmonic = pattern === 'closedPipeFrequency' ? 2 * harmonic - 1 : harmonic;
  const answer = standingWaveFrequency(speed, length, pipeHarmonic, boundary);
  if (boundary === 'openPipe') {
    return { pattern, question: `両端が開いた管（長さ ${length} m、音速 ${speed} m/s）の第${pipeHarmonic}次固有振動数 f は？`, answer, unit: 'Hz', explanation: `両端開管は両端が変位の腹となり、λₙ=2L/n。fₙ=nv/(2L)=${pipeHarmonic}×${speed}/(2×${length})=${formatStandingWaveAnswer(answer)} Hz。` };
  }
  return { pattern, question: `片端閉管（長さ ${length} m、音速 ${speed} m/s）の第${pipeHarmonic}次（奇数次）固有振動数 f は？`, answer, unit: 'Hz', explanation: `閉端は変位の節、開端は腹です。許されるのは奇数次で λₙ=4L/n。fₙ=nv/(4L)=${pipeHarmonic}×${speed}/(4×${length})=${formatStandingWaveAnswer(answer)} Hz。` };
}
