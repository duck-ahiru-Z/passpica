import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateOrganicSeparationProblem, organicSeparationPatterns } from '../src/lib/organicSeparationDrill.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/organic-separation-drill/page.tsx'), 'utf8');
const visualPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/organic-separation/page.tsx'), 'utf8');
const packageScripts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).scripts;
assert.ok(packageScripts['test:organic-separation-drill']?.includes('verify-organic-separation-drill.mjs'), 'the focused/mixed organic separation verifier must have a dedicated npm script');
for (const choice of ['アニリン', '安息香酸', 'フェノール', 'ニトロベンゼン']) {
  assert.ok(drillPage.includes(`'${choice}'`), `all candidate substances must be selectable: ${choice}`);
}
assert.match(drillPage, /name="organic-separation-answer"/, 'substance choices should form a single-choice radio group');
assert.match(drillPage, /disabled={!answer}/, 'answer submission should remain disabled until a substance is selected');
assert.match(drillPage, /role="status" aria-live="polite"/, 'grading feedback should be announced accessibly');
assert.match(drillPage, /正解は「\$\{problem\.answer\}」です。/, 'incorrect answers should reveal the extracted substance');
assert.match(drillPage, /\{problem\.explanation\}/, 'feedback should explain the acid/base extraction');
assert.match(drillPage, /href="\/learn\/chemistry\/organic-separation"/, 'the drill should link to the layer visual');
assert.match(visualPage, /href="\/learn\/chemistry\/organic-separation-drill"/, 'the layer visual should link back to the drill');

const expected = { aniline: 'アニリン', benzoicAcid: '安息香酸', phenol: 'フェノール' };
for (const pattern of organicSeparationPatterns) {
  const prompts = new Set();
  for (let index = 0; index < 12; index += 1) {
    const problem = generateOrganicSeparationProblem(pattern);
    assert.equal(problem.pattern, pattern);
    assert.equal(problem.answer, expected[pattern]);
    assert.ok(problem.explanation.length > 10);
    prompts.add(problem.prompt);
  }
  assert.equal(prompts.size, 3, `${pattern} fixed practice should rotate through three different prompts`);
}
assert.match(generateOrganicSeparationProblem('benzoicAcid').explanation, /炭酸より弱酸/);
assert.match(generateOrganicSeparationProblem('phenol').explanation, /ニトロベンゼンはエーテル層に残ります/);
const counts = Object.fromEntries(organicSeparationPatterns.map(pattern => [pattern, 0]));
let previous = '';
const sampleCount = 9000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generateOrganicSeparationProblem('mix');
  counts[problem.pattern] += 1;
  assert.equal(problem.answer, expected[problem.pattern]);
  assert.notEqual(problem.pattern, previous, 'mixed extraction patterns should not repeat consecutively');
  previous = problem.pattern;
}
for (const pattern of organicSeparationPatterns) assert.equal(counts[pattern], 3000);
console.log(`Organic separation drill verified: three fixed extraction patterns and ${sampleCount} balanced mixed questions (${JSON.stringify(counts)}).`);
