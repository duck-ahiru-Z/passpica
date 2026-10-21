import assert from 'node:assert/strict';
import { generateOrganicSeparationProblem, organicSeparationPatterns } from '../src/lib/organicSeparationDrill.ts';

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
