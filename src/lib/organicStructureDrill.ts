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

const additionalTemplates: Record<OrganicStructurePattern, readonly ProblemTemplate[]> = {
  methane: [
    {
      prompt: 'CH₄ の4本のC–H結合をつくる炭素の混成軌道は？',
      answer: '4つの等価なsp³混成軌道',
      distractors: ['3つのsp²混成軌道と未混成p軌道', '2つのsp混成軌道と2つの未混成p軌道'],
      explanation: '炭素の2s軌道と3つの2p軌道が混成し、4つの等価なsp³軌道をつくります。',
    },
    {
      prompt: 'メタンの結合角が約109.5°になる理由として適切なのは？',
      answer: '4つの結合が正四面体の頂点方向に広がるため',
      distractors: ['原子が同一平面に並ぶため約120°になる', '2本の結合だけが反対向きに並ぶため180°になる'],
      explanation: '4本の結合電子対が互いの反発を小さくするよう空間に広がり、正四面体形になります。',
    },
  ],
  ethane: [
    {
      prompt: 'エタンのC–C結合を回転すると、重なり型がねじれ型より不安定になる主な理由は？',
      answer: 'C–H結合の電子雲どうしのねじれひずみが大きくなるため',
      distractors: ['単結合が回転すると必ずπ結合が切れるため', '重なり型では炭素がsp混成に変わるため'],
      explanation: '重なり型では隣り合うC–H結合が正面から重なり、ねじれひずみが増します。',
    },
    {
      prompt: 'エタンのねじれ型配座から重なり型配座へ移るときに起こることは？',
      answer: 'C–C単結合まわりの回転で配座が変わり、結合自体は切れない',
      distractors: ['C–C結合が切れて別々のメチルラジカルになる', 'C–C結合が二重結合になり回転できなくなる'],
      explanation: 'エタンの配座変換はC–C単結合まわりの回転で起こり、分子の結合関係は保たれます。',
    },
  ],
  ethylene: [
    {
      prompt: 'エチレンのC=C二重結合をつくる結合の組合せは？',
      answer: 'σ結合1本とπ結合1本',
      distractors: ['σ結合2本', 'π結合2本'],
      explanation: '二重結合は、原子核を結ぶ軸方向のσ結合と、軸の上下に広がるπ結合からなります。',
    },
    {
      prompt: 'エチレンのC=Cを保ったまま、片側の炭素だけを回転させにくい理由は？',
      answer: '回転でp軌道の横向きの重なりが失われ、π結合を保てないため',
      distractors: ['σ結合が完全に消えて分子がイオンになるため', '水素原子が回転を機械的に止めているため'],
      explanation: 'π結合は2つのp軌道が平行に横向きに重なることででき、回転するとその重なりが崩れます。',
    },
  ],
  acetylene: [
    {
      prompt: 'アセチレンのC≡C三重結合を構成する結合の内訳は？',
      answer: 'σ結合1本とπ結合2本',
      distractors: ['σ結合3本', 'π結合1本だけ'],
      explanation: '三重結合では、軸方向のσ結合1本に加え、互いに直交する2つのp軌道からπ結合2本ができます。',
    },
    {
      prompt: 'アセチレン分子 H–C≡C–H の形と結合角は？',
      answer: '直線形で180°',
      distractors: ['平面三角形で約120°', '正四面体形で約109.5°'],
      explanation: '三重結合をもつ各炭素はsp混成で、結合方向が一直線になります。',
    },
  ],
  benzene: [
    {
      prompt: 'ベンゼンの6個のπ電子が環全体で非局在化する説明として適切なのは？',
      answer: '6π電子をもつ平面環で、芳香族性を示す',
      distractors: ['二重結合が1本だけで、残りは完全に孤立した単結合である', '環の炭素がsp³混成で、π電子をもたない'],
      explanation: 'ベンゼンは平面環状の共役系に6π電子をもち、電子が環全体に非局在化しています。',
    },
    {
      prompt: 'ベンゼンのC–C結合長がすべて等しい主な理由は？',
      answer: 'π電子が非局在化し、結合が単結合・二重結合に固定されていないため',
      distractors: ['炭素原子が交互にsp³とsp混成になるため', 'ベンゼン環が単結合だけで自由回転するため'],
      explanation: '共鳴構造の一方だけに固定されず、π電子が非局在化しているため6本のC–C結合は等価です。',
    },
  ],
  'cyclohexane-chair': [
    {
      prompt: 'シクロヘキサンの椅子型が舟型より安定な理由として適切なのは？',
      answer: '結合角ひずみとねじれひずみが小さいため',
      distractors: ['椅子型ではすべての結合が二重結合になるため', '舟型では炭素原子がsp混成になるため'],
      explanation: '椅子型では結合角がほぼ四面体角に近く、隣接結合もずれているためひずみが小さくなります。',
    },
    {
      prompt: 'シクロヘキサンが椅子型から別の椅子型へ環反転すると何が入れ替わる？',
      answer: 'アキシアル位とエクアトリアル位が入れ替わる',
      distractors: ['炭素骨格の結合順序が変わり、別の化合物になる', '二重結合の位置が一つずつ移動する'],
      explanation: '環反転では椅子型配座が別の椅子型へ移り、各置換基のアキシアル位・エクアトリアル位が交換されます。',
    },
  ],
  'cyclohexane-boat': [
    {
      prompt: '舟型シクロヘキサンで特に立体反発が生じる部分は？',
      answer: '両端で近づく旗竿水素どうし',
      distractors: ['環の中心で重なるπ電子どうし', '椅子型のアキシアル水素だけ'],
      explanation: '舟型では両端の旗竿水素が近づいて立体反発を生じ、椅子型より高エネルギーになります。',
    },
    {
      prompt: 'ねじれ舟型のエネルギーを、舟型と椅子型に比べた説明として正しいのは？',
      answer: '椅子型より高いが、舟型より低い',
      distractors: ['椅子型より低く、最も安定である', '舟型より高く、最も不安定である'],
      explanation: 'ねじれ舟型は舟型の旗竿水素反発を緩和するため、舟型より安定ですが、椅子型よりは高エネルギーです。',
    },
  ],
  'cis-2-butene': [
    {
      prompt: 'シス-2-ブテンで、C=Cの各炭素に結合するメチル基の配置は？',
      answer: '2つのメチル基が二重結合の同じ側にある',
      distractors: ['2つのメチル基が二重結合の反対側にある', 'メチル基が同一炭素に2つとも結合している'],
      explanation: 'シス配置では、二重結合を基準に同じ種類の置換基が同じ側にあります。',
    },
    {
      prompt: 'シス-2-ブテンからトランス-2-ブテンへ変わるとき、通常必要なことは？',
      answer: 'C=Cのπ結合を一時的に失うなど、二重結合まわりの回転を可能にすること',
      distractors: ['C=Cを保ったまま単結合の回転だけを行うこと', '水素原子を一つ付加してから回転させること'],
      explanation: '通常の条件ではC=Cのπ結合が回転を妨げるため、単結合のように自由回転してシス・トランスが変わるわけではありません。',
    },
  ],
  'trans-2-butene': [
    {
      prompt: 'トランス-2-ブテンがシス体より安定になりやすい主な理由は？',
      answer: 'メチル基どうしが離れ、立体反発が小さいため',
      distractors: ['トランス体だけにC≡C三重結合があるため', 'トランス体ではπ結合がなくなるため'],
      explanation: 'トランス配置ではメチル基が二重結合の反対側にあり、シス体より置換基間の立体反発が小さくなります。',
    },
    {
      prompt: 'トランス-2-ブテンの構造について正しいものは？',
      answer: 'C=Cの両炭素に結合したメチル基が反対側に配置する',
      distractors: ['C=Cの両炭素に結合したメチル基が同じ側に配置する', 'C=Cを保ったまま自由回転して配置を変えられる'],
      explanation: 'トランス配置では、二重結合を基準に同じ種類の置換基が反対側にあります。',
    },
  ],
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
  const questionPickers = new Map(organicStructurePatterns.map(pattern => [pattern, new BalancedRandom([0, 1, 2])] as const));
  return (mode: OrganicStructureMode = 'mix', random: () => number = Math.random): OrganicStructureProblem => {
    const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
    const choices = [templates[pattern], ...additionalTemplates[pattern]];
    const templateIndex = questionPickers.get(pattern)!.next(random);
    const template = choices[templateIndex];
    return {
      pattern,
      prompt: template.prompt,
      choices: shuffled([template.answer, ...template.distractors], random),
      answer: template.answer,
      explanation: template.explanation,
    };
  };
}
