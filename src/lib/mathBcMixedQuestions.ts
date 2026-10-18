import { BalancedRandom } from './balancedRandom.ts';

export type MathBcArea = 'sequence' | 'sigma' | 'vector' | 'complex' | 'conic';
export type MathBcMode = MathBcArea | 'all';
export type MathBcQuestion = { area: MathBcArea; subject: string; prompt: string; answer: string; options: string[]; explanation: string };
export const mathBcAreas: readonly MathBcArea[] = ['sequence', 'sigma', 'vector', 'complex', 'conic'];
export const mathBcLabels: Record<MathBcArea, string> = { sequence: '数列', sigma: '数列の和', vector: 'ベクトル', complex: '複素数平面', conic: '図形と方程式' };

const questions: Record<MathBcArea, MathBcQuestion[]> = {
  sequence: [
    { area: 'sequence', subject: '数学B', prompt: 'aₙ₊₁=aₙ+3、a₁=2 の一般項を求めるときの見方は？', answer: '等差数列の一般項', options: ['等差数列の一般項', '定常値を引く', '階差をとる', '特性方程式'], explanation: '公差3の等差数列なので aₙ=2+3(n−1)=3n−1。' },
    { area: 'sequence', subject: '数学B', prompt: 'aₙ₊₁=2aₙ+3 のような一次漸化式を解く基本方針は？', answer: '定常値を引いて等比数列にする', options: ['定常値を引いて等比数列にする', '階差をとって和に戻す', '特性方程式を立てる', '初項と公比を推定する'], explanation: '定常値 L=2L+3 を満たす L=−3 を引くと aₙ₊₁+3=2(aₙ+3)。' },
    { area: 'sequence', subject: '数学B', prompt: '初項3、公比2の等比数列の初項から第n項までの和を求める式は？', answer: '初項×(公比ⁿ−1)/(公比−1)', options: ['初項×(公比ⁿ−1)/(公比−1)', '初項×n(n+1)/2', '初項+(n−1)公差', '末項−初項'], explanation: 'Sₙ=3(2ⁿ−1)/(2−1)=3(2ⁿ−1)。' },
    { area: 'sequence', subject: '数学B', prompt: 'n→∞で (5n²+1)/(2n²−3n) の極限を求める方針は？', answer: '分子・分母を最高次のn²で割る', options: ['分子・分母を最高次のn²で割る', '最初の数項を足す', '階差数列にする', '分母を0とおく'], explanation: '最高次の係数比が残り、極限は5/2。' },
    { area: 'sequence', subject: '数学B', prompt: 'Σk を使って 1+2+…+n の公式を証明するときに適した方法は？', answer: '数学的帰納法', options: ['数学的帰納法', '背理法だけ', '余弦定理', '部分積分'], explanation: 'n=1で成り立つことと、nで成り立つならn+1でも成り立つことを示す。' },
  ],
  sigma: [
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=1..n) k を計算するときに使う公式は？', answer: 'n(n+1)/2', options: ['n(n+1)/2', 'n(n+1)(2n+1)/6', 'n²', '2ⁿ−1'], explanation: '1からnまでの和は n(n+1)/2。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=1..n) k² を計算するときに使う公式は？', answer: 'n(n+1)(2n+1)/6', options: ['n(n+1)(2n+1)/6', 'n(n+1)/2', 'n³', 'n(n−1)/2'], explanation: '平方和の公式 Σk²=n(n+1)(2n+1)/6。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=0..n−1) 3·2ᵏ の和を求めるときの基本公式は？', answer: '等比数列の和', options: ['等比数列の和', '平方和', '階差数列の和', '部分積分'], explanation: '初項3、公比2なので和は3(2ⁿ−1)/(2−1)=3(2ⁿ−1)。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=1..n) 1/[k(k+1)] を簡単にする変形は？', answer: '部分分数分解して望遠鏡和にする', options: ['部分分数分解して望遠鏡和にする', '等比数列とみなす', '平方和の公式を使う', '各項を二乗する'], explanation: '1/[k(k+1)]=1/k−1/(k+1) と分解すると隣り合う項が消え、和は1−1/(n+1)。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=1..n) (2k+1) を計算する簡潔な方針は？', answer: '和の線形性でΣkとΣ1に分ける', options: ['和の線形性でΣkとΣ1に分ける', '部分分数分解', '等比数列の和だけ使う', '階差を2回とる'], explanation: '2Σk+Σ1=n(n+1)+n=n(n+2)。' },
  ],
  vector: [
    { area: 'vector', subject: '数学C', prompt: '2ベクトルのなす角を内積から求める関係式は？', answer: 'a・b=|a||b|cosθ', options: ['a・b=|a||b|cosθ', 'a・b=|a|+|b|', 'a×b=|a||b|cosθ', '|a+b|=|a|+|b|'], explanation: '内積の定義から cosθ=(a・b)/(|a||b|)。' },
    { area: 'vector', subject: '数学C', prompt: '空間ベクトルで2直線の交点の有無を調べるとき、見る条件は？', answer: '方向ベクトルと交点の連立条件', options: ['方向ベクトルと交点の連立条件', '内積が必ず0か', '位置ベクトルの長さだけ', '2直線の切片だけ'], explanation: '各直線の媒介変数表示を等しいとおき、連立条件が解けるかを確かめる。' },
    { area: 'vector', subject: '数学C', prompt: '点Pが線分ABを AP:PB=2:1 に内分するとき、位置ベクトルpは？', answer: '(a+2b)/3', options: ['(a+2b)/3', '(2a+b)/3', '2a+b', '(a+b)/2'], explanation: '内分点は重みを反対側に置き、p=(1·a+2·b)/(2+1)。' },
    { area: 'vector', subject: '数学C', prompt: '2直線が垂直かどうかを方向ベクトルから調べる条件は？', answer: '方向ベクトルの内積が0', options: ['方向ベクトルの内積が0', '方向ベクトルが等しい', '位置ベクトルの和が0', '方向ベクトルの長さが1'], explanation: '方向ベクトル同士の内積が0なら直交する。' },
    { area: 'vector', subject: '数学C', prompt: '三角形の重心Gの位置ベクトルを頂点a,b,cから求める式は？', answer: '(a+b+c)/3', options: ['(a+b+c)/3', '(a+b+c)/2', 'a+b+c', '(a+b)/2'], explanation: '重心の位置ベクトルは3頂点の位置ベクトルの平均。' },
  ],
  complex: [
    { area: 'complex', subject: '数学C', prompt: '極形式で複素数どうしを掛けるときの計算規則は？', answer: '絶対値を掛け、偏角を足す', options: ['絶対値を掛け、偏角を足す', '絶対値を足し、偏角を掛ける', '絶対値を引き、偏角を足す', '実部と虚部をそれぞれ割る'], explanation: 're^{iα}·se^{iβ}=rs e^{i(α+β)}。' },
    { area: 'complex', subject: '数学C', prompt: 'z³=1 の複素数解を漏れなく求めるとき、使う考え方は？', answer: '1の3乗根を極形式と偏角で表す', options: ['1の3乗根を極形式と偏角で表す', '実数の平方根だけをとる', '絶対値を0にする', '共役を足す'], explanation: '偏角が2kπ/3 (k=0,1,2) の3点が解になる。' },
    { area: 'complex', subject: '数学C', prompt: '|z−(2+i)|=3 が複素数平面で表す図形は？', answer: '中心2+i、半径3の円', options: ['中心2+i、半径3の円', '中心0、半径3の円', '直線 x=2', '半径2の円'], explanation: '|z−a|=r は点aからの距離がrである点の集合。' },
    { area: 'complex', subject: '数学C', prompt: 'z=−1+√3i の偏角を定めるとき、まず確認するものは？', answer: '実部・虚部の符号から象限を決める', options: ['実部・虚部の符号から象限を決める', '絶対値だけを見る', '共役複素数を求める', '実部と虚部を足す'], explanation: '実部<0、虚部>0なので第2象限。基準角π/3より偏角は2π/3。' },
    { area: 'complex', subject: '数学C', prompt: '複素数 z に i を掛けたとき、複素数平面上で起こる変換は？', answer: '原点中心に反時計回り90°回転', options: ['原点中心に反時計回り90°回転', '原点中心に180°回転', '実軸に関する対称移動', '絶対値が2倍'], explanation: 'i=e^{iπ/2} なので、掛けると偏角がπ/2増える。' },
  ],
  conic: [
    { area: 'conic', subject: '数学C', prompt: '楕円 x²/9+y²/4=1 の長軸の向きを判断するには？', answer: '分母の大きい項の軸を見る', options: ['分母の大きい項の軸を見る', '分母の小さい項の軸を見る', '焦点の符号だけを見る', '判別式だけを計算する'], explanation: 'x²の分母9が大きいので長軸はx軸方向。' },
    { area: 'conic', subject: '数学C', prompt: '双曲線 x²/4−y²/9=1 の漸近線を求める基本式は？', answer: 'y=±(b/a)x', options: ['y=±(b/a)x', 'y=±(a/b)x', 'y=±abx', 'y=±(a+b)x'], explanation: 'x²/a²−y²/b²=1 の漸近線は y=±(b/a)x。ここでは y=±(3/2)x。' },
    { area: 'conic', subject: '数学C', prompt: '放物線の焦点・準線が与えられたとき、軌跡条件を式にする方法は？', answer: '焦点までの距離と準線までの距離を等しくする', options: ['焦点までの距離と準線までの距離を等しくする', '焦点までの距離を2乗して0とおく', '準線との傾きを等しくする', '中心からの距離を一定にする'], explanation: '放物線は焦点と準線からの距離が等しい点の軌跡。' },
    { area: 'conic', subject: '数学C', prompt: '楕円の接線を接点を使って求めるときの基本方針は？', answer: '標準形の接線公式を接点に適用する', options: ['標準形の接線公式を接点に適用する', '判別式を正にする', '焦点同士を結ぶ', '偏心率だけ計算する'], explanation: 'x²/a²+y²/b²=1 上の接点(x₁,y₁)では xx₁/a²+yy₁/b²=1。' },
    { area: 'conic', subject: '数学C', prompt: '直線と円錐曲線が接する条件を、代入後の二次方程式で調べる方法は？', answer: '判別式を0とおく', options: ['判別式を0とおく', '判別式を正にする', '係数をすべて1にする', '焦点を通る条件を使う'], explanation: '接点が1つとなるので、代入後の二次方程式は重解をもち D=0。' },
  ],
};

const areaPicker = new BalancedRandom(mathBcAreas);
const questionPickers = new Map(mathBcAreas.map(area => [area, new BalancedRandom(questions[area])]));
export function generateMathBcQuestion(mode: MathBcMode, random = Math.random): MathBcQuestion {
  const area = mode === 'all' ? areaPicker.next(random) : mode;
  return questionPickers.get(area)!.next(random);
}
