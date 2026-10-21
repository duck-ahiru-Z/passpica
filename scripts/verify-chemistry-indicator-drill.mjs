import assert from 'node:assert/strict';
import {
  generateIndicatorProblem,
  indicatorDrillPatterns,
  isIndicatorColorAnswerCorrect,
} from '../src/lib/chemistryIndicatorDrill.ts';
import { getIndicatorDisplay } from '../src/lib/chemistryIndicator.ts';

const fixedSamples = 2400;
for (const pattern of indicatorDrillPatterns) {
  const pHCounts = new Map();
  let previousPH;
  for (let index = 0; index < fixedSamples; index += 1) {
    const problem = generateIndicatorProblem(pattern);
    assert.equal(problem.pattern, pattern, `${pattern} fixed mode must not leak another indicator`);
    assert.equal(problem.answer, getIndicatorDisplay(pattern, problem.pH).colorName);
    assert.match(problem.question, new RegExp(`pH ${problem.pH.toFixed(1)}`));
    assert.ok(problem.explanation.includes(problem.answer), 'explanation must state the generated answer');
    assert.notEqual(problem.pH, previousPH, 'balanced scenario batches should avoid adjacent repeats');
    pHCounts.set(problem.pH, (pHCounts.get(problem.pH) ?? 0) + 1);
    previousPH = problem.pH;
  }
  assert.equal(pHCounts.size, 8, `${pattern} fixed mode must reach all eight pH scenarios`);
  for (const count of pHCounts.values()) assert.equal(count, fixedSamples / 8);
}

const mixedSamples = 30_000;
const patternCounts = new Map(indicatorDrillPatterns.map(pattern => [pattern, 0]));
const scenarioCounts = new Map(indicatorDrillPatterns.map(pattern => [pattern, new Map()]));
let previousPattern;
for (let index = 0; index < mixedSamples; index += 1) {
  const problem = generateIndicatorProblem('mix');
  assert.ok(indicatorDrillPatterns.includes(problem.pattern));
  assert.equal(problem.answer, getIndicatorDisplay(problem.pattern, problem.pH).colorName);
  assert.ok(problem.explanation.includes(problem.answer));
  assert.notEqual(problem.pattern, previousPattern, 'mixed indicator patterns should not repeat consecutively');
  patternCounts.set(problem.pattern, patternCounts.get(problem.pattern) + 1);
  const pHCounts = scenarioCounts.get(problem.pattern);
  pHCounts.set(problem.pH, (pHCounts.get(problem.pH) ?? 0) + 1);
  previousPattern = problem.pattern;
}

for (const pattern of indicatorDrillPatterns) {
  assert.equal(patternCounts.get(pattern), mixedSamples / indicatorDrillPatterns.length, `${pattern} should appear equally often`);
  const pHCounts = scenarioCounts.get(pattern);
  assert.equal(pHCounts.size, 8, `${pattern} mixed mode must reach each pH scenario`);
  for (const count of pHCounts.values()) assert.equal(count, mixedSamples / indicatorDrillPatterns.length / 8);
}

for (const pattern of indicatorDrillPatterns) {
  for (const pH of [3.1, 3.75, 4.4, 5, 7, 8, 8.2, 8.3, 10]) {
    const display = getIndicatorDisplay(pattern, pH);
    assert.ok(isIndicatorColorAnswerCorrect(display.colorName, display.colorName));
    assert.equal(isIndicatorColorAnswerCorrect('ありえない色', display.colorName), false);
  }
}

assert.ok(isIndicatorColorAnswerCorrect('  赤紫色  ', '赤紫色'), 'surrounding whitespace should be ignored');
console.log('Chemistry indicator drill verified: fixed and mixed modes, 30,000 balanced mixed questions, scenario reach, answer keys, boundaries, and explanations.');
