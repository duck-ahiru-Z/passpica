import { BalancedRandom } from './balancedRandom.ts';

export type Math2Area = 'calculus' | 'trig' | 'log' | 'geometry';
export type Math2Mode = Math2Area | 'all';
export type Math2Question = { area: Math2Area; prompt: string; answer: string; options: string[]; explanation: string };
export const math2Areas: readonly Math2Area[] = ['calculus', 'trig', 'log', 'geometry'];
export const math2Labels: Record<Math2Area, string> = { calculus: '微分・積分', trig: '三角関数', log: '指数・対数', geometry: '図形と方程式' };

const questions: Record<Math2Area, Math2Question[]> = {
  calculus: [
    { area: 'calculus', prompt: 'y=(3x+1)⁴ を微分するとき、中心となる法則は？', answer: '合成関数の微分', options: ['合成関数の微分', '積の微分', '商の微分', '部分積分'], explanation: '外側の4乗を微分し、内側の微分3を掛ける。y′=12(3x+1)³。' },
    { area: 'calculus', prompt: 'y=x² sin x を微分するとき、使う公式は？', answer: '積の微分', options: ['積の微分', '合成関数の微分だけ', '商の微分', '置換積分'], explanation: '(x²)′sin x+x²(sin x)′=2x sin x+x² cos x。' },
    { area: 'calculus', prompt: '∫ x/(x²+1) dx に最初に試す方法は？', answer: '置換積分', options: ['置換積分', '部分積分', '部分分数分解', '三角置換'], explanation: 'u=x²+1 とおけば du=2x dx となり、対数積分に変わる。' },
    { area: 'calculus', prompt: '∫ x eˣ dx に最初に試す方法は？', answer: '部分積分', options: ['部分積分', '置換積分', '部分分数分解', '三角関数の公式'], explanation: '多項式と指数関数の積なので、x の次数を下げる部分積分が有効。' },
    { area: 'calculus', prompt: '曲線 y=x と y=x² に囲まれた面積を求める前に確認することは？', answer: '交点と上下関係', options: ['交点と上下関係', '導関数の最大値だけ', '不定積分の定数', '接線の傾き'], explanation: '交点で積分区間を決め、区間内で上の関数−下の関数を積分する。' },
  ],
  trig: [
    { area: 'trig', prompt: 'sin 2x を sin x、cos x で表すときに使う公式は？', answer: '二倍角公式', options: ['二倍角公式', '加法定理だけ', '半角公式', '正弦定理'], explanation: 'sin 2x=2 sin x cos x。' },
    { area: 'trig', prompt: 'sin x+cos x の最大値を求めるときの基本方針は？', answer: '三角関数の合成', options: ['三角関数の合成', '相互関係で cos x を消去', '二倍角で積にする', '正弦定理'], explanation: '√2 sin(x+π/4) と合成すると最大値は √2。' },
    { area: 'trig', prompt: '0≤x<2π で 2sin x=1 を解くとき、解の範囲を絞るのに見るものは？', answer: '単位円で sin の符号と値を確認', options: ['単位円で sin の符号と値を確認', 'cos の加法定理', '三角形の余弦定理', '周期を無視して逆関数だけ使う'], explanation: 'sin x=1/2 となる単位円上の2点から x=π/6、5π/6。' },
    { area: 'trig', prompt: 'tan x=√3、0<x<π/2 の解を求めるときの基本方針は？', answer: '基本角と tan の値を対応させる', options: ['基本角と tan の値を対応させる', '正弦定理', '二倍角で sin を消す', '周期を無視する'], explanation: 'tan(π/3)=√3 で範囲内なので x=π/3。' },
    { area: 'trig', prompt: 'y=2sin(3x) の周期を求めるときの関係は？', answer: '2πを角の係数の絶対値で割る', options: ['2πを角の係数の絶対値で割る', '振幅を角の係数で割る', '2πに角の係数を足す', '振幅だけを見る'], explanation: 'sin(kx) の周期は 2π/|k|。ここでは 2π/3。' },
  ],
  log: [
    { area: 'log', prompt: 'logₐ(x−1)+logₐ(x+1) を扱う前に必要な確認は？', answer: '真数条件', options: ['真数条件', '底の条件だけ', '対数の和を積にまとめる', '指数に戻す'], explanation: '両方の真数が正である範囲を先に求める。' },
    { area: 'log', prompt: '2ˣ⁺¹=16 を解くときの基本方針は？', answer: '両辺を同じ底の累乗に直す', options: ['両辺を同じ底の累乗に直す', '真数条件を調べる', '底の変換公式を使う', '平方完成'], explanation: '16=2⁴ より x+1=4、したがって x=3。' },
    { area: 'log', prompt: 'log₂8+log₂4 を計算するとき、まず使う性質は？', answer: '対数の和を積にまとめる', options: ['対数の和を積にまとめる', '真数を引き算する', '底を入れ替える', '対数を無視する'], explanation: 'log₂8+log₂4=log₂(32)=5。' },
    { area: 'log', prompt: '底 a が 1 より大きいとき、logₐx の大小を不等式で扱う基本は？', answer: '対数関数が増加することを使う', options: ['対数関数が増加することを使う', '不等号を必ず反転する', '真数を必ず掛ける', '底を0にする'], explanation: 'a>1 なら logₐx は増加関数なので、不等号の向きは保たれる。' },
    { area: 'log', prompt: 'log₃(x−1)+log₃(x+1)=2 を解くとき、式変形の後に必ず行う確認は？', answer: '真数条件と解の適否', options: ['真数条件と解の適否', '判別式の符号だけ', '底の変換だけ', '解を二乗して戻す'], explanation: '積にまとめて二次方程式を解いた後、x>1 を満たす解だけを採用する。' },
  ],
  geometry: [
    { area: 'geometry', prompt: '点と直線の距離を求めるとき、直線をどの形に整理する？', answer: 'Ax+By+C=0', options: ['Ax+By+C=0', 'y=mx²+n', 'x²+y²=r', 'y=ax+b のまま係数を使わない'], explanation: '一般形にして d=|Ax₀+By₀+C|/√(A²+B²) を使う。' },
    { area: 'geometry', prompt: 'x²+y²−4x+2y−4=0 の円の中心・半径を読む変形は？', answer: 'x、yそれぞれ平方完成', options: ['x、yそれぞれ平方完成', '因数分解だけ', '判別式だけ', '極形式に直す'], explanation: '(x−2)²+(y+1)²=9 より中心(2,−1)、半径3。' },
    { area: 'geometry', prompt: '2直線の交点を求める基本操作は？', answer: '2直線の方程式を連立する', options: ['2直線の方程式を連立する', '傾きを掛ける', '距離公式に代入する', '片方を平方完成する'], explanation: '交点は両方の直線を満たすので、連立方程式の解になる。' },
    { area: 'geometry', prompt: '2点から等距離にある点の軌跡を考えるとき、最初に使う条件は？', answer: '2つの距離を等しいとおく', options: ['2つの距離を等しいとおく', '距離を足して一定にする', '内積を0にする', '傾きを同じにする'], explanation: '距離を等しいとおくと、2点を結ぶ線分の垂直二等分線が得られる。' },
    { area: 'geometry', prompt: '円と直線が接する条件を、連立した二次方程式から調べる方法は？', answer: '判別式を0とおく', options: ['判別式を0とおく', '判別式を正にする', '交点の中点を求める', '傾きの積を−1にする'], explanation: '接するとき共有点が1つ、つまり二次方程式が重解をもつので判別式D=0。' },
  ],
};

const areaPicker = new BalancedRandom(math2Areas);
const questionPickers = new Map(math2Areas.map(area => [area, new BalancedRandom(questions[area])]));
export function generateMath2Question(mode: Math2Mode, random = Math.random): Math2Question {
  const area = mode === 'all' ? areaPicker.next(random) : mode;
  return questionPickers.get(area)!.next(random);
}
