import assert from 'node:assert/strict';
import { generateMetalIonProblem, metalIonPatterns } from '../src/lib/metalIonDrill.ts';
import { generateFlameReactionProblem } from '../src/lib/flameReactionDrill.ts';

const expectedAnswers = ['Ag⁺・Pb²⁺', 'Cu²⁺', 'Fe³⁺・Al³⁺', 'Zn²⁺', 'Ca²⁺', '炎色反応・黄色'];
for (const [index, pattern] of metalIonPatterns.entries()) {
  const problem = generateMetalIonProblem(pattern);
  assert.equal(problem.pattern, pattern);
  assert.equal(problem.answer, expectedAnswers[index]);
  assert.ok(problem.explanation.length > 10);
}
assert.equal(generateFlameReactionProblem('Na').color, '黄色', 'final Na+ identification should agree with the flame visual');
const counts = Object.fromEntries(metalIonPatterns.map(pattern => [pattern, 0]));
let previous = '';
const sampleCount = 12000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generateMetalIonProblem('mix');
  counts[problem.pattern] += 1;
  assert.equal(problem.answer, expectedAnswers[metalIonPatterns.indexOf(problem.pattern)]);
  assert.notEqual(problem.pattern, previous, 'mixed stages should not repeat consecutively');
  previous = problem.pattern;
}
for (const pattern of metalIonPatterns) assert.equal(counts[pattern], sampleCount / metalIonPatterns.length);
console.log(`Metal-ion drill verified: six fixed stages and ${sampleCount} balanced mixed questions (${JSON.stringify(counts)}).`);
