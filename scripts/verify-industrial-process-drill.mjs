import assert from 'node:assert/strict';
import { generateIndustrialProblem, industrialPatterns } from '../src/lib/industrialProcessDrill.ts';

assert.equal(industrialPatterns.length, 11);
const mapped = new Map();
for (const pattern of industrialPatterns) {
  const problem = generateIndustrialProblem(pattern);
  assert.equal(problem.pattern, pattern);
  assert.ok(problem.options.includes(problem.answer), `${pattern} answer must be selectable`);
  assert.equal(new Set(problem.options).size, problem.options.length, `${pattern} options must be unique`);
  assert.ok(problem.explanation.length > 10);
  mapped.set(pattern, problem);
}
assert.match(mapped.get('contact-2').explanation, /V₂O₅/);
assert.match(mapped.get('ostwald-3').explanation, /副生NO/);
assert.match(mapped.get('solvay-2').explanation, /CO₂/);
assert.match(mapped.get('solvay-5').explanation, /再利用/);
const counts = Object.fromEntries(industrialPatterns.map(pattern => [pattern, 0]));
let previous = '';
const sampleCount = 11000;
for (let index = 0; index < sampleCount; index += 1) {
  const problem = generateIndustrialProblem('mix');
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'mixed stages should not repeat consecutively');
  assert.ok(problem.options.includes(problem.answer));
  previous = problem.pattern;
}
for (const pattern of industrialPatterns) assert.equal(counts[pattern], 1000);
console.log(`Industrial process drill verified: ${industrialPatterns.length} fixed patterns and ${sampleCount} balanced mixed questions.`);
