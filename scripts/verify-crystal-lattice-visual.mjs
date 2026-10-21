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
  ['href="/learn/chemistry/crystal-lattice-drill"', 'link to focused and mixed crystal-lattice practice'],
  ['結晶格子の計算問題で練習する →', 'clear visual-to-practice link label'],
];

for (const [text, label] of required) {
  if (!page.includes(text)) throw new Error(`missing accessible visual detail: ${label}`);
}
if ((page.match(/role="img" aria-label=\{selectedType/g) ?? []).length !== 2) {
  throw new Error('both lattice diagrams must expose a type-specific accessible description');
}

function coordinatesAfter(markerIndex) {
  const arrayStart = page.indexOf('[[', markerIndex);
  const arrayEnd = page.indexOf('].map', arrayStart);
  if (arrayStart < 0 || arrayEnd < 0) throw new Error('lattice point coordinates must be present after their diagram marker');
  return [...page.slice(arrayStart, arrayEnd).matchAll(/\[(\d+),\s*(\d+)\]/g)]
    .map(([, x, y]) => `${x},${y}`);
}

const vertexMarkers = [...page.matchAll(/\/\* 8個の頂点原子 \*\//g)];
if (vertexMarkers.length !== 2) throw new Error('both BCC and FCC diagrams must define their eight vertex atoms');
for (const [index, marker] of vertexMarkers.entries()) {
  const vertices = coordinatesAfter(marker.index);
  if (vertices.length !== 8 || new Set(vertices).size !== 8) {
    throw new Error(`${index === 0 ? 'BCC' : 'FCC'} diagram must draw eight distinct cube vertices`);
  }
}

const faceMarker = page.indexOf('/* 各面の中央原子（6個） */');
if (faceMarker < 0) throw new Error('FCC diagram must identify all six face-center atoms');
const faceCenters = coordinatesAfter(faceMarker);
if (faceCenters.length !== 6 || new Set(faceCenters).size !== 6) {
  throw new Error('FCC diagram must draw six distinct face-center atoms');
}

for (const formula of ['√3 a = 4r', '√2 a = 4r']) {
  if (!page.includes(`contactFormula: '${formula}'`)) throw new Error(`missing ${formula} contact relation`);
}
if ((page.match(/\{info\.contactFormula\}/g) ?? []).length < 2) {
  throw new Error('the same contact relation must be rendered in both the diagram and the lattice data table');
}

console.log('Crystal lattice visual verified: both accessible diagrams, eight distinct vertices per cell, six distinct FCC face centers, and matching contact formulas.');
