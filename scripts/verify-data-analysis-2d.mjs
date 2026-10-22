import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getCorrelationDirectionLabel } from '../src/lib/dataAnalysis2D.ts';

const page = fs.readFileSync('src/app/learn/math/data-analysis-2d-drill/page.tsx', 'utf8');
assert.ok(page.includes('getCorrelationDirectionLabel(rNum)'), 'scatter explanation must use the tested correlation classification');

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
