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
if (!page.includes('<path d="M 25 125 Q 60 115 90 85" fill="none" stroke="#0f172a" strokeWidth="1.5" />\r\n              \r\n              {/* 蒸気圧曲線（三重点と臨界点の間） */}\r\n              <path d="M 90 85 Q 120 70 150 40" fill="none" stroke="#0f172a" strokeWidth="1.5" />')) {
  throw new Error('the sublimation curve must meet the triple point and the vaporization curve must continue from the triple point to the critical point');
}
if (!page.includes("aria-pressed={selectedPhase === 'h2o'}") || !page.includes("aria-pressed={selectedPhase === 'co2'}")) {
  throw new Error('the selected phase-diagram tab must be exposed to assistive technology');
}

console.log('Phase-diagram visual verified: axis direction, both slope conventions, plotted geometry, and accessible selected-tab state agree.');
