import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/inorganic-colors/page.tsx'), 'utf8');
const descriptions = [...page.matchAll(/description: '([^']*)'/g)].map(([, description]) => description);

if (descriptions.length < 20) throw new Error(`Expected many selectable reagent outcomes, found ${descriptions.length}.`);
for (const description of descriptions) {
  const markerCount = [...description.matchAll(/\*\*/g)].length;
  if (markerCount % 2 !== 0) throw new Error(`Unpaired emphasis marker in reaction description: ${description}`);
}

for (const requirement of [
  'function renderEmphasis(text: string)',
  "text.split(/(\\*\\*.*?\\*\\*)/g)",
  '{renderEmphasis(reaction.description)}',
  'stripEmphasisMarkers(reaction.description)',
  'const outlinePrecipitate = reaction.precipitateColor.includes',
  "stroke={outlinePrecipitate ? '#64748b' : undefined}",
  '<strong>黒色</strong>',
  "Zn²⁺ + S²⁻ → ZnS↓ (白色沈殿)",
  "2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O (酸化銀・褐色沈殿)",
  "塩化鉛(II)の白色沈殿が生成します。**この沈殿は「熱水に溶ける」",
]) {
  if (!page.includes(requirement)) throw new Error(`Inorganic visual is missing an expected explanation or rendered-emphasis path: ${requirement}`);
}
if (page.includes('<p>{reaction.description}</p>') || page.includes('はほとんどが**黒色**')) {
  throw new Error('Inorganic reaction and memory text must not expose Markdown markers literally.');
}

console.log(`Inorganic colors visual verified: ${descriptions.length} reaction explanations, balanced emphasis markers, accessible plain-text descriptions, and rendered emphasis.`);
