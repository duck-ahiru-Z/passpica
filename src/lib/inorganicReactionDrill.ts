import { BalancedRandom } from './balancedRandom.ts';

export type InorganicPattern = 'cu-ammonia-small' | 'cu-ammonia-excess' | 'al-sodium-small' | 'al-sodium-excess' | 'zn-sodium-small' | 'zn-sodium-excess' | 'ag-ammonia-small' | 'ag-ammonia-excess' | 'pb-iodide' | 'zn-sulfide-acid' | 'zn-sulfide-base' | 'fe3-sulfide-acid' | 'fe3-sulfide-base' | 'fe3-iodide' | 'cu-iodide';
export type InorganicMode = InorganicPattern | 'mix';
export type InorganicProblem = { pattern: InorganicPattern; label: string; prompt: string; answer: string; formula: string; explanation: string };
export const inorganicPatterns: readonly InorganicPattern[] = [
  'cu-ammonia-small', 'cu-ammonia-excess', 'al-sodium-small', 'al-sodium-excess',
  'zn-sodium-small', 'zn-sodium-excess', 'ag-ammonia-small', 'ag-ammonia-excess',
  'pb-iodide', 'zn-sulfide-acid', 'zn-sulfide-base', 'fe3-sulfide-acid', 'fe3-sulfide-base', 'fe3-iodide', 'cu-iodide',
];
const reactions: Record<InorganicPattern, InorganicProblem> = {
  'cu-ammonia-small': { pattern: 'cu-ammonia-small', label: 'Cu²⁺へのNH₃水の少量添加', prompt: 'Cu²⁺水溶液にアンモニア水を少量加えると、どの変化が起こるか。', answer: '青白色のCu(OH)₂沈殿', formula: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓', explanation: '少量のアンモニア水は弱塩基としてOH⁻を生じ、青白色の水酸化銅(II)を沈殿させます。' },
  'cu-ammonia-excess': { pattern: 'cu-ammonia-excess', label: 'Cu²⁺へのNH₃水の過剰添加', prompt: 'Cu²⁺水溶液にアンモニア水を過剰に加えると、少量添加でできた沈殿はどうなるか。', answer: '沈殿が溶け、深青色の錯イオン溶液', formula: 'Cu(OH)₂ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻', explanation: 'テトラアンミン銅(II)錯イオンを作って沈殿が再溶解し、深青色になります。' },
  'al-sodium-small': { pattern: 'al-sodium-small', label: 'Al³⁺へのNaOHの少量添加', prompt: 'Al³⁺水溶液に水酸化ナトリウム水溶液を少量加えると、何が生じるか。', answer: '白色ゲル状のAl(OH)₃沈殿', formula: 'Al³⁺ + 3OH⁻ → Al(OH)₃↓', explanation: '水酸化アルミニウムの白色ゲル状沈殿が生じます。' },
  'al-sodium-excess': { pattern: 'al-sodium-excess', label: 'Al³⁺へのNaOHの過剰添加', prompt: 'Al³⁺にNaOHを過剰に加える。白色沈殿はどうなるか。', answer: '沈殿が溶け、無色透明の溶液', formula: 'Al(OH)₃ + OH⁻ → [Al(OH)₄]⁻', explanation: '両性水酸化物Al(OH)₃は過剰の強塩基に溶け、テトラヒドロキシドアルミン酸イオンになります。' },
  'zn-sodium-small': { pattern: 'zn-sodium-small', label: 'Zn²⁺へのNaOHの少量添加', prompt: 'Zn²⁺水溶液にNaOHを少量加えると、何が生じるか。', answer: '白色のZn(OH)₂沈殿', formula: 'Zn²⁺ + 2OH⁻ → Zn(OH)₂↓', explanation: '水酸化亜鉛の白色沈殿が生じます。' },
  'zn-sodium-excess': { pattern: 'zn-sodium-excess', label: 'Zn²⁺へのNaOHの過剰添加', prompt: 'Zn²⁺にNaOHを過剰に加える。白色沈殿はどうなるか。', answer: '沈殿が溶け、無色透明の溶液', formula: 'Zn(OH)₂ + 2OH⁻ → [Zn(OH)₄]²⁻', explanation: '両性水酸化物Zn(OH)₂は過剰の強塩基に溶け、テトラヒドロキシド亜鉛(II)酸イオンになります。' },
  'ag-ammonia-small': { pattern: 'ag-ammonia-small', label: 'Ag⁺へのNH₃水の少量添加', prompt: 'Ag⁺水溶液にアンモニア水を少量加えると、どの沈殿が生じるか。', answer: '褐色のAg₂O沈殿', formula: '2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O', explanation: '不安定な水酸化銀は脱水して、褐色の酸化銀(I)沈殿になります。' },
  'ag-ammonia-excess': { pattern: 'ag-ammonia-excess', label: 'Ag⁺へのNH₃水の過剰添加', prompt: 'Ag⁺にアンモニア水を過剰に加えると、少量添加で生じた沈殿はどうなるか。', answer: '沈殿が溶け、無色透明の錯イオン溶液', formula: 'Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]⁺ + 2OH⁻', explanation: 'ジアンミン銀(I)錯イオンを作って酸化銀の沈殿が溶けます。' },
  'pb-iodide': { pattern: 'pb-iodide', label: 'Pb²⁺へのKI添加', prompt: 'Pb²⁺水溶液にKI水溶液を加えると、どの沈殿が生じるか。', answer: '黄色のPbI₂沈殿', formula: 'Pb²⁺ + 2I⁻ → PbI₂↓', explanation: '黄色のヨウ化鉛(II)が沈殿します。熱水に溶け、冷却すると黄金色の結晶が析出することがあります。' },
  'zn-sulfide-acid': { pattern: 'zn-sulfide-acid', label: 'Zn²⁺の酸性条件下でのH₂S反応', prompt: 'Zn²⁺水溶液を酸性に保ってH₂Sを通すと、このシミュレーターではどうなるか。', answer: '沈殿せず、Zn²⁺が溶液中に残る', formula: '酸性下では沈殿せず', explanation: '酸性下ではS²⁻濃度が低く、ZnSは沈殿しません。' },
  'zn-sulfide-base': { pattern: 'zn-sulfide-base', label: 'Zn²⁺の塩基性条件下でのH₂S反応', prompt: 'Zn²⁺水溶液を塩基性にしてH₂Sを通すと、何が生じるか。', answer: '白色のZnS沈殿', formula: 'Zn²⁺ + S²⁻ → ZnS↓', explanation: '塩基性ではS²⁻濃度が高まり、例外的に白色の硫化物ZnSが沈殿します。' },
  'fe3-sulfide-acid': { pattern: 'fe3-sulfide-acid', label: 'Fe³⁺の酸性条件下でのH₂S反応', prompt: 'Fe³⁺水溶液を酸性に保ってH₂Sを通したとき、観察される変化はどれか。', answer: 'Fe²⁺の淡緑色溶液と硫黄コロイドの黄白色白濁', formula: '2Fe³⁺ + H₂S → 2Fe²⁺ + S + 2H⁺', explanation: 'Fe³⁺はH₂SによりFe²⁺へ還元され、H₂Sは単体硫黄となり、微粒子が分散して黄白色に白濁します。' },
  'fe3-sulfide-base': { pattern: 'fe3-sulfide-base', label: 'Fe³⁺の塩基性条件下でのH₂S反応', prompt: 'Fe³⁺水溶液を塩基性にしてH₂Sを通したとき、生じる沈殿の組合せはどれか。', answer: '黒色のFeS沈殿と単体硫黄の沈殿', formula: '2Fe³⁺ + 3H₂S + 6OH⁻ → 2FeS↓ + S↓ + 6H₂O', explanation: '塩基性ではFe³⁺がH₂SによりFe²⁺へ還元された後、Fe²⁺がS²⁻と反応して黒色FeSとなります。同時に単体硫黄も沈殿します。' },
  'fe3-iodide': { pattern: 'fe3-iodide', label: 'Fe³⁺へのKI添加', prompt: 'Fe³⁺水溶液にKIを加えると、沈殿は生じるか。溶液はどう変化するか。', answer: '沈殿せず、ヨウ素により褐色の溶液', formula: '2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂', explanation: 'Fe³⁺がI⁻を酸化してI₂を生じ、自身はFe²⁺に還元されます。ヨウ素で溶液が褐色になります。' },
  'cu-iodide': { pattern: 'cu-iodide', label: 'Cu²⁺へのKI添加', prompt: 'Cu²⁺水溶液にKIを加えると、生じる固体と溶液の色の組合せはどれか。', answer: '白色のCuI沈殿と褐色のヨウ素溶液', formula: '2Cu²⁺ + 4I⁻ → 2CuI↓ + I₂', explanation: 'I⁻はCu²⁺をCu⁺へ還元し、自身はI₂に酸化されます。白色CuIと褐色のヨウ素が生じます。' },
};
export const inorganicPatternLabels = Object.fromEntries(inorganicPatterns.map(pattern => [pattern, reactions[pattern].label])) as Record<InorganicPattern, string>;
const picker = new BalancedRandom(inorganicPatterns);
export function generateInorganicProblem(mode: InorganicMode, random = Math.random): InorganicProblem {
  return reactions[mode === 'mix' ? picker.next(random) : mode];
}
