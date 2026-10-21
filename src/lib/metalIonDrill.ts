import { BalancedRandom } from './balancedRandom.ts';

export type MetalIonPattern = 'chlorides' | 'acidicSulfide' | 'excessAmmonia' | 'basicSulfide' | 'carbonate' | 'flameTest';
export type MetalIonMode = MetalIonPattern | 'mix';
export type MetalIonProblem = { pattern: MetalIonPattern; prompt: string; answer: string; explanation: string };
export const metalIonPatterns: readonly MetalIonPattern[] = ['chlorides', 'acidicSulfide', 'excessAmmonia', 'basicSulfide', 'carbonate', 'flameTest'];
export const metalIonLabels: Record<MetalIonPattern, string> = {
  chlorides: '希塩酸で塩化物を沈殿', acidicSulfide: '酸性下で硫化物を沈殿',
  excessAmmonia: '過剰アンモニア水で水酸化物を分離', basicSulfide: '塩基性下で硫化物を沈殿',
  carbonate: '炭酸イオンでカルシウムを分離', flameTest: '残ったNa⁺を炎色反応で確認',
};
const problems: Record<MetalIonPattern, MetalIonProblem> = {
  chlorides: { pattern: 'chlorides', prompt: '対象イオン Ag⁺・Pb²⁺・Cu²⁺・Fe³⁺・Al³⁺・Zn²⁺・Ca²⁺・Na⁺ を含む溶液に、希塩酸を加える。沈殿するイオンはどれか。', answer: 'Ag⁺・Pb²⁺', explanation: 'AgClとPbCl₂はいずれも白色沈殿になります。このモデルではCu²⁺以下のイオンは濾液に残ります。' },
  acidicSulfide: { pattern: 'acidicSulfide', prompt: 'Ag⁺・Pb²⁺を除いた濾液を酸性に保ってH₂Sを通す。この対象イオン中で沈殿するのはどれか。', answer: 'Cu²⁺', explanation: '酸性下ではS²⁻濃度が低く、CuSだけが沈殿します。Fe³⁺・Al³⁺・Zn²⁺などはこの段階では濾液に残ります。' },
  excessAmmonia: { pattern: 'excessAmmonia', prompt: 'H₂Sを除き、FeをFe³⁺に酸化してから過剰のアンモニア水を加える。沈殿するイオンはどれか。', answer: 'Fe³⁺・Al³⁺', explanation: 'Fe(OH)₃（赤褐色）とAl(OH)₃（白色）が沈殿します。Zn²⁺は過剰NH₃で錯イオンとなり、溶液に残ります。' },
  basicSulfide: { pattern: 'basicSulfide', prompt: 'Fe³⁺・Al³⁺を分離し、アンモニア水で塩基性になった濾液にH₂Sを通す。このモデルで沈殿するイオンはどれか。', answer: 'Zn²⁺', explanation: '塩基性ではS²⁻濃度が高まり、ZnS（白色）が沈殿します。Ca²⁺とNa⁺は濾液に残ります。' },
  carbonate: { pattern: 'carbonate', prompt: 'Zn²⁺を分離した後の濾液に炭酸アンモニウムを加える。沈殿するイオンはどれか。', answer: 'Ca²⁺', explanation: 'Ca²⁺がCaCO₃（白色）として沈殿し、Na⁺は濾液に残ります。' },
  flameTest: { pattern: 'flameTest', prompt: '最後の濾液に残るNa⁺を確認する方法と色はどれか。', answer: '炎色反応・黄色', explanation: 'Na⁺はこの系統分離で沈殿せず最後まで残ります。白金線につけて炎に入れると強い黄色を示します。' },
};
const picker = new BalancedRandom(metalIonPatterns);
export function generateMetalIonProblem(mode: MetalIonMode, random = Math.random): MetalIonProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  return problems[pattern];
}
