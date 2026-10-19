import { BalancedRandom } from './balancedRandom.ts';

export type RationalizationMode = 'mix' | '+' | '-';

export interface RationalizationProblem {
  a: number;
  b: number;
  numerator: number;
  coefficient: number;
  denominatorSign: '+' | '-';
  answerSign: '+' | '-';
}

const signPicker = new BalancedRandom<'+' | '-'>(['+', '-']);

export function parseRationalizationInteger(value: string): number | null {
  const normalized = value.trim();
  if (!/^[+-]?\d+$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function hasSquareFactor(value: number): boolean {
  for (let factor = 2; factor * factor <= value; factor += 1) {
    if (value % (factor * factor) === 0) return true;
  }
  return false;
}

export function generateRationalizationProblem(
  mode: RationalizationMode = 'mix',
  random: () => number = Math.random,
): RationalizationProblem {
  let a: number;
  let b: number;
  do {
    a = Math.floor(random() * 15) + 2;
    b = Math.floor(random() * 15) + 1;
  } while (a <= b || hasSquareFactor(a) || hasSquareFactor(b));

  const coefficient = Math.floor(random() * 3) + 1;
  const denominatorSign = mode === 'mix' ? signPicker.next(random) : mode;
  return {
    a,
    b,
    numerator: coefficient * (a - b),
    coefficient,
    denominatorSign,
    answerSign: denominatorSign === '+' ? '-' : '+',
  };
}

export function checkRationalizationAnswer(
  problem: RationalizationProblem,
  answer: { coefficientA: number; radicandA: number; coefficientB: number; radicandB: number },
): boolean {
  return answer.coefficientA === problem.coefficient
    && answer.radicandA === problem.a
    && answer.coefficientB === problem.coefficient
    && answer.radicandB === problem.b;
}
