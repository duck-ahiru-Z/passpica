import { BalancedRandom } from './balancedRandom.ts';

export const organicStructurePatterns = [
  'methane',
  'ethane',
  'ethylene',
  'acetylene',
  'benzene',
  'cyclohexane-chair',
  'cyclohexane-boat',
  'cis-2-butene',
  'trans-2-butene',
] as const;

export type OrganicStructurePattern = (typeof organicStructurePatterns)[number];
export type OrganicStructureMode = OrganicStructurePattern | 'mix';

export const organicStructureLabels: Record<OrganicStructurePattern, string> = {
  methane: 'メタン・sp³混成',
  ethane: 'エタン・単結合の回転',
  ethylene: 'エチレン・二重結合',
  acetylene: 'アセチレン・三重結合',
  benzene: 'ベンゼン・芳香族',
  'cyclohexane-chair': 'シクロヘキサン・椅子型',
  'cyclohexane-boat': 'シクロヘキサン・舟型',
  'cis-2-butene': 'シス-2-ブテン',
  'trans-2-butene': 'トランス-2-ブテン',
};

export interface OrganicStructureProblem {
  pattern: OrganicStructurePattern;
  prompt: string;
  choices: string[];
  answer: string;
  explanation: string;
}

type ProblemTemplate = Omit<OrganicStructureProblem, 'pattern' | 'choices'> & {
  distractors: [string, string];
};

const templates: Record<OrganicStructurePattern, ProblemTemplate> = {
  methane: {
    prompt: 'メタン CH₄ の炭素原子の混成軌道と分子の形の組合せとして正しいものは？',
    answer: 'sp³混成・正四面体形（結合角約109.5°）',
    distractors: ['sp²混成・平面三角形（約120°）', 'sp混成・直線形（180°）'],
    explanation: '炭素の4本の単結合はsp³混成軌道でつくられ、電子対どうしの反発が小さくなる正四面体形になります。',
  },
  ethane: {
    prompt: 'エタン C₂H₆ のC–C単結合まわりで、最も安定な配座は？',
    answer: 'ねじれ型（互い違いの配座）',
    distractors: ['重なり型（結合が正面から重なる配座）', 'C=C二重結合のように回転できない構造'],
    explanation: '単結合は回転できます。ねじれ型では結合電子の反発が小さく、重なり型より安定です。',
  },
  ethylene: {
    prompt: 'エチレン C₂H₄ のC=C二重結合について正しい説明は？',
    answer: 'π結合があるため結合軸まわりに自由回転できず、原子は同一平面上にある',
    distractors: ['単結合なので自由回転でき、原子は立体的にねじれる', 'sp混成の直線形で、結合角は180°である'],
    explanation: '二重結合はσ結合とπ結合からなり、回転するとπ結合が保てません。各炭素はsp²混成で平面構造をとります。',
  },
  acetylene: {
    prompt: 'アセチレン C₂H₂ の炭素原子の混成軌道と結合角は？',
    answer: 'sp混成・直線形（180°）',
    distractors: ['sp²混成・平面三角形（約120°）', 'sp³混成・正四面体形（約109.5°）'],
    explanation: '三重結合をもつ炭素はsp混成で、結合方向は一直線になります。',
  },
  benzene: {
    prompt: 'ベンゼン C₆H₆ の結合と形について正しい説明は？',
    answer: '環は平面で、π電子が非局在化し、6本のC–C結合は等価である',
    distractors: ['単結合と二重結合が固定交互に並び、結合長も交互に異なる', '炭素原子がsp³混成で正四面体状に立体配置する'],
    explanation: 'ベンゼンのπ電子は環全体に非局在化しており、各C–C結合は等価です。各炭素はsp²混成で環は平面です。',
  },
  'cyclohexane-chair': {
    prompt: 'シクロヘキサンの椅子型配座について正しい説明は？',
    answer: '最も安定な配座で、アキシアル位とエクアトリアル位の水素がある',
    distractors: ['舟型より不安定で、向かい合う水素の反発が最大である', '二重結合の回転を伴うため、シス・トランス異性体に分類される'],
    explanation: '椅子型は結合角のひずみやねじれひずみが小さく安定です。水素には軸方向のアキシアル位と外向きのエクアトリアル位があります。',
  },
  'cyclohexane-boat': {
    prompt: 'シクロヘキサンの舟型配座が椅子型より不安定な主な理由は？',
    answer: '旗竿水素どうしの反発などがあり、椅子型より約29 kJ/mol高エネルギー',
    distractors: ['ねじれ舟型と同じ約23 kJ/molだけ低エネルギー', '椅子型よりひずみが小さく、通常最も安定である'],
    explanation: '舟型では両端の旗竿水素が近づき、立体反発が生じます。舟型とねじれ舟型のエネルギー差を混同しないようにします。',
  },
  'cis-2-butene': {
    prompt: 'シス-2-ブテンの構造について正しい説明は？',
    answer: '2つのメチル基がC=Cの同じ側にあり、分子鎖が折れ曲がる',
    distractors: ['2つのメチル基がC=Cの反対側にあり、直線的な鎖になる', 'C=Cを保ったまま単結合の回転だけでトランス型へ変わる'],
    explanation: 'シス配置では置換基が二重結合の同じ側にあります。シス型ポリイソプレンは鎖に折れ曲がりをつくり、天然ゴムの弾性に関係します。',
  },
  'trans-2-butene': {
    prompt: 'トランス-2-ブテンの構造について正しい説明は？',
    answer: '2つのメチル基がC=Cの反対側にあり、分子鎖はより直線的になる',
    distractors: ['2つのメチル基がC=Cの同じ側にあり、分子鎖が折れ曲がる', '二重結合が単結合と同じように自由回転する'],
    explanation: 'トランス配置では置換基が二重結合の反対側です。トランス型ポリイソプレンは規則的に並びやすく、グッタペルカに関係します。',
  },
};

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const sample = random();
    const index = Number.isFinite(sample)
      ? Math.min(i, Math.max(0, Math.floor(sample * (i + 1))))
      : 0;
    [result[i], result[index]] = [result[index], result[i]];
  }
  return result;
}

export function createOrganicStructureProblemPicker() {
  const patternPicker = new BalancedRandom(organicStructurePatterns);
  return (mode: OrganicStructureMode = 'mix', random: () => number = Math.random): OrganicStructureProblem => {
    const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
    const template = templates[pattern];
    return {
      pattern,
      prompt: template.prompt,
      choices: shuffled([template.answer, ...template.distractors], random),
      answer: template.answer,
      explanation: template.explanation,
    };
  };
}
