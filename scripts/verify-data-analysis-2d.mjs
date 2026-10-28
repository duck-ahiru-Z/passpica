import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateCorrelationScatterPoints, getCorrelationDirectionLabel } from '../src/lib/dataAnalysis2D.ts';
import { buildCrossTableExplanation, buildScatterPlotDescription, isDataAnalysis2DAnswerCorrect } from '../src/lib/dataAnalysis2DAnswers.ts';

const page = fs.readFileSync('src/app/learn/math/data-analysis-2d-drill/page.tsx', 'utf8');
assert.ok(page.includes('getCorrelationDirectionLabel(rNum)'), 'scatter explanation must use the tested correlation classification');
assert.ok(page.includes('aria-label="2変量データ分析の演習パターン"'), 'pattern selector must have an accessible name');
assert.ok(page.includes('isDataAnalysis2DAnswerCorrect(ans1, problem.ans1 ?? \'\')'), 'grading must use strict numeric answer validation');
assert.ok(page.includes('role="img"'), 'scatter canvas must be exposed as an image to assistive technology');
assert.ok(page.includes('aria-label={buildScatterPlotDescription(problem.scatterPoints)}'), 'scatter description must follow the current problem data');

assert.equal(
  buildScatterPlotDescription([{ x: 1.24, y: -3.26 }, { x: 4, y: 2 }]),
  '散布図。横軸x、縦軸y。2個のデータ点の座標: (1.2, -3.3)、(4.0, 2.0)',
);
assert.equal(buildScatterPlotDescription(undefined), '散布図。横軸x、縦軸y。データ点はありません。');

for (const [answer, expected, result] of [
  ['', '0', false], ['   ', '0', false], ['0', '0', true], ['-0.8', '-0.8', true],
  ['1,200', '1200', true], ['0abc', '0', false], ['1e2', '100', false],
  ['Infinity', 'Infinity', false], ['NaN', 'NaN', false], ['.5', '0.5', true],
]) {
  assert.equal(isDataAnalysis2DAnswerCorrect(answer, expected), result, `answer validation failed for ${JSON.stringify(answer)}`);
}

for (const [targetCell, expected] of [
  ['a', '[A] = 31 - 17 = 14'], ['b', '[A] = 31 - 14 = 17'],
  ['c', '[A] = 27 - 14 = 13'], ['d', '[A] = 39 - 17 = 22'],
]) {
  const [formula] = buildCrossTableExplanation({
    a: 14, b: 17, c: 13, d: 22, totA: 31, totB: 35, totC: 27, totD: 39, targetCell,
  }).slice(1);
  assert.equal(formula, expected, `wrong cross-table derivation for cell ${targetCell}`);
}

for (const [correlation, expected] of [
  [-0.9, '右下がり（負の相関）'],
  [-0.5, '右下がり（負の相関）'],
  [-0.4, '右下がり（負の相関）'],
  [-0.3, 'バラバラ（無相関）'],
  [0, 'バラバラ（無相関）'],
  [0.3, 'バラバラ（無相関）'],
  [0.4, '右上がり（正の相関）'],
  [0.5, '右上がり（正の相関）'],
  [0.9, '右上がり（正の相関）'],
]) {
  assert.equal(getCorrelationDirectionLabel(correlation), expected, `unexpected trend label at r=${correlation}`);
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

for (let targetStep = -9; targetStep <= 9; targetStep++) {
  const target = targetStep / 10;
  for (let sample = 0; sample < 20; sample++) {
    const points = generateCorrelationScatterPoints(target, seededRandom(1000 + targetStep * 100 + sample));
    assert.equal(points.length, 30, 'scatter estimator should render 30 points');
    const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
    const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
    const crossSum = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0);
    const xSum = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
    const ySum = points.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0);
    const actual = crossSum / Math.sqrt(xSum * ySum);
    assert.ok(Math.abs(actual - target) < 1e-12, `scatter Pearson r=${actual} must match target r=${target}`);
    assert.equal(getCorrelationDirectionLabel(actual), getCorrelationDirectionLabel(target), `scatter explanation must match plotted r=${actual}`);
    assert.ok(points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)), 'scatter coordinates must be finite');
  }
}
assert.throws(() => generateCorrelationScatterPoints(1.01), RangeError);
assert.throws(() => generateCorrelationScatterPoints(0.5, Math.random, 2), RangeError);

console.log('2-variable data analysis verified: trend boundaries, 380 exact-correlation scatter samples, strict answers, cross-table derivations and accessible chart descriptions.');
