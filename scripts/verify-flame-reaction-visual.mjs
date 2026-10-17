import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/flame-reaction/page.tsx'), 'utf8');
const calcium = page.match(/formula: 'CaCl2'.*?colorName: '([^']+)'.*?colorHex: '([^']+)'/);
if (!calcium || calcium[1] !== '橙赤色' || calcium[2] !== '#ff4500') {
  throw new Error('calcium flame color must visually match its orange-red label');
}
if (!page.includes('aria-pressed={selectedMetal?.formula === m.formula}') || !page.includes('選択されたイオンの発色')) {
  throw new Error('flame selector and colored flame must stay associated with the selected salt');
}

console.log('Flame reaction visual verified: calcium label/color match and selection is exposed accessibly.');
