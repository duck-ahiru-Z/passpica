import assert from 'node:assert/strict';
import fs from 'node:fs';
import { calculateDopplerFrequency, dopplerPatterns, generateDopplerProblem, isDopplerAnswerCorrect } from '../src/lib/physicsDoppler.ts';

let seed = 0x10282026;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
const counts = Object.fromEntries(dopplerPatterns.map(pattern => [pattern, 0]));
const directionCases = new Set();
let previous = '';
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateDopplerProblem('mix', random);
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'balanced mixed mode must not repeat a pattern adjacently');
  const sourceMoves = problem.pattern === 'sourceMoves' || problem.pattern === 'bothMove';
  const observerMoves = problem.pattern === 'observerMoves' || problem.pattern === 'bothMove';
  assert.equal(problem.sourceSpeed > 0, sourceMoves);
  assert.equal(problem.observerSpeed > 0, observerMoves);
  assert.equal(problem.question.includes('音源は静止'), !sourceMoves);
  assert.equal(problem.question.includes('観測者は静止'), !observerMoves);
  if (problem.pattern === 'bothMove') directionCases.add(`${Number(problem.sourceApproaching)}${Number(problem.observerApproaching)}`);

  const numerator = problem.soundSpeed + (problem.observerApproaching ? problem.observerSpeed : -problem.observerSpeed);
  const denominator = problem.soundSpeed - (problem.sourceApproaching ? problem.sourceSpeed : -problem.sourceSpeed);
  const independent = problem.emittedFrequency * numerator / denominator;
  assert.ok(Math.abs(problem.answer - independent) < 1e-10, `${problem.pattern}: generated answer differs from independent formula`);
  assert.ok(Number.isFinite(problem.answer) && problem.answer > 0);
  assert.ok(isDopplerAnswerCorrect(problem.answer.toFixed(2), problem.answer));
  assert.ok(!isDopplerAnswerCorrect((problem.answer + 10).toFixed(2), problem.answer));
  previous = problem.pattern;
}
for (const pattern of dopplerPatterns) assert.equal(counts[pattern], 5_000, `${pattern} must be sampled evenly`);
assert.deepEqual([...directionCases].sort(), ['00', '01', '10', '11'], 'both-moving mode must cover all approach/recede direction combinations');
assert.equal(calculateDopplerFrequency({ emittedFrequency: 500, soundSpeed: 340, sourceSpeed: 0, observerSpeed: 0, sourceApproaching: false, observerApproaching: false }), 500);
assert.equal(calculateDopplerFrequency({ emittedFrequency: 500, soundSpeed: 340, sourceSpeed: 0, observerSpeed: 20, sourceApproaching: false, observerApproaching: true }), 500 * 360 / 340);
assert.equal(calculateDopplerFrequency({ emittedFrequency: 500, soundSpeed: 340, sourceSpeed: 20, observerSpeed: 0, sourceApproaching: true, observerApproaching: false }), 500 * 340 / 320);
assert.equal(calculateDopplerFrequency({ emittedFrequency: 500, soundSpeed: 340, sourceSpeed: 20, observerSpeed: 20, sourceApproaching: false, observerApproaching: true }), 500 * 360 / 360);

const visual = fs.readFileSync('src/app/learn/physics/doppler-visual/page.tsx', 'utf8');
const drill = fs.readFileSync('src/app/learn/physics/doppler-drill/page.tsx', 'utf8');
const portal = fs.readFileSync('src/app/learn/page.tsx', 'utf8');
const drillPortal = fs.readFileSync('src/app/drill/page.tsx', 'utf8');
assert.ok(visual.includes('aria-label="音源の動く向き"') && visual.includes('aria-label="観測者の動く向き"'));
assert.ok(visual.includes('role="img" aria-label={`音源') && visual.includes('observerSideSpacing') && visual.includes('oppositeSideSpacing'));
assert.ok(drill.includes('value="mix"') && drill.includes('全パターンランダム') && drill.includes('name="doppler-method"'));
assert.ok(drill.includes('dopplerPatterns.map(pattern => <option') && drill.includes('dopplerPatterns.map(pattern => <label key={pattern}'));
assert.ok(portal.includes("slug: 'doppler-visual'") && portal.includes("practiceLink: '/learn/physics/doppler-drill'"));
assert.ok(drillPortal.includes("slug: 'doppler-drill'") && drillPortal.includes('全4パターン'));
console.log(`Doppler verified: 20,000 balanced mixed questions (5,000 per pattern), independent equation checks, all four approach/recede combinations for both-moving questions, strict answer checks, and reciprocal visual/drill navigation. ${JSON.stringify(counts)}`);
