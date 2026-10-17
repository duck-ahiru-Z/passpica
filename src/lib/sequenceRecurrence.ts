import { BalancedRandom } from './balancedRandom.ts';

export const sequencePatterns = [
  'positive-contracting',
  'positive-expanding',
  'negative-contracting',
  'negative-expanding',
] as const;

export type SequencePattern = (typeof sequencePatterns)[number];
export type SequenceMode = SequencePattern | 'mix';
export type SequenceProblem = {
  pattern: SequencePattern;
  a1: number;
  p: number;
  q: number;
  alpha: number;
  C: number;
};

export const sequencePatternLabels: Record<SequencePattern, string> = {
  'positive-contracting': '基礎練習：正の公比で収束（0 < p < 1）',
  'positive-expanding': '基礎練習：正の公比で発散（p > 1）',
  'negative-contracting': '基礎練習：負の公比で収束（−1 < p < 0）',
  'negative-expanding': '基礎練習：負の公比で発散（p < −1）',
};

const patternPicker = new BalancedRandom<SequencePattern>(sequencePatterns);
const pChoices: Record<SequencePattern, readonly number[]> = {
  'positive-contracting': [0.25, 0.5, 0.75],
  'positive-expanding': [2, 3, 4, 5],
  'negative-contracting': [-0.25, -0.5, -0.75],
  'negative-expanding': [-2, -3],
};

export function createSequenceProblem(
  mode: SequenceMode,
  random: () => number = Math.random,
): SequenceProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const alpha = Math.floor(random() * 11) - 5;
  const choices = pChoices[pattern];
  const p = choices[Math.floor(random() * choices.length)];
  const q = alpha * (1 - p);
  let a1 = alpha;
  while (a1 === alpha) a1 = Math.floor(random() * 11) - 5;
  return { pattern, a1, p, q, alpha, C: a1 - alpha };
}

export function getSequenceTerms(problem: SequenceProblem, count: number): number[] {
  const terms = [problem.a1];
  while (terms.length < count) terms.push(problem.p * terms.at(-1)! + problem.q);
  return terms;
}

export function getSequenceGeneralTerm(problem: SequenceProblem, n: number): number {
  return problem.C * problem.p ** (n - 1) + problem.alpha;
}
