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
  Li: 'リアカー（Li:赤）', Na: 'リアカーなき（Na:黄）', K: 'リアカーなきK村（K:赤紫）',
  Cu: 'リアカーなきK村、動力（Cu:青緑）', Ca: 'リアカーなきK村、動力借りると（Ca:橙赤）', Ba: 'リアカーなきK村、動力借りるとする馬力（Ba:黄緑）',
};
const picker = new BalancedRandom(flameMetals);
export function generateFlameReactionProblem(mode: FlameReactionMode, random = Math.random): FlameReactionProblem {
  const metal = mode === 'mix' ? picker.next(random) : mode;
  const formula = `${metal}Cl${metal === 'Cu' || metal === 'Ba' || metal === 'Ca' ? '2' : ''}`;
  return { metal, name: flameMetalLabels[metal], formula, color: flameColorLabels[metal], mnemonic: flameReactionMnemonics[metal] };
}
