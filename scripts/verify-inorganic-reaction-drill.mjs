import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateInorganicProblem, inorganicPatterns } from '../src/lib/inorganicReactionDrill.ts';
import { generateFlameReactionProblem } from '../src/lib/flameReactionDrill.ts';

assert.equal(inorganicPatterns.length, 15);
const visual = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/inorganic-colors/page.tsx'), 'utf8');
const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/inorganic-colors-drill/page.tsx'), 'utf8');
const packageScripts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')).scripts;
assert.ok(packageScripts['test:inorganic-reaction-drill']?.includes('verify-inorganic-reaction-drill.mjs'), 'the inorganic fixed/mixed verifier must have a dedicated npm script');
assert.ok(drillPage.includes('<option value="mix">実戦練習：無機イオン反応 全パターンランダム</option>'), 'the drill UI must offer mixed strategy practice');
assert.match(drillPage, /inorganicPatterns\.map\(pattern => <option/, 'the drill UI must offer every fixed condition pattern');
assert.match(drillPage, /name="inorganic-outcome"/, 'reaction outcomes must use a single-choice radio group');
assert.match(drillPage, /disabled={!answer}/, 'answer submission must remain disabled until an outcome is selected');
assert.match(drillPage, /role="status" aria-live="polite"/, 'grading feedback must be announced accessibly');
assert.match(drillPage, /href="\/learn\/chemistry\/inorganic-colors"/, 'the drill must connect to the reaction visual');
assert.ok(visual.includes('href="/learn/chemistry/inorganic-colors-drill"'), 'the reaction visual must connect back to focused and mixed practice');
const visualReactionEvidence = {
  'cu-ammonia-small': 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓ (青白色沈殿)',
  'cu-ammonia-excess': 'Cu(OH)₂ + 4NH₃ → [Cu(NH₃)₄]²⁺ + 2OH⁻ (深青色溶液)',
  'al-sodium-small': 'Al³⁺ + 3OH⁻ → Al(OH)₃↓ (白色ゲル状沈殿)',
  'al-sodium-excess': 'Al(OH)₃ + OH⁻ → [Al(OH)₄]⁻',
  'zn-sodium-small': 'Zn²⁺ + 2OH⁻ → Zn(OH)₂↓ (白色沈殿)',
  'zn-sodium-excess': 'Zn(OH)₂ + 2OH⁻ → [Zn(OH)₄]²⁻',
  'ag-ammonia-small': '2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O (酸化銀・褐色沈殿)',
  'ag-ammonia-excess': 'Ag₂O + 4NH₃ + H₂O → 2[Ag(NH₃)₂]⁺ + 2OH⁻',
  'pb-iodide': 'Pb²⁺ + 2I⁻ → PbI₂↓ (ヨウ化鉛・黄色沈殿)',
  'zn-sulfide-acid': '酸性下では沈殿せず',
  'zn-sulfide-base': 'Zn²⁺ + S²⁻ → ZnS↓ (白色沈殿)',
  'fe3-sulfide-acid': '2Fe³⁺ + H₂S → 2Fe²⁺ + S（コロイド） + 2H⁺',
  'fe3-sulfide-base': '2Fe³⁺ + 3H₂S + 6OH⁻ → 2FeS↓ + S↓ + 6H₂O',
  'fe3-iodide': '2Fe³⁺ + 2I⁻ → 2Fe²⁺ + I₂ (褐色溶液)',
  'cu-iodide': '2Cu²⁺ + 4I⁻ → 2CuI↓ + I₂ (白色沈殿・褐色溶液)',
};
const drillEquationEvidence = {
  ...Object.fromEntries(Object.entries(visualReactionEvidence).map(([pattern, reaction]) => [pattern, reaction.split(' (')[0]])),
  'fe3-sulfide-acid': '2Fe³⁺ + H₂S → 2Fe²⁺ + S',
};
const outcomes = new Set();
for (const pattern of inorganicPatterns) {
  const problem = generateInorganicProblem(pattern);
  assert.equal(problem.pattern, pattern);
  assert.ok(problem.prompt.length > 15);
  assert.ok(problem.formula.length > 3);
  assert.ok(problem.explanation.length > 15);
  assert.ok(visual.includes(visualReactionEvidence[pattern]), `${pattern} must match an exact reaction represented in the simulator`);
  assert.ok(problem.formula.includes(drillEquationEvidence[pattern]), `${pattern} equation must match the simulator's reaction`);
  outcomes.add(problem.answer);
}
assert.ok(outcomes.size >= 10, 'distinct visible reaction outcomes should remain represented');
assert.equal(generateFlameReactionProblem('Li').color, '赤色');
const counts = Object.fromEntries(inorganicPatterns.map(pattern => [pattern, 0]));
let previous = '';
const sampleCount = 15000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generateInorganicProblem('mix');
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'mixed reaction patterns should not repeat consecutively');
  assert.equal(problem.answer, generateInorganicProblem(problem.pattern).answer);
  previous = problem.pattern;
}
for (const pattern of inorganicPatterns) assert.equal(counts[pattern], 1000);
console.log(`Inorganic reaction drill verified: ${inorganicPatterns.length} fixed condition patterns and ${sampleCount} balanced mixed questions.`);
