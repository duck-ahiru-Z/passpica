import { BalancedRandom } from './balancedRandom.ts';

export type GasCollectionPattern = 'waterDisplacement' | 'upwardDisplacement' | 'downwardDisplacement';
export type GasCollectionMode = GasCollectionPattern | 'mix';
export type GasCollectionMethod = '水上置換法' | '上方置換法' | '下方置換法';
export type GasCollectionProblem = {
  pattern: GasCollectionPattern;
  formula: string;
  name: string;
  solubility: string;
  density: string;
  method: GasCollectionMethod;
  question: string;
  explanation: string;
};

export const gasCollectionPatterns: readonly GasCollectionPattern[] = [
  'waterDisplacement', 'upwardDisplacement', 'downwardDisplacement',
];
export const gasCollectionLabels: Record<GasCollectionPattern, string> = {
  waterDisplacement: '水上置換法を選ぶ問題',
  upwardDisplacement: '上方置換法を選ぶ問題',
  downwardDisplacement: '下方置換法を選ぶ問題',
};
const patternPicker = new BalancedRandom(gasCollectionPatterns);
const gasSets: Record<GasCollectionPattern, readonly { formula: string; name: string; solubility: string; density: string; clue: string }[]> = {
  waterDisplacement: [
    { formula: 'O₂', name: '酸素', solubility: '水にほとんど溶けない', density: '空気よりやや重い', clue: '水にほとんど溶けず、水と反応しにくい' },
    { formula: 'H₂', name: '水素', solubility: '水にほとんど溶けない', density: '空気より軽い', clue: '水にほとんど溶けず、水と反応しにくい' },
  ],
  upwardDisplacement: [
    { formula: 'NH₃', name: 'アンモニア', solubility: '水に極めて溶けやすい', density: '空気より軽い', clue: '水に極めて溶けやすく、空気より軽い' },
  ],
  downwardDisplacement: [
    { formula: 'Cl₂', name: '塩素', solubility: '水に溶けやすく、水と反応する', density: '空気より重い', clue: '水に溶けやすく、空気より重い' },
    { formula: 'HCl', name: '塩化水素', solubility: '水に極めて溶けやすい', density: '空気より重い', clue: '水に極めて溶けやすく、空気より重い' },
    { formula: 'CO₂', name: '二酸化炭素', solubility: '水に少し溶ける', density: '空気より重い', clue: '水に少し溶け、空気より重い' },
  ],
};
const methodFor: Record<GasCollectionPattern, GasCollectionMethod> = {
  waterDisplacement: '水上置換法', upwardDisplacement: '上方置換法', downwardDisplacement: '下方置換法',
};
const pick = <T,>(items: readonly T[], random: () => number): T => {
  const sample = random();
  const index = Number.isFinite(sample) ? Math.min(items.length - 1, Math.max(0, Math.floor(sample * items.length))) : 0;
  return items[index];
};

export function generateGasCollectionProblem(mode: GasCollectionMode, random = Math.random): GasCollectionProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const gas = pick(gasSets[pattern], random);
  const method = methodFor[pattern];
  const why = pattern === 'waterDisplacement'
    ? '水に溶けにくく反応しないので水上置換法。空気との密度差は、この方法を選ぶ理由ではありません。'
    : pattern === 'upwardDisplacement'
      ? '水に溶けやすい気体なので水上置換は避けます。空気より軽いため、逆さの集気びんを使う上方置換法で集めます。'
      : '水に溶けやすい気体なので水上置換は避けます。空気より重いため、口を上にした集気びんを使う下方置換法で集めます。';
  return {
    pattern, formula: gas.formula, name: gas.name, solubility: gas.solubility,
    density: gas.density, method,
    question: `${gas.name}（${gas.formula}）は${gas.clue}。適切な捕集法を選んでください。`,
    explanation: `${gas.solubility}。${gas.density}。${why}`,
  };
}
