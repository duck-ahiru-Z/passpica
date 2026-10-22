import { BalancedRandom } from './balancedRandom.ts';

export type MetalIonPattern = 'chlorides' | 'leadChloride' | 'acidicSulfide' | 'excessAmmonia' | 'basicSulfide' | 'carbonate' | 'flameTest';
export type MetalIonMode = MetalIonPattern | 'mix';
export type MetalIonProblem = { pattern: MetalIonPattern; prompt: string; answer: string; explanation: string };
export const metalIonPatterns: readonly MetalIonPattern[] = ['chlorides', 'leadChloride', 'acidicSulfide', 'excessAmmonia', 'basicSulfide', 'carbonate', 'flameTest'];
export const metalIonLabels: Record<MetalIonPattern, string> = {
  chlorides: '希塩酸で塩化物を沈殿', leadChloride: '熱水でAgClとPbCl₂を分離', acidicSulfide: '酸性下で硫化物を沈殿',
  excessAmmonia: '過剰アンモニア水で水酸化物を分離', basicSulfide: '塩基性下で硫化物を沈殿',
  carbonate: '炭酸イオンでカルシウムを分離', flameTest: '残ったNa⁺を炎色反応で確認',
};
const problems: Record<MetalIonPattern, MetalIonProblem> = {
  chlorides: { pattern: 'chlorides', prompt: '対象イオン Ag⁺・Pb²⁺・Cu²⁺・Fe³⁺・Al³⁺・Zn²⁺・Ca²⁺・Na⁺ を含む溶液に、希塩酸を加える。沈殿するイオンはどれか。', answer: 'Ag⁺・Pb²⁺', explanation: 'AgClとPbCl₂はいずれも白色沈殿になります。このモデルではCu²⁺以下のイオンは濾液に残ります。' },
  leadChloride: { pattern: 'leadChloride', prompt: 'AgClとPbCl₂の白色沈殿の混合物に熱水を加えてろ過し、熱水抽出液を冷却する。正しい分離結果はどれか。', answer: 'AgCl残渣・PbCl₂再沈殿', explanation: 'PbCl₂は熱水に溶けるため、ろ過するとAgClが残渣に残り、Pb²⁺を含む抽出液が得られます。冷却するとPbCl₂が白色結晶として再び析出します。' },
  acidicSulfide: { pattern: 'acidicSulfide', prompt: 'Ag⁺・Pb²⁺を除いた濾液を酸性に保ってH₂Sを通す。この対象イオンの硫化物として沈殿するのはどれか。', answer: 'Cu²⁺', explanation: '酸性下ではS²⁻濃度が低く、対象イオンの硫化物ではCuSだけが沈殿します。Fe³⁺はH₂Sに還元されてFe²⁺となり、単体硫黄が生じますが、Fe²⁺自体はこの段階では濾液に残ります。次段階でH₂Sを除き、硝酸でFe³⁺へ酸化してから水酸化物として分離します。' },
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
