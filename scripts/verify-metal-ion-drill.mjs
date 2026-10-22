import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateMetalIonProblem, metalIonLabels, metalIonPatterns } from '../src/lib/metalIonDrill.ts';
import { generateFlameReactionProblem } from '../src/lib/flameReactionDrill.ts';

const expectedAnswers = ['Ag⁺・Pb²⁺', 'AgCl残渣・PbCl₂再沈殿', 'Cu²⁺', 'Fe³⁺・Al³⁺', 'Zn²⁺', 'Ca²⁺', '炎色反応・黄色'];
const expectedLabels = ['希塩酸による塩化物沈殿', '熱水によるAgCl・PbCl₂の分離', '酸性条件での硫化物沈殿', '過剰アンモニア水での水酸化物分離', '塩基性条件での硫化物沈殿', '炭酸イオンによるCa²⁺の分離', '残留Na⁺の炎色反応確認'];
for (const [index, pattern] of metalIonPatterns.entries()) {
  const problem = generateMetalIonProblem(pattern);
  assert.equal(problem.pattern, pattern);
  assert.equal(problem.answer, expectedAnswers[index]);
  assert.equal(metalIonLabels[pattern], expectedLabels[index]);
  assert.ok(problem.explanation.length > 10);
}
const acidicSulfideProblem = generateMetalIonProblem('acidicSulfide');
assert.match(acidicSulfideProblem.explanation, /Fe³⁺はH₂Sに還元されてFe²⁺となり/);
assert.match(acidicSulfideProblem.explanation, /硝酸でFe³⁺へ酸化してから/);
const leadChlorideProblem = generateMetalIonProblem('leadChloride');
assert.match(leadChlorideProblem.prompt, /熱水を加えてろ過/);
assert.match(leadChlorideProblem.explanation, /冷却するとPbCl₂が白色結晶として再び析出/);
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
const sampleCount = 14000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generateMetalIonProblem('mix');
  counts[problem.pattern] += 1;
  assert.equal(problem.answer, expectedAnswers[metalIonPatterns.indexOf(problem.pattern)]);
  assert.notEqual(problem.pattern, previous, 'mixed stages should not repeat consecutively');
  previous = problem.pattern;
}
for (const pattern of metalIonPatterns) assert.equal(counts[pattern], sampleCount / metalIonPatterns.length);
console.log(`Metal-ion drill verified: seven fixed stages and ${sampleCount} balanced mixed questions (${JSON.stringify(counts)}).`);
