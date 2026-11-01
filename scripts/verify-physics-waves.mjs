import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateWaveCalculationProblem, waveCalculationPatterns, isWaveAnswerCorrect, formatWaveAnswer } from '../src/lib/physicsWaveCalculation.ts';
import { calculateResultantAmplitude } from '../src/lib/physicsWaveSuperposition.ts';

let seed = 20261028;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
const counts = Object.fromEntries(waveCalculationPatterns.map(pattern => [pattern, 0]));
let previous = '';
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateWaveCalculationProblem('mix', random);
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'mixed practice should not repeat a pattern consecutively');
  assert.ok(problem.question.length > 10 && problem.explanation.length > 10);
  assert.ok(Number.isFinite(problem.answer) && problem.answer >= 0);
  assert.ok(isWaveAnswerCorrect(formatWaveAnswer(problem.answer), problem.answer));
  assert.ok(!isWaveAnswerCorrect('', problem.answer));
  previous = problem.pattern;
}
for (const pattern of waveCalculationPatterns) assert.equal(counts[pattern], 4_000);

const expected = {
  waveSpeed: [3, 8, 5], frequency: [2, 4, 10], period: [0.1, 0.25, 2],
  phaseDifference: [60, 90, 180, 270, 300], resultantAmplitude: [0, 60, 90, 120, 180, 240, 270, 300, 360],
};
for (const pattern of waveCalculationPatterns) {
  for (const value of expected[pattern]) {
    const fixed = generateWaveCalculationProblem(pattern, () => value / 1000);
    assert.equal(fixed.pattern, pattern, `fixed mode should stay on ${pattern}`);
    assert.ok(Number.isFinite(fixed.answer));
  }
}
assert.ok(Math.abs(calculateResultantAmplitude(2, 0) - 4) < 1e-10);
assert.ok(Math.abs(calculateResultantAmplitude(2, 180)) < 1e-10);
assert.ok(Math.abs(calculateResultantAmplitude(2, 90) - 2 * Math.SQRT2) < 1e-10);

const visual = fs.readFileSync('src/app/learn/physics/wave-superposition-visual/page.tsx', 'utf8');
const drill = fs.readFileSync('src/app/learn/physics/wave-calculation-drill/page.tsx', 'utf8');
assert.ok(visual.includes('aria-label="波の位相差"') && visual.includes('aria-label="各波の振幅"'));
assert.ok(visual.includes('href="/learn/physics/wave-calculation-drill"'));
assert.ok(drill.includes('href="/learn/physics/wave-superposition-visual"'));
assert.ok(drill.includes('問題に合う計算方法を選んでください'));
console.log(`Physics wave drill verified: 20,000 mixed questions, even pattern counts ${JSON.stringify(counts)}, focused modes and visual linkage.`);
