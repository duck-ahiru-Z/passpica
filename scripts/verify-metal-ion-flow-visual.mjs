import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/metal-ion/page.tsx'), 'utf8');

const orderedStepRequirements = [
  ["reagentFormula: '-'", "remains: ['Ag+', 'Pb2+', 'Cu2+', 'Fe3+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+']", "reaction: '-'"] ,
  ["reagentFormula: 'HCl'", "precipitates: ['AgCl (白色)', 'PbCl2 (白色)']", "remains: ['Cu2+', 'Fe3+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+']", "Ag+ + Cl- ➔ AgCl↓ , Pb2+ + 2Cl- ➔ PbCl2↓"],
  ["reagentFormula: 'H2S (酸性下)'", "precipitates: ['CuS (黒色)', 'S (淡黄色)']", "remains: ['Fe2+', 'Al3+', 'Zn2+', 'Ca2+', 'Na+']", "2Fe3+ + H2S ➔ 2Fe2+ + S↓ + 2H+"],
  ["reagentFormula: 'HNO3 ➔ NH3水 (過剰)'", "precipitates: ['Fe(OH)3', 'Al(OH)3']", "remains: ['[Zn(NH3)4]2+ (溶解)', 'Ca2+', 'Na+']", "Fe2+となった鉄は、煮沸してH2Sを追い出した後、硝酸でFe3+に酸化", "Fe3+ + 3OH- ➔ Fe(OH)3↓ , Al3+ + 3OH- ➔ Al(OH)3↓"],
  ["reagentFormula: 'H2S (塩基性下)'", "precipitates: ['ZnS (白色)']", "remains: ['Ca2+', 'Na+']", "Zn2+ + S2- ➔ ZnS↓"],
  ["reagentFormula: '(NH4)2CO3'", "precipitates: ['CaCO3 (白色)']", "remains: ['Na+']", "Ca2+ + CO3 2- ➔ CaCO3↓"],
  ["reagentFormula: '炎色反応'", "precipitates: []", "remains: []", "reaction: 'Na ➔ 黄色発色'"]
];

const stepIds = [...page.matchAll(/\bid:\s*(\d+),/g)].map(match => Number(match[1]));
if (stepIds.length !== orderedStepRequirements.length || stepIds.some((id, index) => id !== index)) {
  throw new Error('the separation simulation must preserve the initial state and all six steps in order');
}

for (const [index, requirements] of orderedStepRequirements.entries()) {
  const stepStart = page.indexOf(`id: ${index},`);
  const nextStepStart = page.indexOf(`id: ${index + 1},`, stepStart + 1);
  const stepBlock = page.slice(stepStart, nextStepStart === -1 ? page.indexOf('\n];', stepStart) : nextStepStart);
  for (const requirement of requirements) {
    if (!stepBlock.includes(requirement)) {
      throw new Error(`separation step ${index} is missing expected chemistry: ${requirement}`);
    }
  }
}

for (const requirement of [
  'currentStepIdx < STEPS.length - 1',
  'currentStepIdx > 0',
  'setCurrentStepIdx(0)',
  'disabled={currentStepIdx === 0}',
  'disabled={currentStepIdx === STEPS.length - 1}',
]) {
  if (!page.includes(requirement)) throw new Error(`step navigation is missing its boundary behavior: ${requirement}`);
}

for (const requirement of [
  "precipitateColor: '黄色 (炎色反応)'",
  "reaction: 'Na ➔ 黄色発色'",
  "currentStepIdx === STEPS.length - 1 ? (",
  'Na の黄色い炎色反応',
  'fill="#facc15"',
  '沈殿はなく、ナトリウムの黄色い炎色反応を図示します。',
]) {
  if (!page.includes(requirement)) throw new Error(`final sodium flame visual is missing: ${requirement}`);
}

if (!page.includes('step.remains.length === 0 ? (') || !page.includes('（イオンなし）')) {
  throw new Error('the empty-ion state for non-flame steps must remain available');
}

if (!page.includes("precipitateColors: ['#b45309', '#f8fafc']")) {
  throw new Error('iron and aluminum hydroxide precipitates must retain distinct brown and white colors');
}
if (!page.includes("precipitateColors: ['#1e293b', '#fde68a']") || !page.includes('酸性条件で硫化水素') || !page.includes('Fe2+となった鉄は、煮沸してH2Sを追い出した後、硝酸でFe3+に酸化')) {
  throw new Error('acidic H2S must show Fe3+ reduction to dissolved Fe2+ and sulfur, followed by nitric-acid reoxidation before hydroxide precipitation');
}
if (!page.includes('const isMixedColorPair = count === 2 && step.precipitateColors[0] !== step.precipitateColors[1];')) {
  throw new Error('mixed-color sediment labels must stay centered on their own color segments');
}
if (!page.includes('const hasLongComplex = step.remains.length === 3 && step.remains.some((remainingIon) => remainingIon.length > 9);')) {
  throw new Error('long dissolved-complex labels must not collide with the other remaining ions');
}
if (!page.includes('step.precipitates.map((precipitate, idx) => {')) {
  throw new Error('each precipitate must have a separately drawn segment');
}
if (!page.includes('const columns = Math.min(step.remains.length > 4 ? 3 : 2, step.remains.length);')) {
  throw new Error('remaining ions must use a responsive grid instead of overlapping fixed labels');
}

console.log('Metal-ion separation visual verified: flame reaction, distinct precipitate colors, and non-overlapping ion labels.');
