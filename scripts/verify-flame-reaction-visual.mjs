import fs from 'node:fs';
import path from 'node:path';

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

console.log('Flame reaction visual verified: all six salt labels, flame colors, accessible descriptions, and selected-state behavior agree.');
