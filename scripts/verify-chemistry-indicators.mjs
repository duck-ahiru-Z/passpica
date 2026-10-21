import assert from 'node:assert/strict';
import { getIndicatorDisplay } from '../src/lib/chemistryIndicator.ts';

function parseRgba(color) {
  const match = color.match(/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/);
  assert.ok(match, `invalid CSS color: ${color}`);
  return match.slice(1).map(Number);
}

for (let tenths = 10; tenths <= 140; tenths++) {
  const ph = tenths / 10;
  for (const indicator of ['pp', 'litmus', 'mo']) {
    const result = getIndicatorDisplay(indicator, ph);
    assert.ok(result.indicatorName.length > 0);
    assert.ok(result.colorName.length > 0);
    const [red, green, blue, alpha] = parseRgba(result.backgroundColor);
    for (const channel of [red, green, blue]) assert.ok(channel >= 0 && channel <= 255);
    assert.ok(alpha > 0 && alpha <= 1);
  }
}

assert.equal(getIndicatorDisplay('pp', 8.2).colorName, '無色');
assert.equal(getIndicatorDisplay('pp', 8.3).colorName, '赤紫色');
assert.equal(getIndicatorDisplay('pp', 14).colorName, '赤紫色');
assert.notEqual(getIndicatorDisplay('pp', 8.3).backgroundColor, getIndicatorDisplay('pp', 10).backgroundColor);
assert.equal(getIndicatorDisplay('litmus', 5).colorName, '赤色');
assert.equal(getIndicatorDisplay('litmus', 6.5).colorName, '赤紫色');
assert.equal(getIndicatorDisplay('litmus', 7).colorName, '紫色');
assert.equal(getIndicatorDisplay('litmus', 8).colorName, '青色');
assert.notEqual(getIndicatorDisplay('litmus', 5.5).backgroundColor, getIndicatorDisplay('litmus', 6).backgroundColor);
assert.notEqual(getIndicatorDisplay('litmus', 6.5).backgroundColor, getIndicatorDisplay('litmus', 7).backgroundColor);
assert.notEqual(getIndicatorDisplay('litmus', 7).backgroundColor, getIndicatorDisplay('litmus', 7.5).backgroundColor);
assert.equal(getIndicatorDisplay('mo', 3.1).colorName, '赤色');
assert.equal(getIndicatorDisplay('mo', 3.75).colorName, '橙色');
assert.equal(getIndicatorDisplay('mo', 4.4).colorName, '黄色');
assert.notEqual(getIndicatorDisplay('mo', 3.4).backgroundColor, getIndicatorDisplay('mo', 4.1).backgroundColor);
assert.equal(getIndicatorDisplay('litmus', -5).colorName, getIndicatorDisplay('litmus', 1).colorName);
assert.equal(getIndicatorDisplay('mo', 20).colorName, getIndicatorDisplay('mo', 14).colorName);

console.log('Chemistry indicators verified: 393 pH-indicator combinations, transition intervals, endpoint colors, and pH bounds.');
