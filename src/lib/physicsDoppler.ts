import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type DopplerPattern = 'observerMoves' | 'sourceMoves' | 'bothMove' | 'bothStill';
export type DopplerMode = DopplerPattern | 'mix';

export const dopplerPatterns: readonly DopplerPattern[] = ['observerMoves', 'sourceMoves', 'bothMove', 'bothStill'];
export const dopplerLabels: Record<DopplerPattern, string> = {
  observerMoves: '観測者だけが動く',
  sourceMoves: '音源だけが動く',
  bothMove: '音源と観測者が動く',
  bothStill: '音源・観測者とも静止',
};

export interface DopplerProblem {
  pattern: DopplerPattern;
  soundSpeed: number;
  emittedFrequency: number;
  sourceSpeed: number;
  observerSpeed: number;
  sourceApproaching: boolean;
  observerApproaching: boolean;
  answer: number;
  question: string;
  explanation: string;
}

const picker = new BalancedRandom<DopplerPattern>(dopplerPatterns);
const pick = <T,>(items: readonly T[], random: () => number): T => items[Math.min(items.length - 1, Math.floor(Math.max(0, Math.min(1 - Number.EPSILON, random())) * items.length))];

export function calculateDopplerFrequency({ emittedFrequency, soundSpeed, sourceSpeed, observerSpeed, sourceApproaching, observerApproaching }: Pick<DopplerProblem, 'emittedFrequency' | 'soundSpeed' | 'sourceSpeed' | 'observerSpeed' | 'sourceApproaching' | 'observerApproaching'>): number {
  return emittedFrequency
    * (soundSpeed + (observerApproaching ? observerSpeed : -observerSpeed))
    / (soundSpeed - (sourceApproaching ? sourceSpeed : -sourceSpeed));
}

export function generateDopplerProblem(mode: DopplerMode, random = Math.random): DopplerProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  const soundSpeed = pick([330, 340, 350], random);
  const emittedFrequency = pick([400, 500, 600, 800, 1000], random);
  const sourceMoves = pattern === 'sourceMoves' || pattern === 'bothMove';
  const observerMoves = pattern === 'observerMoves' || pattern === 'bothMove';
  const sourceSpeed = sourceMoves ? pick([10, 20, 30, 40], random) : 0;
  const observerSpeed = observerMoves ? pick([10, 20, 30, 40], random) : 0;
  const sourceApproaching = sourceMoves && random() < 0.5;
  const observerApproaching = observerMoves && random() < 0.5;
  const answer = calculateDopplerFrequency({ emittedFrequency, soundSpeed, sourceSpeed, observerSpeed, sourceApproaching, observerApproaching });
  const sourceDescription = sourceMoves ? `音源は観測者${sourceApproaching ? 'に近づき' : 'から遠ざかり'}ながら ${sourceSpeed} m/s` : '音源は静止';
  const observerDescription = observerMoves ? `観測者は音源${observerApproaching ? 'に近づき' : 'から遠ざかり'}ながら ${observerSpeed} m/s` : '観測者は静止';
  const question = `音速 ${soundSpeed} m/s、音源の振動数 ${emittedFrequency} Hz。${sourceDescription}、${observerDescription}。観測される振動数 f′ は何 Hz か。`;
  const numerator = soundSpeed + (observerApproaching ? observerSpeed : -observerSpeed);
  const denominator = soundSpeed - (sourceApproaching ? sourceSpeed : -sourceSpeed);
  const numeratorTerm = observerMoves ? `v${observerApproaching ? '+vₒ' : '−vₒ'}` : 'v';
  const denominatorTerm = sourceMoves ? `v${sourceApproaching ? '−vₛ' : '+vₛ'}` : 'v';
  const explanation = `音源が観測者へ近づくと分母は v−vₛ、遠ざかると v+vₛ。観測者が近づくと分子は v+vₒ、遠ざかると v−vₒ。したがって f′=f×(${numeratorTerm})/(${denominatorTerm}) = ${emittedFrequency}×${numerator}/${denominator} ≈ ${answer.toFixed(2)} Hz。`;
  return { pattern, soundSpeed, emittedFrequency, sourceSpeed, observerSpeed, sourceApproaching, observerApproaching, answer, question, explanation };
}

export function isDopplerAnswerCorrect(raw: string, expected: number): boolean {
  return isNumericAnswerCorrect(raw, expected, 2);
}
