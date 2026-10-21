import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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
const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/metal-ion-drill/page.tsx'), 'utf8');
for (const answer of expectedAnswers) {
  assert.ok(drillPage.includes(`'${answer}'`), `every fixed-pattern answer must be available as a UI option: ${answer}`);
}
assert.match(drillPage, /disabled={!answer}/, 'answer submission should remain disabled until an option is selected');
assert.match(drillPage, /role="status" aria-live="polite"/, 'grading feedback should be announced accessibly');
assert.match(drillPage, /正解は「\$\{problem\.answer\}」です。/, 'incorrect answers should show the correct ion or reaction');
assert.match(drillPage, /\{problem\.explanation\}/, 'grading feedback should include the chemistry explanation');
assert.match(drillPage, /setAnswer\(''\);\s*setChecked\(false\);/, 'next question should clear the previous answer and feedback');
assert.match(drillPage, /<input type="radio" name="metal-ion-answer"/, 'answer choices should be a single-choice radio group');
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
