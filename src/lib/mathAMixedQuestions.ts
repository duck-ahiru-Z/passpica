import { BalancedRandom } from './balancedRandom.ts';

export type MathAArea = 'counting' | 'probability' | 'integer' | 'geometry';
export type MathAMode = MathAArea | 'all';
export type MathAQuestion = { area: MathAArea; prompt: string; answer: string; options: string[]; explanation: string };
export const mathAAreas: readonly MathAArea[] = ['counting', 'probability', 'integer', 'geometry'];
export const mathALabels: Record<MathAArea, string> = { counting: '場合の数', probability: '確率', integer: '整数', geometry: '図形の性質' };

const questions: Record<MathAArea, MathAQuestion[]> = {
  counting: [
    { area: 'counting', prompt: 'Aが2個、BとCが1個ずつある4文字を並べる場合の数を求める方針は？', answer: '4!を同じAの入れ替え2!で割る', options: ['4!を同じAの入れ替え2!で割る', '4!のまま数える', '4C2だけを計算する', '円順列として数える'], explanation: '同じA同士の入れ替えを区別しないので 4!/2!=12 通り。' },
    { area: 'counting', prompt: '8人から順番を考えず3人を選ぶ場合の数は、どの式で求める？', answer: '8C3', options: ['8C3', '8P3', '3⁸', '8!'], explanation: '順序を区別しない選び方なので組合せ 8C3=56。' },
    { area: 'counting', prompt: '7人から4人を選び、横一列に並べる場合の数は？', answer: '7P4', options: ['7P4', '7C4', '4⁷', '7!/4!'], explanation: '選ぶ順序・並ぶ順序を区別するので 7P4=7×6×5×4。' },
    { area: 'counting', prompt: '異なる6人を円卓に座らせる円順列の数を求める式は？', answer: '(6−1)!', options: ['(6−1)!', '6!', '6C2', '6!/2!'], explanation: '回転で一致する並びを同一視するため、1人を固定して (6−1)!=120。' },
    { area: 'counting', prompt: 'x+y+z=6 を満たす0以上の整数解の個数を求める方法は？', answer: '仕切りを使う重複組合せ', options: ['仕切りを使う重複組合せ', '6P3', '6C3', '三元一次方程式なので1通り'], explanation: '6個の玉と2本の仕切りを並べるので 8C2=28 通り。' },
  ],
  probability: [
    { area: 'probability', prompt: '硬貨を3回投げて「少なくとも1回表」の確率を求める簡潔な方針は？', answer: '余事象（3回とも裏）を使う', options: ['余事象（3回とも裏）を使う', '表の出方をすべて別々に数える', '順列だけを使う', '条件付き確率にする'], explanation: '1−(1/2)³=7/8。' },
    { area: 'probability', prompt: 'さいころ2個を投げたとき、和が8となる確率を求める手順は？', answer: '全36通りのうち和が8の組を数える', options: ['全36通りのうち和が8の組を数える', '和の期待値だけを求める', '6C2で数える', '余事象を必ず使う'], explanation: '(2,6),(3,5),(4,4),(5,3),(6,2) の5通りなので 5/36。' },
    { area: 'probability', prompt: '成功確率1/2の独立試行を4回行い、ちょうど2回成功する確率の方法は？', answer: '二項分布（反復試行）', options: ['二項分布（反復試行）', '余事象だけ', '順列だけ', '条件付き確率だけ'], explanation: '4C2(1/2)²(1/2)²=3/8。' },
    { area: 'probability', prompt: '赤玉3個、白玉2個から戻さず2個取り出す。1個目が赤と分かったとき、2個目が白の確率は？', answer: '条件付き確率として残り4個を見る', options: ['条件付き確率として残り4個を見る', '最初の5個のまま計算する', '独立として2/5を使う', '余事象をとる'], explanation: '1個目が赤なら残りは赤2個・白2個の計4個なので確率は2/4=1/2。' },
    { area: 'probability', prompt: '事象A、Bの確率と共通部分が分かるとき、AまたはBの確率は？', answer: 'P(A)+P(B)−P(A∩B)', options: ['P(A)+P(B)−P(A∩B)', 'P(A)P(B)', 'P(A)−P(B)', 'P(A∩B)だけ'], explanation: '共通部分を二重に数えるため、和から重複分を1回引く。' },
  ],
  integer: [
    { area: 'integer', prompt: '15x+21y=6 が整数解をもつか、最初に調べる条件は？', answer: 'gcd(15,21)が6を割り切るか', options: ['gcd(15,21)が6を割り切るか', '15と21の積が6より大きいか', 'x,yを正と仮定する', '合同式を使わず割り算する'], explanation: 'gcd(15,21)=3 で 3|6 なので整数解をもつ。' },
    { area: 'integer', prompt: '5x≡1 (mod 7) を解くとき、まず探すものは？', answer: '5の逆数にあたる乗法逆元 mod 7', options: ['5の逆数にあたる乗法逆元 mod 7', '7の平方根', '最大公約数が5となる数', 'xが0となる条件'], explanation: '5×3=15≡1 (mod 7) なので逆元は3、x≡3 (mod 7)。' },
    { area: 'integer', prompt: '整数nを5で割った余りが2と分かったとき、nの表し方は？', answer: 'n=5k+2（kは整数）', options: ['n=5k+2（kは整数）', 'n=2k+5', 'n=5k−2', 'n=2⁵+k'], explanation: '除法の原理より n=5k+r、余りr=2。' },
    { area: 'integer', prompt: '360の正の約数の個数を素因数分解から求める方法は？', answer: '指数を1ずつ増やした数を掛ける', options: ['指数を1ずつ増やした数を掛ける', '素因数の指数を足すだけ', '360を2で割った回数だけ数える', '素因数をすべて掛ける'], explanation: '360=2³·3²·5 より約数の個数は(3+1)(2+1)(1+1)=24。' },
    { area: 'integer', prompt: '252と198の最大公約数を効率よく求める方法は？', answer: 'ユークリッドの互除法', options: ['ユークリッドの互除法', '両方の約数をすべて書き出す', '最小公倍数だけを求める', '2数を足し続ける'], explanation: '252=198+54、198=3×54+36、54=36+18、36=2×18 より最大公約数は18。' },
  ],
  geometry: [
    { area: 'geometry', prompt: '円に内接する四角形ABCDで、∠A=72°のとき対角∠Cを求める性質は？', answer: '対角の和が180°', options: ['対角の和が180°', '隣り合う角が等しい', '対角線が垂直', '4辺の長さが等しい'], explanation: '円に内接する四角形の対角は補角なので ∠C=108°。' },
    { area: 'geometry', prompt: '円の接線と接点を通る弦のなす角を、円周角と結ぶ定理は？', answer: '接弦定理', options: ['接弦定理', '方べきの定理', '円周角の定理だけ', '中線定理'], explanation: '接線と弦のなす角は、その弦に対する円周角に等しい。' },
    { area: 'geometry', prompt: '直径ABに対する円周角∠ACBを求めるときに使う性質は？', answer: '半円の弧に対する円周角は90°', options: ['半円の弧に対する円周角は90°', '中心角と円周角は等しい', '対角の和が180°', '接線と半径は平行'], explanation: 'タレスの定理より ∠ACB=90°。' },
    { area: 'geometry', prompt: '円内で弦ABとCDが交わるとき、交点Pについて成り立つ関係は？', answer: 'PA·PB=PC·PD', options: ['PA·PB=PC·PD', 'PA+PB=PC+PD', 'PA·PC=PB·PD', 'AB=CD'], explanation: '交わる弦の定理（方べき）より、2つの線分の積が等しい。' },
    { area: 'geometry', prompt: '正六角形の内角1つの大きさを求める式は？', answer: '(6−2)×180°÷6', options: ['(6−2)×180°÷6', '360°÷6', '6×180°', '(6−1)×180°÷6'], explanation: '内角の和は(6−2)×180°=720°なので、1つは120°。' },
  ],
};

const areaPicker = new BalancedRandom(mathAAreas);
const questionPickers = new Map(mathAAreas.map(area => [area, new BalancedRandom(questions[area])]));
export function generateMathAQuestion(mode: MathAMode, random = Math.random): MathAQuestion {
  const area = mode === 'all' ? areaPicker.next(random) : mode;
  return questionPickers.get(area)!.next(random);
}
