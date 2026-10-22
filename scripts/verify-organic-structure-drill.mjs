import fs from 'node:fs';
import {
  createOrganicStructureProblemPicker,
  organicStructureLabels,
  organicStructurePatterns,
} from '../src/lib/organicStructureDrill.ts';

const page = fs.readFileSync('src/app/learn/chemistry/organic-structure-drill/page.tsx', 'utf8');
const portal = fs.readFileSync('src/app/learn/page.tsx', 'utf8');
const visual = fs.readFileSync('src/app/learn/chemistry/organic-3d/page.tsx', 'utf8');

if (!page.includes('実戦練習：有機立体構造 全パターンランダム') || !page.includes('基礎練習：{organicStructureLabels[pattern]}だけ')) {
  throw new Error('The drill must expose both isolated pattern practice and mixed practice.');
}
if (!portal.includes("practiceLink: '/learn/chemistry/organic-structure-drill'") || !visual.includes('/learn/chemistry/organic-structure-drill')) {
  throw new Error('The learning portal and 3D visual must link to the drill.');
}
if (!visual.includes('aria-label="左右回転 (Yaw)"') || !visual.includes('aria-label="上下回転 (Pitch)"')) {
  throw new Error('The 3D rotation sliders must have distinct accessible names.');
}
if (Object.keys(organicStructureLabels).length !== organicStructurePatterns.length) {
  throw new Error('Every molecular structure pattern must have an individual-practice label.');
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function validate(problem) {
  if (!problem.prompt || !problem.explanation) throw new Error(`${problem.pattern}: missing question or explanation.`);
  if (problem.choices.length !== 3 || new Set(problem.choices).size !== 3) throw new Error(`${problem.pattern}: choices must be three distinct options.`);
  if (problem.choices.filter(choice => choice === problem.answer).length !== 1) throw new Error(`${problem.pattern}: exactly one choice must be correct.`);
}

for (const pattern of organicStructurePatterns) {
  const next = createOrganicStructureProblemPicker();
  const random = seeded(pattern.length * 871);
  for (let i = 0; i < 400; i += 1) {
    const problem = next(pattern, random);
    if (problem.pattern !== pattern) throw new Error(`Fixed mode ${pattern} generated ${problem.pattern}.`);
    validate(problem);
  }
}

const next = createOrganicStructureProblemPicker();
const random = seeded(20261022);
const counts = new Map(organicStructurePatterns.map(pattern => [pattern, 0]));
let previous;
for (let i = 0; i < 900; i += 1) {
  const problem = next('mix', random);
  validate(problem);
  if (problem.pattern === previous) throw new Error(`Mixed mode repeated ${problem.pattern} consecutively.`);
  previous = problem.pattern;
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  if (i % organicStructurePatterns.length === organicStructurePatterns.length - 1) {
    const batch = organicStructurePatterns.filter(pattern => counts.get(pattern) >= Math.floor((i + 1) / organicStructurePatterns.length));
    if (batch.length !== organicStructurePatterns.length) throw new Error(`Mixed batch ending at ${i + 1} omitted a pattern.`);
  }
}
if ([...counts.values()].some(count => count !== 100)) throw new Error(`Unbalanced mixed counts: ${JSON.stringify(Object.fromEntries(counts))}`);

console.log('Organic structure drill verified: 3,600 fixed questions, 900 balanced mixed questions, unique choices, no adjacent pattern repeats, and portal/visual links.');
