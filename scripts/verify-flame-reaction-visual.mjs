import fs from 'node:fs';
import path from 'node:path';
import { flameMetals, flameReactionMnemonics } from '../src/lib/flameReactionDrill.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/flame-reaction/page.tsx'), 'utf8');
const expectedFlames = [
  ['LiCl', 'リチウム', '赤色', '#ef4444'],
  ['NaCl', 'ナトリウム', '黄色', '#eab308'],
  ['KCl', 'カリウム', '赤紫色', '#c084fc'],
  ['CuCl2', '銅', '青緑色', '#0d9488'],
  ['CaCl2', 'カルシウム', '橙赤色', '#ff4500'],
  ['BaCl2', 'バリウム', '黄緑色', '#84cc16'],
];
const actualFlames = [...page.matchAll(/formula: '([^']+)', name: '[^']+', jpName: '([^']+)', colorName: '([^']+)', colorHex: '([^']+)'/g)]
  .map(([, formula, jpName, colorName, colorHex]) => [formula, jpName, colorName, colorHex]);
if (JSON.stringify(actualFlames) !== JSON.stringify(expectedFlames)) {
  throw new Error(`flame labels and SVG colors must match for all six salts: ${JSON.stringify(actualFlames)}`);
}
if (!page.includes('aria-pressed={selectedMetal?.formula === m.formula}')
  || !page.includes('選択されたイオンの発色')
  || !page.includes('aria-label={selectedMetal ? `${selectedMetal.jpName}の炎色反応。炎は${selectedMetal.colorName}。`')) {
  throw new Error('flame selector and colored flame must stay associated with the selected salt');
}
for (const metal of flameMetals) {
  const mnemonic = flameReactionMnemonics[metal];
  if (!page.includes(`mnemonic: '${mnemonic}'`)) throw new Error(`${metal} visual mnemonic must match the drill: ${mnemonic}`);
}
if (!page.includes('リアカーなき（Li:赤 / Na:黄）K村（K:赤紫）動力（Cu:青緑）借りると（Ca:橙赤）する（Sr:紅色・演習対象外）馬力（Ba:黄緑）')) {
  throw new Error('the complete mnemonic must identify all color labels and disclose that Sr is outside this six-metal practice');
}

console.log('Flame reaction visual verified: all six salt labels, flame colors, accessible descriptions, and selected-state behavior agree.');
