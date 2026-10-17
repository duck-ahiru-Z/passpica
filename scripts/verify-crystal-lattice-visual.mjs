import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/crystal-lattice/page.tsx'), 'utf8');
const required = [
  ["aria-pressed={selectedType === 'bcc'}", 'BCC selector state'],
  ["aria-pressed={selectedType === 'fcc'}", 'FCC selector state'],
  ['体心立方格子の配置図。立方体の8つの頂点と立方体の中心に原子があります。', 'BCC unit-cell description'],
  ['面心立方格子の配置図。立方体の8つの頂点と6つの面の中心に原子があります。', 'FCC unit-cell description'],
  ['体心立方格子の体対角線を含む断面。', 'BCC contact-section description'],
  ['面心立方格子の面を通る断面。', 'FCC contact-section description'],
];

for (const [text, label] of required) {
  if (!page.includes(text)) throw new Error(`missing accessible visual detail: ${label}`);
}
if ((page.match(/role="img" aria-label=\{selectedType/g) ?? []).length !== 2) {
  throw new Error('both lattice diagrams must expose a type-specific accessible description');
}

console.log('Crystal lattice visual accessibility verified: both structure choices and both diagrams describe the selected lattice.');
