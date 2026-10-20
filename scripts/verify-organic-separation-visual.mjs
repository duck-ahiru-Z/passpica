import fs from 'node:fs';
import path from 'node:path';

const pagePath = path.join(process.cwd(), 'src/app/learn/chemistry/organic-separation/page.tsx');
const page = fs.readFileSync(pagePath, 'utf8');

const orderedSteps = [
  "reagent: '-',",
  "reagent: 'HCl aq',",
  "reagent: 'NaHCO3 aq',",
  "reagent: 'NaOH aq',",
];
let previousStep = -1;
for (const step of orderedSteps) {
  const index = page.indexOf(step);
  if (index <= previousStep) throw new Error(`Organic extraction steps are missing or out of order: ${step}`);
  previousStep = index;
}

for (const species of [
  'アニリン塩酸塩 (C6H5NH3+ Cl-)',
  '安息香酸ナトリウム (C6H5COO- Na+)',
  'ナトリウムフェノキシド (C6H5O- Na+)',
  'ニトロベンゼン',
]) {
  if (!page.includes(species)) throw new Error(`Organic extraction visualization is missing a separated species: ${species}`);
}

if (!page.includes('酸性の強さは「安息香酸(カルボン酸) ＞ 炭酸 ＞ フェノール」の順です。')) {
  throw new Error('The organic extraction lesson must state the acid-strength order that explains selective extraction.');
}
if (!page.includes('<ul className="list-disc pl-5 text-gray-600 text-[11px] space-y-2">')
  || !page.includes('<strong>強塩基（NaOH）</strong>')
  || !page.includes('<strong>弱塩基（NaHCO₃）</strong>')
  || page.includes('**強塩基')
  || page.includes('**弱塩基')) {
  throw new Error('Acid/base guidance must render as semantic list items and HTML emphasis, not literal Markdown.');
}
if (!page.includes('role="img" aria-label={`分液漏斗の層の図。上層エーテルには${step.etherLayer.join')) {
  throw new Error('The changing separatory-funnel diagram must expose a description of its current layers.');
}
for (const control of ['onClick={handlePrev}', 'onClick={handleNext}', 'onClick={handleReset}']) {
  if (!page.includes(control)) throw new Error(`Organic extraction visualization is missing a navigation control: ${control}`);
}

console.log('Organic separation visual verified: all four stages, separated species, acid-strength rationale, rendered emphasis, accessible diagram summary, and navigation controls.');
