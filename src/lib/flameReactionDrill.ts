import { BalancedRandom } from './balancedRandom.ts';

export type FlameMetal = 'Li' | 'Na' | 'K' | 'Cu' | 'Ca' | 'Ba';
export type FlameReactionMode = FlameMetal | 'mix';
export type FlameReactionProblem = { metal: FlameMetal; name: string; formula: string; color: string; mnemonic: string };
export const flameMetals: readonly FlameMetal[] = ['Li', 'Na', 'K', 'Cu', 'Ca', 'Ba'];
export const flameMetalLabels: Record<FlameMetal, string> = {
  Li: 'リチウム', Na: 'ナトリウム', K: 'カリウム', Cu: '銅', Ca: 'カルシウム', Ba: 'バリウム',
};
export const flameColorLabels: Record<FlameMetal, string> = {
  Li: '赤色', Na: '黄色', K: '赤紫色', Cu: '青緑色', Ca: '橙赤色', Ba: '黄緑色',
};
export const flameReactionMnemonics: Record<FlameMetal, string> = {
  Li: 'リアカー（Li:赤）', Na: '無き（Na:黄）', K: 'Kの村（K:紫）',
  Cu: '動力（Cu:緑）', Ca: '借りるとう（Ca:橙）', Ba: '馬力（Ba:緑）',
};
const picker = new BalancedRandom(flameMetals);
export function generateFlameReactionProblem(mode: FlameReactionMode, random = Math.random): FlameReactionProblem {
  const metal = mode === 'mix' ? picker.next(random) : mode;
  const formula = `${metal}Cl${metal === 'Cu' || metal === 'Ba' || metal === 'Ca' ? '2' : ''}`;
  return { metal, name: flameMetalLabels[metal], formula, color: flameColorLabels[metal], mnemonic: flameReactionMnemonics[metal] };
}
