import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getTrigonometryProbeStatus } from '../src/lib/trigonometryGraphProbe.ts';
import { clampTrigonometryParameter } from '../src/lib/trigonometryGraphParameters.ts';

const page = fs.readFileSync('src/app/learn/math/trigonometry-graph/page.tsx', 'utf8');
assert.match(page, /if \(a === 0\) return `y = \$\{d\}`/);
assert.ok(page.includes('式 y = a {func}(b(θ - c)) + d'));
assert.ok(page.includes("func === 'tan' ? '縦方向の倍率' : '縦の倍率 (振幅)'"));
for (const expected of [
  'clampTrigonometryParameter(parseFloat(e.target.value), -3, 3, 0)',
  'clampTrigonometryParameter(parseFloat(e.target.value), 0.2, 4, 1)',
  'clampTrigonometryParameter(parseInt(e.target.value, 10), -360, 360, 0)',
]) assert.ok(page.includes(expected), `manual parameter input must enforce its slider range: ${expected}`);
for (const label of [
  'aの値（${func === \'tan\' ? \'縦方向の倍率\' : \'縦の倍率・振幅\'}）',
  'aの値スライダー（${func === \'tan\' ? \'縦方向の倍率\' : \'縦の倍率・振幅\'}）',
  'bの値（周期係数）', 'bの値スライダー（周期係数）',
  'cの値（左右移動角）', 'cの値スライダー（左右移動角）',
  'dの値（上下移動量）', 'dの値スライダー（上下移動量）', '座標プローブの角度',
]) assert.ok(page.includes(`aria-label={\`${label}\`}`) || page.includes(`aria-label="${label}"`), `graph control is missing an accessible name: ${label}`);
assert.ok(page.includes('role="group" aria-label="対象の三角関数"'), 'function buttons must be announced as one labeled control group');
assert.ok(page.includes('aria-pressed={func === f}'), 'the selected trigonometric function must be announced');

for (const [value, min, max, fallback, expected] of [
  [9, -3, 3, 0, 3], [-9, -3, 3, 0, -3], [0.1, 0.2, 4, 1, 0.2], [9, 0.2, 4, 1, 4],
  [720, -360, 360, 0, 360], [-720, -360, 360, 0, -360], [Number.NaN, -3, 3, 0, 0],
]) assert.equal(clampTrigonometryParameter(value, min, max, fallback), expected);

assert.equal(getTrigonometryProbeStatus('tan', 90, 1.6e16, 3.5), 'undefined');
assert.equal(getTrigonometryProbeStatus('tan', 270, -5.4e15, 3.5), 'undefined');
assert.equal(getTrigonometryProbeStatus('tan', 105, Math.tan((105 * Math.PI) / 180), 3.5), 'out-of-range');
assert.equal(getTrigonometryProbeStatus('tan', 60, Math.tan((60 * Math.PI) / 180), 3.5), 'visible');
assert.equal(getTrigonometryProbeStatus('sin', 90, 1, 3.5), 'visible');
assert.equal(getTrigonometryProbeStatus('cos', 180, -1, 3.5), 'visible');
assert.equal(getTrigonometryProbeStatus('sin', 0, Number.NaN, 3.5), 'undefined');

console.log('Trigonometric graph probe verified: asymptotes, finite off-plot values, and visible coordinates are distinguished.');
