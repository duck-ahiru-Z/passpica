import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generatePhaseProblem, phasePatterns } from '../src/lib/phaseDiagramDrill.ts';

assert.equal(phasePatterns.length, 8);
const visual = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/phase-diagram/page.tsx'), 'utf8');
const drill = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/phase-diagram-drill/page.tsx'), 'utf8');
assert.ok(visual.includes('href="/learn/chemistry/phase-diagram-drill"'));
assert.ok(drill.includes('href="/learn/chemistry/phase-diagram"'));
for (const pattern of phasePatterns) {
  const problem = generatePhaseProblem(pattern);
  assert.equal(problem.pattern, pattern);
  assert.ok(problem.question.length > 10);
  assert.ok(problem.explanation.length > 20);
  assert.ok(problem.answer.length > 3);
}
for (const fact of [
  "meltingCurveSlope: '負の傾き (右下がり)'",
  "meltingCurveSlope: '正の傾き (右上がり／右傾斜)'",
  '0.01 ℃ , 6.11 × 10^2 Pa',
  '-56.6 ℃ , 5.18 × 10^5 Pa',
  '374 ℃ , 2.21 × 10^7 Pa',
  '31.1 ℃ , 7.38 × 10^6 Pa',
  '三重点の圧力が約5.1気圧',
  '臨界点を超えると、気体と液体の境界がなくなり',
]) assert.ok(visual.includes(fact), `phase visual must include source fact: ${fact}`);
const counts = Object.fromEntries(phasePatterns.map(pattern => [pattern, 0]));
let previous = '';
const sampleCount = 8000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generatePhaseProblem('mix');
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'mixed phase-diagram patterns should not repeat consecutively');
  assert.equal(problem.answer, generatePhaseProblem(problem.pattern).answer);
  previous = problem.pattern;
}
for (const pattern of phasePatterns) assert.equal(counts[pattern], 1000);
console.log(`Phase-diagram drill verified: eight fixed concepts and ${sampleCount} balanced mixed questions.`);
