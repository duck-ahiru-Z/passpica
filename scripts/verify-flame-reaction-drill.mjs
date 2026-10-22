import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { flameMetals, generateFlameReactionProblem } from '../src/lib/flameReactionDrill.ts';

const expected = { Li: '赤色', Na: '黄色', K: '赤紫色', Cu: '青緑色', Ca: '橙赤色', Ba: '黄緑色' };
const expectedMnemonics = {
  Li: 'リアカー（Li:赤）', Na: 'リアカーなき（Na:黄）', K: 'リアカーなきK村（K:赤紫）',
  Cu: 'リアカーなきK村、動力（Cu:青緑）', Ca: 'リアカーなきK村、動力借りると（Ca:橙赤）', Ba: 'リアカーなきK村、動力借りるとする馬力（Ba:黄緑）',
};
for (const metal of flameMetals) {
  const problem = generateFlameReactionProblem(metal);
  assert.equal(problem.metal, metal);
  assert.equal(problem.color, expected[metal]);
  assert.equal(problem.mnemonic, expectedMnemonics[metal]);
}
const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/flame-reaction-drill/page.tsx'), 'utf8');
const visualPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/flame-reaction/page.tsx'), 'utf8');
const expectedColors = Object.values(expected);
for (const color of expectedColors) {
  assert.ok(drillPage.includes(`'${color}'`), `each flame color must be available in the drill choices: ${color}`);
}
assert.match(drillPage, /name="flame-color"/, 'flame colors should be selected as a single-choice radio group');
assert.match(drillPage, /disabled={!color}/, 'answer submission should remain disabled until a color is selected');
assert.match(drillPage, /role="status" aria-live="polite"/, 'grading feedback should be announced accessibly');
assert.match(drillPage, /正解は「\$\{problem\.color\}」です。/, 'incorrect answers should reveal the expected flame color');
assert.match(drillPage, /\{problem\.mnemonic\}/, 'feedback should include the element mnemonic');
assert.match(drillPage, /href="\/learn\/chemistry\/flame-reaction"/, 'the drill should link to its flame visual');
assert.match(visualPage, /href="\/learn\/chemistry\/flame-reaction-drill"/, 'the flame visual should link back to its drill');
const counts = Object.fromEntries(flameMetals.map(metal => [metal, 0]));
let previous = '';
const sampleCount = 12000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generateFlameReactionProblem('mix');
  counts[problem.metal] += 1;
  assert.equal(problem.color, expected[problem.metal]);
  assert.notEqual(problem.metal, previous, 'a mixed batch should not repeat the same metal consecutively');
  previous = problem.metal;
}
for (const metal of flameMetals) assert.equal(counts[metal], sampleCount / flameMetals.length);
console.log(`Flame reaction drill verified: six fixed patterns and ${sampleCount} balanced mixed questions (${JSON.stringify(counts)}).`);
