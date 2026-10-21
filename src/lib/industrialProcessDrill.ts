import { BalancedRandom } from './balancedRandom.ts';

export type IndustrialPattern = 'contact-1' | 'contact-2' | 'contact-3' | 'ostwald-1' | 'ostwald-2' | 'ostwald-3' | 'solvay-1' | 'solvay-2' | 'solvay-3' | 'solvay-4' | 'solvay-5';
export type IndustrialMode = IndustrialPattern | 'mix';
export type IndustrialProblem = { pattern: IndustrialPattern; process: string; label: string; question: string; answer: string; options: readonly string[]; explanation: string };
const items: readonly IndustrialProblem[] = [
  { pattern: 'contact-1', process: '接触法', label: '硫黄・黄鉄鉱の燃焼', question: '接触法で硫黄を燃焼、または黄鉄鉱を焙焼すると、主に何ができるか。', answer: '二酸化硫黄 SO₂', options: ['二酸化硫黄 SO₂', '三酸化硫黄 SO₃', '硫酸 H₂SO₄', '発煙硫酸 H₂S₂O₇'], explanation: '硫黄はS + O₂ → SO₂、黄鉄鉱は焙焼でSO₂を生じます。' },
  { pattern: 'contact-2', process: '接触法', label: '二酸化硫黄の酸化', question: '接触法でSO₂とO₂をV₂O₅触媒・約450℃で反応させると何ができるか。', answer: '三酸化硫黄 SO₃', options: ['二酸化硫黄 SO₂', '三酸化硫黄 SO₃', '硫酸 H₂SO₄', '発煙硫酸 H₂S₂O₇'], explanation: '2SO₂ + O₂ ⇄ 2SO₃。酸化バナジウム(V) V₂O₅を触媒とする、接触法の中心的な可逆反応です。' },
  { pattern: 'contact-3', process: '接触法', label: 'SO₃の吸収・希釈', question: '接触法でSO₃を濃硫酸に吸収してから水で希釈すると、最終的に何を得るか。', answer: '硫酸 H₂SO₄', options: ['二酸化硫黄 SO₂', '三酸化硫黄 SO₃', '硫酸 H₂SO₄', '発煙硫酸 H₂S₂O₇'], explanation: 'SO₃を直接水に加えず、濃硫酸に吸収して発煙硫酸を経由し、希釈して硫酸を得ます。' },
  { pattern: 'ostwald-1', process: 'オストワルト法', label: 'アンモニアの酸化', question: 'オストワルト法でNH₃をPt触媒・高温で酸化すると、窒素酸化物として何ができるか。', answer: '一酸化窒素 NO', options: ['一酸化窒素 NO', '二酸化窒素 NO₂', '硝酸 HNO₃', '亜硝酸 HNO₂'], explanation: '4NH₃ + 5O₂ → 4NO + 6H₂O。約800℃、白金触媒を用います。' },
  { pattern: 'ostwald-2', process: 'オストワルト法', label: 'NOの酸化', question: 'オストワルト法で生成したNOを空気中で酸化すると何ができるか。', answer: '二酸化窒素 NO₂', options: ['一酸化窒素 NO', '二酸化窒素 NO₂', '硝酸 HNO₃', 'アンモニア NH₃'], explanation: '2NO + O₂ → 2NO₂。次に水へ吸収させます。' },
  { pattern: 'ostwald-3', process: 'オストワルト法', label: 'NO₂の水への吸収', question: 'オストワルト法でNO₂を水に吸収させたときの主生成物と再利用される副生物の組合せはどれか。', answer: '硝酸 HNO₃ と一酸化窒素 NO', options: ['硝酸 HNO₃ と一酸化窒素 NO', 'アンモニア NH₃ と酸素 O₂', '亜硝酸 HNO₂ と窒素 N₂', '硝酸 HNO₃ と二酸化窒素 NO₂'], explanation: '3NO₂ + H₂O → 2HNO₃ + NO。副生NOは酸化段階へ循環します。' },
  { pattern: 'solvay-1', process: 'アンモニアソーダ法', label: '食塩水の炭酸化', question: 'NH₃を飽和させた食塩水にCO₂を通すと、沈殿する主物質は何か。', answer: '炭酸水素ナトリウム NaHCO₃', options: ['炭酸水素ナトリウム NaHCO₃', '炭酸ナトリウム Na₂CO₃', '炭酸カルシウム CaCO₃', '水酸化カルシウム Ca(OH)₂'], explanation: 'NaCl + H₂O + NH₃ + CO₂ → NaHCO₃↓ + NH₄Cl。NaHCO₃は難溶性で沈殿します。' },
  { pattern: 'solvay-2', process: 'アンモニアソーダ法', label: 'NaHCO₃の熱分解', question: 'アンモニアソーダ法で回収したNaHCO₃を加熱すると、製品として何ができるか。', answer: '炭酸ナトリウム Na₂CO₃', options: ['炭酸水素ナトリウム NaHCO₃', '炭酸ナトリウム Na₂CO₃', '炭酸カルシウム CaCO₃', '塩化アンモニウム NH₄Cl'], explanation: '2NaHCO₃ → Na₂CO₃ + H₂O + CO₂。CO₂は炭酸化工程へ戻します。' },
  { pattern: 'solvay-3', process: 'アンモニアソーダ法', label: '石灰石の熱分解', question: 'ソルベー法で石灰石CaCO₃を加熱分解するとできる物質はどれか。', answer: '生石灰 CaO と二酸化炭素 CO₂', options: ['生石灰 CaO と二酸化炭素 CO₂', '消石灰 Ca(OH)₂ と一酸化炭素 CO', '炭酸ナトリウム Na₂CO₃ と酸素 O₂', '塩化カルシウム CaCl₂ と水 H₂O'], explanation: 'CaCO₃ → CaO + CO₂。CO₂は炭酸化工程、CaOは消石灰の製造へ進みます。' },
  { pattern: 'solvay-4', process: 'アンモニアソーダ法', label: '生石灰の加水', question: 'ソルベー法でCaOに水を加えると、何ができるか。', answer: '消石灰 Ca(OH)₂', options: ['消石灰 Ca(OH)₂', '石灰石 CaCO₃', '炭酸水素カルシウム Ca(HCO₃)₂', '塩化カルシウム CaCl₂'], explanation: 'CaO + H₂O → Ca(OH)₂。次の工程でNH₃回収に使います。' },
  { pattern: 'solvay-5', process: 'アンモニアソーダ法', label: 'NH₃の回収', question: '副生NH₄ClにCa(OH)₂を加えると回収できる物質はどれか。', answer: 'アンモニア NH₃', options: ['アンモニア NH₃', '二酸化炭素 CO₂', '硝酸 HNO₃', '塩素 Cl₂'], explanation: '2NH₄Cl + Ca(OH)₂ → CaCl₂ + 2H₂O + 2NH₃。回収NH₃は工程内で再利用します。' },
];
export const industrialPatterns = items.map(item => item.pattern) as readonly IndustrialPattern[];
export const industrialPatternLabels = Object.fromEntries(items.map(item => [item.pattern, `${item.process}：${item.label}`])) as Record<IndustrialPattern, string>;
const byPattern = Object.fromEntries(items.map(item => [item.pattern, item])) as Record<IndustrialPattern, IndustrialProblem>;
const picker = new BalancedRandom(industrialPatterns);
export function generateIndustrialProblem(mode: IndustrialMode, random = Math.random): IndustrialProblem {
  return byPattern[mode === 'mix' ? picker.next(random) : mode];
}
