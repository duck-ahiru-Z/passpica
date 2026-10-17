import { BalancedRandom } from './balancedRandom.ts';

export type Math1Area = 'expression' | 'quadratic' | 'trigonometry' | 'probability';
export type Math1Mode = Math1Area | 'all';
export type Math1Question = { area: Math1Area; label: string; prompt: string; options: string[]; answer: string; explanation: string };

export const math1Areas: readonly Math1Area[] = ['expression', 'quadratic', 'trigonometry', 'probability'];
export const math1Labels: Record<Math1Area, string> = { expression: '数と式', quadratic: '二次関数', trigonometry: '三角比', probability: '確率' };

const questions: Record<Math1Area, Math1Question[]> = {
  expression: [
    { area: 'expression', label: '数と式', prompt: '二重根号 √(7+4√3) を外すとき、最初に考える形は？', options: ['(√a+√b)²', '(√a−√b)²', '共通因数でくくる', '有理化して分母を消す'], answer: '(√a+√b)²', explanation: 'a+b=7、2√ab=4√3 となる平方の形を探すと、a=4、b=3。' },
    { area: 'expression', label: '数と式', prompt: 'x²+7x+12 を因数分解するとき、探す2数の条件は？', options: ['和が7、積が12', '和が12、積が7', '差が7、積が12', '和が7、差が12'], answer: '和が7、積が12', explanation: 'x²+bx+c では、和が b、積が c となる2数を探す。3と4より (x+3)(x+4)。' },
    { area: 'expression', label: '数と式', prompt: '1/(√5−2) を簡単にするとき、分母に掛けるものは？', options: ['√5+2', '√5−2', '√5', '2'], answer: '√5+2', explanation: '共役な式を掛けると分母は (√5−2)(√5+2)=1 となる。' },
    { area: 'expression', label: '数と式', prompt: '√12+√27 を簡単にするとき、まず行う変形は？', options: ['平方数を外に出す', '共役を掛ける', '分母を有理化する', '根号の中を足す'], answer: '平方数を外に出す', explanation: '√12=2√3、√27=3√3 とし、合わせて 5√3。' },
    { area: 'expression', label: '数と式', prompt: 'x²=11 を実数の範囲で解くとき、忘れてはいけないことは？', options: ['平方根の正負を両方とる', '平方根の正の値だけをとる', '両辺を2乗する', '判別式で重解を調べる'], answer: '平方根の正負を両方とる', explanation: 'x²=11 なら x=±√11。2乗の逆では正負両方を確認する。' },
  ],
  quadratic: [
    { area: 'quadratic', label: '二次関数', prompt: 'y=x²−4x+1 の 0≤x≤3 での最大・最小を調べる最初の確認は？', options: ['頂点と定義域の位置、端点の値', '端点の値だけを比較', '判別式だけを計算', 'y切片だけを調べる'], answer: '頂点と定義域の位置、端点の値', explanation: '平方完成して頂点の位置を確かめ、定義域内の頂点と両端点を比較する。' },
    { area: 'quadratic', label: '二次関数', prompt: '2x²−5x+2=0 の実数解の個数を、解を求めずに判断する方法は？', options: ['判別式の符号を調べる', '軸の傾きを調べる', 'y切片だけを見る', '解の和と積だけを比べる'], answer: '判別式の符号を調べる', explanation: '判別式 D=b²−4ac。D>0 なので異なる2つの実数解をもつ。' },
    { area: 'quadratic', label: '二次関数', prompt: 'y=−2(x−1)²+5 の最大値を読むとき、注目するのは？', options: ['頂点の y 座標', 'x切片の大きさ', '判別式の値', 'y切片'], answer: '頂点の y 座標', explanation: '係数が負なので上に凸。頂点 (1,5) で最大値 5。' },
    { area: 'quadratic', label: '二次関数', prompt: '放物線 y=x² と直線 y=2x+3 の交点を求める最初の操作は？', options: ['2つの y を等しいとおく', '傾きを掛ける', '判別式をそれぞれ計算する', '頂点の y 座標を比べる'], answer: '2つの y を等しいとおく', explanation: '交点では y 座標が等しいので x²=2x+3 として解く。' },
    { area: 'quadratic', label: '二次関数', prompt: 'y=−x²+6x−1 の最大値を求めるのに便利な変形は？', options: ['平方完成', '因数分解だけ', '分母の有理化', '三角比の相互関係'], answer: '平方完成', explanation: 'y=−(x−3)²+8 より、最大値は 8。' },
  ],
  trigonometry: [
    { area: 'trigonometry', label: '三角比', prompt: '3辺が与えられた三角形で角を求めるとき、まず使う公式は？', options: ['余弦定理', '正弦定理', '三角形の面積公式', 'sin²θ+cos²θ=1'], answer: '余弦定理', explanation: '3辺から角を求める場合は余弦定理で cos の値を出す。' },
    { area: 'trigonometry', label: '三角比', prompt: '角 A、角 B と辺 a が分かる三角形で、辺 b を求める公式は？', options: ['正弦定理', '余弦定理', '面積公式', '三平方の定理'], answer: '正弦定理', explanation: 'a/sin A=b/sin B より、b=a sin B/sin A。' },
    { area: 'trigonometry', label: '三角比', prompt: '2辺とその間の角から三角形の面積を求める公式は？', options: ['(1/2)ab sin C', 'ab cos C', 'a+b+c', 'a²+b²−2ab cos C'], answer: '(1/2)ab sin C', explanation: '底辺を a、高さを b sin C とみて、面積=(1/2)ab sin C。' },
    { area: 'trigonometry', label: '三角比', prompt: '水平距離 d と仰角 θ から高さ h を求める関係は？', options: ['tan θ=h/d', 'sin θ=h/d', 'cos θ=h/d', 'tan θ=d/h'], answer: 'tan θ=h/d', explanation: 'tan θ=高さ/水平距離=h/d なので h=d tan θ。' },
    { area: 'trigonometry', label: '三角比', prompt: '1辺とその対角が分かっていて、別の対角の対辺を求める方法は？', options: ['正弦定理', '余弦定理', '面積公式', '三平方の定理'], answer: '正弦定理', explanation: '既知の辺とその対角の比を使い、a/sin A=b/sin B とする。' },
  ],
  probability: [
    { area: 'probability', label: '確率', prompt: '「少なくとも1回成功」の確率を求めるときの定石は？', options: ['余事象を使う', '場合の数を直接数える', '条件付き確率に分ける', '反復試行の公式を必ず使う'], answer: '余事象を使う', explanation: '1回も成功しない確率を求めて 1 から引くと簡潔。' },
    { area: 'probability', label: '確率', prompt: '8人から順番を考えず3人を選ぶ場合の数に使うものは？', options: ['組合せ', '順列', '階乗だけ', '余事象'], answer: '組合せ', explanation: '選ぶ順序を区別しないので 8C3=56。' },
    { area: 'probability', label: '確率', prompt: '5人を一列に並べる場合の数を求めるとき、使うものは？', options: ['順列', '組合せ', '反復試行', '条件付き確率'], answer: '順列', explanation: '並ぶ順序を区別するので 5!=120。' },
    { area: 'probability', label: '確率', prompt: '条件によって分岐する試行を整理して確率を求めるのに適した図は？', options: ['樹形図', 'ベン図だけ', '散布図', '度数分布表'], answer: '樹形図', explanation: '各段階の分岐と条件付きの確率を枝で整理し、必要な経路を掛け合わせる。' },
    { area: 'probability', label: '確率', prompt: '成功確率 1/3 の独立試行を4回行い、ちょうど2回成功する確率の方法は？', options: ['二項分布（反復試行）', '余事象だけ', '順列だけ', '条件付き確率だけ'], answer: '二項分布（反復試行）', explanation: '4C2(1/3)²(2/3)² の形で、成功回数がちょうど2回の経路を数える。' },
  ],
};

const areaPicker = new BalancedRandom(math1Areas);
const questionPickers = new Map(math1Areas.map(area => [area, new BalancedRandom(questions[area])]));

export function generateMath1Question(mode: Math1Mode, random = Math.random): Math1Question {
  const area = mode === 'all' ? areaPicker.next(random) : mode;
  return questionPickers.get(area)!.next(random);
}
