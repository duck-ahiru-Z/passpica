import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getCorrelationDirectionLabel } from '../src/lib/dataAnalysis2D.ts';
import { isDataAnalysis2DAnswerCorrect } from '../src/lib/dataAnalysis2DAnswers.ts';

const page = fs.readFileSync('src/app/learn/math/data-analysis-2d-drill/page.tsx', 'utf8');
assert.ok(page.includes('getCorrelationDirectionLabel(rNum)'), 'scatter explanation must use the tested correlation classification');
assert.ok(page.includes('aria-label="2変量データ分析の演習パターン"'), 'pattern selector must have an accessible name');
assert.ok(page.includes('isDataAnalysis2DAnswerCorrect(ans1, problem.ans1 ?? \'\')'), 'grading must use strict numeric answer validation');

for (const [answer, expected, result] of [
  ['', '0', false], ['   ', '0', false], ['0', '0', true], ['-0.8', '-0.8', true],
  ['1,200', '1200', true], ['0abc', '0', false], ['1e2', '100', false],
  ['Infinity', 'Infinity', false], ['NaN', 'NaN', false], ['.5', '0.5', true],
]) {
  assert.equal(isDataAnalysis2DAnswerCorrect(answer, expected), result, `answer validation failed for ${JSON.stringify(answer)}`);
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

console.log('2-variable data analysis verified: positive/negative correlation classification includes exact ±0.4 boundaries.');
