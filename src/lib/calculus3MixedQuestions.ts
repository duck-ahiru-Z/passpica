import { BalancedRandom } from './balancedRandom.ts';

export type Calculus3Area = 'limit' | 'differentiation' | 'integral' | 'geometry' | 'differential-equation';
export type Calculus3Question = { area: Calculus3Area; areaLabel: string; prompt: string; options: string[]; answer: string; explanation: string };
export type Calculus3MixedMode = 'all' | Calculus3Area;

export const calculus3Questions: readonly Calculus3Question[] = [
  { area: 'limit', areaLabel: '極限', prompt: 'lim x→0 (sin x / x) を考えるとき、中心となる見方は？', options: ['基本極限・はさみうち', '最高次の項を比較', 'テイラー展開', '連続性から代入'], answer: '基本極限・はさみうち', explanation: 'sin x / x の基本極限を軸に、必要なら不等式ではさんで極限値を確定します。' },
  { area: 'limit', areaLabel: '極限', prompt: 'lim x→∞ (3x²−1)/(x²+2) の方針は？', options: ['最高次の項を比較', '基本極限を利用', '有理化', 'はさみうち'], answer: '最高次の項を比較', explanation: '分子・分母を x² で割ると、最高次係数の比 3 が残ります。' },
  { area: 'differentiation', areaLabel: '微分法', prompt: 'y = log(sin x) を微分するとき、最初に意識する方法は？', options: ['合成関数の微分', '積の微分', '商の微分', '媒介変数表示の微分'], answer: '合成関数の微分', explanation: '外側の log と内側の sin x を分け、(log u)ʼ = uʼ/u を使います。' },
  { area: 'differentiation', areaLabel: '微分法', prompt: 'x = t², y = t³ の dy/dx を求める方法は？', options: ['媒介変数表示の微分', '合成関数の微分', '対数微分', '陰関数の微分'], answer: '媒介変数表示の微分', explanation: 'dx/dt と dy/dt を求め、dy/dx = (dy/dt)/(dx/dt) とします。' },
  { area: 'integral', areaLabel: '積分法', prompt: '∫ x cos(x²) dx に最初に試す方法は？', options: ['置換積分', '部分積分', '部分分数分解', '三角関数の積分公式'], answer: '置換積分', explanation: 'u = x² と置けば du = 2x dx となり、積分が直接簡単になります。' },
  { area: 'integral', areaLabel: '積分法', prompt: '∫ x eˣ dx に最初に試す方法は？', options: ['部分積分', '置換積分', '部分分数分解', '三角関数の積分公式'], answer: '部分積分', explanation: '多項式 x と eˣ の積なので、部分積分で x の次数を下げます。' },
  { area: 'geometry', areaLabel: '面積・体積', prompt: 'x≥0 の範囲で、曲線 y=f(x) と x軸で囲まれた領域を y軸のまわりに回転する体積は？', options: ['円筒殻法を検討', '断面積を積分', '上下関係と交点を確認', '媒介変数で曲線を追う'], answer: '円筒殻法を検討', explanation: 'x を半径とする薄い円筒殻を考えると、2πx・高さ・dx の形で立式できます。' },
  { area: 'geometry', areaLabel: '面積・体積', prompt: '2曲線の間の面積を求める最初の確認は？', options: ['上下関係と交点', '円筒殻法', '断面積の積分', '曲線の長さの公式'], answer: '上下関係と交点', explanation: '交点で積分区間を決め、上の関数−下の関数を積分します。' },
  { area: 'differential-equation', areaLabel: '微分方程式', prompt: 'dy/dx = 3x²y の一般解を求める最初の方針は？', options: ['変数分離', '初期条件を先に代入', '両辺をそのまま積分', '速度と位置の関係を使う'], answer: '変数分離', explanation: 'y≠0 なら dy/y = 3x²dx と変形して積分します。さらに y=0 も解で、一般解 y=Ce^(x³) に含まれます。' },
  { area: 'differential-equation', areaLabel: '微分方程式', prompt: '速度 v(t) が与えられ、初期位置も指定されているとき位置を求める方法は？', options: ['速度を積分して初期条件を使う', '変数分離', '初期条件を使わず定数を0にする', '加速度をもう一度微分する'], answer: '速度を積分して初期条件を使う', explanation: '位置の導関数が速度なので、v(t) を積分して積分定数を初期位置で決めます。' },
];

const areas: Calculus3Area[] = ['limit', 'differentiation', 'integral', 'geometry', 'differential-equation'];

function permutations(values: number[]): number[][] {
  if (values.length === 0) return [[]];
  return values.flatMap((value, index) => permutations(values.filter((_, current) => current !== index)).map(rest => [value, ...rest]));
}

export function createCalculus3MixedQuestionPicker() {
  const allQuestions = new BalancedRandom(calculus3Questions);
  const areaQuestions = new Map(areas.map(area => [area, new BalancedRandom(calculus3Questions.filter(question => question.area === area))]));
  const optionOrders = new BalancedRandom(permutations([0, 1, 2, 3]));

  return {
    next(mode: Calculus3MixedMode = 'all', random = Math.random): Calculus3Question {
      const question = mode === 'all' ? allQuestions.next(random) : areaQuestions.get(mode)!.next(random);
      const order = optionOrders.next(random);
      return { ...question, options: order.map(index => question.options[index]) };
    },
  };
}
