import assert from 'node:assert/strict';
import { flameMetals, generateFlameReactionProblem } from '../src/lib/flameReactionDrill.ts';

const expected = { Li: '赤色', Na: '黄色', K: '赤紫色', Cu: '青緑色', Ca: '橙赤色', Ba: '黄緑色' };
for (const metal of flameMetals) {
  const problem = generateFlameReactionProblem(metal);
  assert.equal(problem.metal, metal);
  assert.equal(problem.color, expected[metal]);
  assert.ok(problem.mnemonic.length > 0);
}
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
