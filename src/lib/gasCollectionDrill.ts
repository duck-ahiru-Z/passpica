import { BalancedRandom } from './balancedRandom.ts';

export type GasCollectionPattern = 'waterDisplacement' | 'upwardDisplacement' | 'downwardDisplacement';
export type GasCollectionMode = GasCollectionPattern | 'mix';
export type GasCollectionMethod = '水上置換法' | '上方置換法' | '下方置換法';
export type GasCollectionProblem = {
  pattern: GasCollectionPattern;
  questionStyle: (typeof questionStyles)[number];
  formula: string;
  name: string;
  solubility: string;
  density: string;
  method: GasCollectionMethod;
  acceptedMethods: readonly GasCollectionMethod[];
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
const questionStyles = ['identify', 'compare', 'apply'] as const;
const questionStylePickers = Object.fromEntries(
  gasCollectionPatterns.map(pattern => [pattern, new BalancedRandom(questionStyles)]),
) as Record<GasCollectionPattern, BalancedRandom<(typeof questionStyles)[number]>>;
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

export function isGasCollectionAnswerCorrect(problem: GasCollectionProblem, pattern: GasCollectionPattern | ''): boolean {
  return pattern !== '' && problem.acceptedMethods.includes(methodFor[pattern]);
}

export function getGasCollectionAcceptedAnswerLabel(problem: GasCollectionProblem): string {
  return problem.acceptedMethods.join(' または ');
}
const pick = <T,>(items: readonly T[], random: () => number): T => {
  const sample = random();
  const index = Number.isFinite(sample) ? Math.min(items.length - 1, Math.max(0, Math.floor(sample * items.length))) : 0;
  return items[index];
};

export function generateGasCollectionProblem(mode: GasCollectionMode, random = Math.random): GasCollectionProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const gas = pick(gasSets[pattern], random);
  const questionStyle = questionStylePickers[pattern].next(random);
  const method = methodFor[pattern];
  const why = pattern === 'waterDisplacement'
    ? `${gas.solubility}ため水上置換法で集めます。空気との密度差は、この方法を選ぶ理由ではありません。`
    : pattern === 'upwardDisplacement'
      ? `${gas.solubility}ため水上置換法は避けます。${gas.density}ため、逆さの集気びんを使う上方置換法で集めます。`
      : `${gas.solubility}ため水上置換法は避けます。${gas.density}ため、口を上にした集気びんを使う下方置換法で集めます。`;
  return {
    pattern, questionStyle, formula: gas.formula, name: gas.name, solubility: gas.solubility,
    density: gas.density, method,
    acceptedMethods: pattern === 'downwardDisplacement' && gas.formula === 'CO₂' ? [method, '水上置換法'] : [method],
    question: questionStyle === 'identify'
      ? `${gas.name}（${gas.formula}）は${gas.clue}。適切な捕集法を選んでください。`
      : questionStyle === 'compare'
        ? `「${gas.clue}」という性質をもつ${gas.name}（${gas.formula}）。水への溶けやすさと空気との密度差をもとに、どの捕集法を選ぶか。`
        : `実験室で${gas.name}（${gas.formula}）を集めます。${gas.clue}ことを踏まえ、最も適切な装置はどれですか。`,
    explanation: `${gas.solubility}。${gas.density}。${why}`,
  };
}
