import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/metal-ion/page.tsx'), 'utf8');

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

console.log('Metal-ion separation visual verified: final sodium flame drawing and accessible label match the yellow flame-reaction result.');
