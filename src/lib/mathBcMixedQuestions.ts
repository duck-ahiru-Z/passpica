import { BalancedRandom } from './balancedRandom.ts';

export type MathBcArea = 'sequence' | 'sigma' | 'statistics' | 'vector' | 'complex' | 'conic';
export type MathBcMode = MathBcArea | 'all';
export type MathBcQuestion = { area: MathBcArea; subject: string; prompt: string; answer: string; options: string[]; explanation: string };
export const mathBcAreas: readonly MathBcArea[] = ['sequence', 'sigma', 'statistics', 'vector', 'complex', 'conic'];
export const mathBcLabels: Record<MathBcArea, string> = { sequence: '数列', sigma: '数列の和', statistics: '統計的な推測', vector: 'ベクトル', complex: '複素数平面', conic: '図形と方程式' };

const questions: Record<MathBcArea, MathBcQuestion[]> = {
  sequence: [
    { area: 'sequence', subject: '数学B', prompt: 'aₙ₊₁=aₙ+3、a₁=2 の一般項を求めるときの見方は？', answer: '等差数列の一般項', options: ['等差数列の一般項', '定常値を引く', '階差をとる', '特性方程式'], explanation: '公差3の等差数列なので aₙ=2+3(n−1)=3n−1。' },
    { area: 'sequence', subject: '数学B', prompt: 'aₙ₊₁=2aₙ+3 のような一次漸化式を解く基本方針は？', answer: '定常値を引いて等比数列にする', options: ['定常値を引いて等比数列にする', '階差をとって和に戻す', '特性方程式を立てる', '初項と公比を推定する'], explanation: '定常値 L=2L+3 を満たす L=−3 を引くと aₙ₊₁+3=2(aₙ+3)。' },
    { area: 'sequence', subject: '数学B', prompt: 'a₁=1、aₙ₊₁=2aₙ+1 のとき a₄ は？', answer: '15', options: ['15', '14', '8', '7'], explanation: 'a₂=3、a₃=7、a₄=15 と順に代入する。一般項ではaₙ=2ⁿ−1。' },
    { area: 'sequence', subject: '数学B', prompt: 'a₁=2、aₙ₊₁−aₙ=2n+1 のとき a₄ は？', answer: '17', options: ['17', '15', '16', '18'], explanation: '階差は3、5、7なので、a₄=2+3+5+7=17。' },
    { area: 'sequence', subject: '数学B', prompt: 'aₙ=2・3ⁿ⁻¹ を数学的帰納法で証明するとき、nからn+1へ進む計算は？', answer: 'aₙ₊₁=3aₙ=3・2・3ⁿ⁻¹=2・3ⁿ', options: ['aₙ₊₁=3aₙ=3・2・3ⁿ⁻¹=2・3ⁿ', 'aₙ₊₁=aₙ+3=2・3ⁿ', 'aₙ₊₁=2aₙ=2・3ⁿ⁻¹', 'aₙ₊₁=aₙ/3=2・3ⁿ'], explanation: '漸化式aₙ₊₁=3aₙと帰納法の仮定aₙ=2・3ⁿ⁻¹を使えば、次の項の式が得られる。' },
  ],
  sigma: [
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=1..n) k を計算するときに使う公式は？', answer: 'n(n+1)/2', options: ['n(n+1)/2', 'n(n+1)(2n+1)/6', 'n²', '2ⁿ−1'], explanation: '1からnまでの和は n(n+1)/2。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=1..n) k² を計算するときに使う公式は？', answer: 'n(n+1)(2n+1)/6', options: ['n(n+1)(2n+1)/6', 'n(n+1)/2', 'n³', 'n(n−1)/2'], explanation: '平方和の公式 Σk²=n(n+1)(2n+1)/6。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=0..n−1) 3·2ᵏ の和を求めるときの基本公式は？', answer: '等比数列の和', options: ['等比数列の和', '平方和', '階差数列の和', '部分積分'], explanation: '初項3、公比2なので和は3(2ⁿ−1)/(2−1)=3(2ⁿ−1)。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σ(k=1..n) 1/[k(k+1)] を簡単にする変形は？', answer: '部分分数分解して望遠鏡和にする', options: ['部分分数分解して望遠鏡和にする', '等比数列とみなす', '平方和の公式を使う', '各項を二乗する'], explanation: '1/[k(k+1)]=1/k−1/(k+1) と分解すると隣り合う項が消え、和は1−1/(n+1)。' },
    { area: 'sigma', subject: '数学B', prompt: 'Σk の公式を数学的帰納法で証明するとき、nからn+1へ進む段階で示す等式は？', answer: 'n(n+1)/2+(n+1)=(n+1)(n+2)/2', options: ['n(n+1)/2+(n+1)=(n+1)(n+2)/2', 'n(n+1)/2+n=(n+2)(n+3)/2', 'n(n+1)/2×(n+1)=(n+1)(n+2)/2', 'n(n+1)/2−(n+1)=(n+1)(n+2)/2'], explanation: '仮定の和に次の項n+1を加え、(n+1)(n+2)/2に整理して帰納段階を示す。' },
  ],
  statistics: [
    { area: 'statistics', subject: '数学B', prompt: '母標準偏差6の母集団から大きさ36の標本を無作為抽出した。標本平均の標準偏差は？', answer: '1', options: ['1', '6', '36', '1/6'], explanation: '標本平均の標準偏差（標準誤差）は σ/√n=6/6=1。' },
    { area: 'statistics', subject: '数学B', prompt: '標本平均 X̄ の期待値と標準偏差を表す組は？', answer: 'E(X̄)=μ、σ(X̄)=σ/√n', options: ['E(X̄)=μ、σ(X̄)=σ/√n', 'E(X̄)=nμ、σ(X̄)=nσ', 'E(X̄)=μ/n、σ(X̄)=σ/n', 'E(X̄)=σ、σ(X̄)=μ/√n'], explanation: '標本平均は母平均を中心とし、標準偏差は母標準偏差を√nで割った値。' },
    { area: 'statistics', subject: '数学B', prompt: '母比率0.4の集団から大きさ100の標本をとる。標本比率の標準偏差に最も近い値は？', answer: '0.049', options: ['0.049', '0.24', '0.0049', '0.4'], explanation: '√(p(1−p)/n)=√(0.24/100)≈0.049。' },
    { area: 'statistics', subject: '数学B', prompt: '母標準偏差が既知のとき、母平均の信頼区間を作る標準化で使う量は？', answer: '(標本平均−母平均)/(母標準偏差/√n)', options: ['(標本平均−母平均)/(母標準偏差/√n)', '(標本平均−母平均)/母標準偏差', '(標本平均−母平均)×√n', '標本平均/標本サイズ'], explanation: '標本平均の標準誤差 σ/√n で平均との差を割ると標準正規分布に従う。' },
    { area: 'statistics', subject: '数学B', prompt: '標本サイズを n から 4n にすると、標本平均の標準誤差は何倍？', answer: '1/2倍', options: ['1/2倍', '2倍', '1/4倍', '変わらない'], explanation: '標準誤差は σ/√n なので、nを4倍にすると1/√4=1/2倍。' },
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
