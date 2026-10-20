import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/gas-collection/page.tsx'), 'utf8');

const expectedGases = [
  { formula: 'NH3', method: 'upward', methodJp: '上方置換法', reaction: '2NH4Cl + Ca(OH)2 ➔ CaCl2 + 2H2O + 2NH3' },
  { formula: 'Cl2', method: 'downward', methodJp: '下方置換法', reaction: 'MnO2 + 4HCl ➔ MnCl2 + 2H2O + Cl2' },
  { formula: 'HCl', method: 'downward', methodJp: '下方置換法', reaction: 'NaCl + H2SO4 ➔ NaHSO4 + HCl' },
  { formula: 'O2', method: 'water', methodJp: '水上置換法', reaction: '2H2O2 ➔ 2H2O + O2 (触媒: MnO2)' },
  { formula: 'H2', method: 'water', methodJp: '水上置換法', reaction: 'Zn + H2SO4 ➔ ZnSO4 + H2' },
  { formula: 'CO2', method: 'downward', methodJp: '下方置換法（または水上）', reaction: 'CaCO3 + 2HCl ➔ CaCl2 + H2O + CO2' },
];

const gasIds = [...page.matchAll(/formula: '([^']+)'/g)].map(match => match[1]);
if (JSON.stringify(gasIds) !== JSON.stringify(expectedGases.map(gas => gas.formula))) {
  throw new Error('gas selector must preserve the six supported gases in a stable order');
}

for (const [index, gas] of expectedGases.entries()) {
  const start = page.indexOf(`formula: '${gas.formula}'`);
  const nextStart = expectedGases[index + 1]
    ? page.indexOf(`formula: '${expectedGases[index + 1].formula}'`, start + 1)
    : page.indexOf('\n];', start);
  const block = page.slice(start, nextStart);
  for (const requirement of [
    `method: '${gas.method}'`,
    `methodJp: '${gas.methodJp}'`,
    `reaction: '${gas.reaction}'`,
  ]) {
    if (!block.includes(requirement)) throw new Error(`${gas.formula} has an inconsistent capture classification or preparation: ${requirement}`);
  }
}

for (const method of ['water', 'upward', 'downward']) {
  if (!page.includes(`selectedGas.method === '${method}' && (`)) {
    throw new Error(`the ${method} collection vessel must have its own diagram`);
  }
}

for (const requirement of [
  'aria-pressed={selectedGas.formula === g.formula}',
  'selectedGas.methodJp',
  'selectedGas.reaction',
  'selectedGas.explain',
  'aria-label={`${selectedGas.name}を${selectedGas.methodJp}で捕集する装置。',
  '水に難溶・反応しない',
  '空気より軽い',
  '空気より重い',
]) {
  if (!page.includes(requirement)) throw new Error(`gas collection visual is missing synchronized or accessible content: ${requirement}`);
}

console.log('Gas collection visual verified: six gas classifications, preparation equations, three diagram modes, and accessible selection state.');
