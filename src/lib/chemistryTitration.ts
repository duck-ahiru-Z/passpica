import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type TitrationPattern = 'one-to-one' | 'diprotic-acid' | 'divalent-base' | 'coefficient-ratio';
export type TitrationMode = TitrationPattern | 'mix';
export type TitrationProblem = {
  pattern: TitrationPattern;
  question: string;
  answer: number;
  explanation: string;
};

export const titrationPatterns: readonly TitrationPattern[] = [
  'one-to-one', 'diprotic-acid', 'divalent-base', 'coefficient-ratio',
];
export const titrationLabels: Record<TitrationPattern, string> = {
  'one-to-one': '一価酸と一価塩基（1:1）',
  'diprotic-acid': '二価酸と一価塩基',
  'divalent-base': '一価酸と二価塩基',
  'coefficient-ratio': '反応係数が異なる中和',
};

const patternPicker = new BalancedRandom(titrationPatterns);
const values = {
  'one-to-one': new BalancedRandom([{ acidVolume: 20, baseConcentration: 0.1, baseVolume: 20 }, { acidVolume: 25, baseConcentration: 0.2, baseVolume: 15 }, { acidVolume: 10, baseConcentration: 0.15, baseVolume: 20 }]),
  'diprotic-acid': new BalancedRandom([{ acidVolume: 20, baseConcentration: 0.1, baseVolume: 20 }, { acidVolume: 10, baseConcentration: 0.2, baseVolume: 15 }, { acidVolume: 25, baseConcentration: 0.12, baseVolume: 25 }]),
  'divalent-base': new BalancedRandom([{ acidVolume: 20, baseConcentration: 0.1, baseVolume: 20 }, { acidVolume: 25, baseConcentration: 0.2, baseVolume: 15 }, { acidVolume: 10, baseConcentration: 0.15, baseVolume: 20 }]),
  'coefficient-ratio': new BalancedRandom([{ acidVolume: 20, baseConcentration: 0.1, baseVolume: 20 }, { acidVolume: 10, baseConcentration: 0.2, baseVolume: 15 }, { acidVolume: 25, baseConcentration: 0.12, baseVolume: 25 }]),
};
const format = (value: number) => Number(value.toFixed(6)).toString();

export function isTitrationAnswerCorrect(input: string, expected: number): boolean {
  return isNumericAnswerCorrect(input, expected, 3);
}

export function generateTitrationProblem(mode: TitrationMode, random = Math.random): TitrationProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const { acidVolume, baseConcentration, baseVolume } = values[pattern].next(random);
  let acidFormula = 'HCl';
  let baseFormula = 'NaOH';
  let acidCoefficient = 1;
  let baseCoefficient = 1;
  let equation = 'HCl + NaOH → NaCl + H₂O';

  switch (pattern) {
    case 'one-to-one':
      acidFormula = 'HCl'; baseFormula = 'NaOH';
      break;
    case 'diprotic-acid':
      acidFormula = 'H₂SO₄'; baseFormula = 'NaOH';
      acidCoefficient = 1; baseCoefficient = 2;
      equation = 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O';
      break;
    case 'divalent-base':
      acidFormula = 'HCl'; baseFormula = 'Ca(OH)₂';
      acidCoefficient = 2; baseCoefficient = 1;
      equation = '2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O';
      break;
    case 'coefficient-ratio':
      acidFormula = 'H₃PO₄'; baseFormula = 'Ca(OH)₂';
      acidCoefficient = 2; baseCoefficient = 3;
      equation = '2H₃PO₄ + 3Ca(OH)₂ → Ca₃(PO₄)₂ + 6H₂O';
      break;
  }

  const answer = baseConcentration * (baseVolume / 1000) * (acidCoefficient / baseCoefficient) / (acidVolume / 1000);
  return {
    pattern,
    question: `濃度不明の ${acidFormula} 水溶液 ${acidVolume} mL を、${baseConcentration} mol/L の ${baseFormula} 水溶液で滴定したところ ${baseVolume} mL で中和した。酸のモル濃度を求めよ。`,
    answer,
    explanation: `反応式の係数比は ${equation}。中和点では n(酸):n(塩基)=${acidCoefficient}:${baseCoefficient}。したがって c(酸)×${acidVolume}/1000 : ${baseConcentration}×${baseVolume}/1000 = ${acidCoefficient}:${baseCoefficient} より、c(酸)=${format(answer)} mol/L。体積を L に直してから係数比を使います。`,
  };
}
