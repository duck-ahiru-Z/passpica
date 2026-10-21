import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/phase-diagram/page.tsx'), 'utf8');

if (!page.includes("meltingCurveSlope: '負の傾き (右下がり)'")) {
  throw new Error('the water phase diagram must identify its negative melting-curve slope as right-downward');
}
if (!page.includes('温度を横軸・圧力を縦軸にすると右下がりです')) {
  throw new Error('the water melting-curve explanation must match the plotted axis directions');
}
if (page.includes('左下がり')) {
  throw new Error('ambiguous or incorrect left-downward wording remains for the water melting curve');
}
if (!page.includes('正の傾き (右上がり／右傾斜)') || !page.includes('M 90 85 Q 83 50 78 15') || !page.includes('M 90 85 Q 96 50 102 15')) {
  throw new Error('the water and CO2 melting-curve SVG paths must match their opposite slope conventions');
}
if (!page.includes("aria-pressed={selectedPhase === 'h2o'}") || !page.includes("aria-pressed={selectedPhase === 'co2'}")) {
  throw new Error('the selected phase-diagram tab must be exposed to assistive technology');
}

console.log('Phase-diagram visual verified: axis direction, both slope conventions, plotted geometry, and accessible selected-tab state agree.');
