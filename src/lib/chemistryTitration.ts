import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type TitrationPattern = 'one-to-one' | 'unknown-base-concentration' | 'diprotic-acid' | 'divalent-base' | 'coefficient-ratio';
export type TitrationMode = TitrationPattern | 'mix';
export type TitrationProblem = {
  pattern: TitrationPattern;
  question: string;
  answer: number;
  explanation: string;
};

export const titrationPatterns: readonly TitrationPattern[] = [
  'one-to-one', 'unknown-base-concentration', 'diprotic-acid', 'divalent-base', 'coefficient-ratio',
];
export const titrationLabels: Record<TitrationPattern, string> = {
  'one-to-one': '一価酸と一価塩基（1:1）',
  'unknown-base-concentration': '既知の酸から塩基濃度を求める（1:1）',
  'diprotic-acid': '二価酸と一価塩基',
  'divalent-base': '一価酸と二価塩基',
  'coefficient-ratio': '反応係数が異なる中和',
};

const patternPicker = new BalancedRandom(titrationPatterns);
const values = {
  'one-to-one': new BalancedRandom([{ acidVolume: 20, baseConcentration: 0.1, baseVolume: 20 }, { acidVolume: 25, baseConcentration: 0.2, baseVolume: 15 }, { acidVolume: 10, baseConcentration: 0.15, baseVolume: 20 }]),
  'unknown-base-concentration': new BalancedRandom([{ acidVolume: 20, acidConcentration: 0.1, baseVolume: 20 }, { acidVolume: 25, acidConcentration: 0.12, baseVolume: 15 }, { acidVolume: 10, acidConcentration: 0.3, baseVolume: 20 }]),
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
  const value = values[pattern].next(random) as { acidVolume: number; baseVolume: number; acidConcentration?: number; baseConcentration?: number };
  const { acidVolume, baseVolume } = value;
  const baseConcentration = value.baseConcentration;
  const acidConcentration = value.acidConcentration;
  const baseUnknown = pattern === 'unknown-base-concentration';
  let acidFormula = 'HCl';
  let baseFormula = 'NaOH';
  let acidType = '一価酸';
  let baseType = '一価塩基';
  let acidCoefficient = 1;
  let baseCoefficient = 1;
  let equation = 'HCl + NaOH → NaCl + H₂O';

  switch (pattern) {
    case 'one-to-one':
      acidFormula = 'HCl'; baseFormula = 'NaOH';
      break;
    case 'unknown-base-concentration':
      acidFormula = 'HCl'; baseFormula = 'NaOH';
      break;
    case 'diprotic-acid':
      acidFormula = 'H₂SO₄'; baseFormula = 'NaOH';
      acidType = '二価酸'; baseType = '一価塩基';
      acidCoefficient = 1; baseCoefficient = 2;
      equation = 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O';
      break;
    case 'divalent-base':
      acidFormula = 'HCl'; baseFormula = 'Ca(OH)₂';
      acidType = '一価酸'; baseType = '二価塩基';
      acidCoefficient = 2; baseCoefficient = 1;
      equation = '2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O';
      break;
    case 'coefficient-ratio':
      acidFormula = 'H₃PO₄'; baseFormula = 'Ca(OH)₂';
      acidType = '三価酸'; baseType = '二価塩基';
      acidCoefficient = 2; baseCoefficient = 3;
      equation = '2H₃PO₄ + 3Ca(OH)₂ → Ca₃(PO₄)₂ + 6H₂O';
      break;
  }

  const answer = baseUnknown
    ? (acidConcentration as number) * (acidVolume / 1000) * (baseCoefficient / acidCoefficient) / (baseVolume / 1000)
    : (baseConcentration as number) * (baseVolume / 1000) * (acidCoefficient / baseCoefficient) / (acidVolume / 1000);
  const question = baseUnknown
    ? `一価酸 ${acidFormula} 水溶液 ${acidVolume} mL（濃度 ${acidConcentration} mol/L）を、濃度未知の一価塩基 ${baseFormula} 水溶液で滴定したところ ${baseVolume} mL で中和した。塩基のモル濃度を求めよ。`
    : `${acidType} ${acidFormula} 水溶液 ${acidVolume} mL を、${baseConcentration} mol/L の${baseType} ${baseFormula} 水溶液で滴定したところ ${baseVolume} mL で中和した。酸のモル濃度を求めよ。`;
  const explanation = baseUnknown
    ? `反応式の係数比は ${equation}。中和点では n(酸):n(塩基)=${acidCoefficient}:${baseCoefficient}。したがって ${acidConcentration}×${acidVolume}/1000 : c(塩基)×${baseVolume}/1000 = ${acidCoefficient}:${baseCoefficient} より、c(塩基)=${format(answer)} mol/L。体積を L に直してから係数比を使います。`
    : `反応式の係数比は ${equation}。中和点では n(酸):n(塩基)=${acidCoefficient}:${baseCoefficient}。したがって c(酸)×${acidVolume}/1000 : ${baseConcentration}×${baseVolume}/1000 = ${acidCoefficient}:${baseCoefficient} より、c(酸)=${format(answer)} mol/L。体積を L に直してから係数比を使います.`;
  return {
    pattern,
    question,
    answer,
    explanation,
  };
}
