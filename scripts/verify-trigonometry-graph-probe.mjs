import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getTrigonometryProbeStatus } from '../src/lib/trigonometryGraphProbe.ts';

const page = fs.readFileSync('src/app/learn/math/trigonometry-graph/page.tsx', 'utf8');
assert.match(page, /if \(a === 0\) return `y = \$\{d\}`/);
assert.ok(page.includes('式 y = a {func}(b(θ - c)) + d'));
assert.ok(page.includes("func === 'tan' ? '縦方向の倍率' : '縦の倍率 (振幅)'"));

assert.equal(getTrigonometryProbeStatus('tan', 90, 1.6e16, 3.5), 'undefined');
assert.equal(getTrigonometryProbeStatus('tan', 270, -5.4e15, 3.5), 'undefined');
assert.equal(getTrigonometryProbeStatus('tan', 105, Math.tan((105 * Math.PI) / 180), 3.5), 'out-of-range');
assert.equal(getTrigonometryProbeStatus('tan', 60, Math.tan((60 * Math.PI) / 180), 3.5), 'visible');
assert.equal(getTrigonometryProbeStatus('sin', 90, 1, 3.5), 'visible');
assert.equal(getTrigonometryProbeStatus('cos', 180, -1, 3.5), 'visible');
assert.equal(getTrigonometryProbeStatus('sin', 0, Number.NaN, 3.5), 'undefined');

console.log('Trigonometric graph probe verified: asymptotes, finite off-plot values, and visible coordinates are distinguished.');
