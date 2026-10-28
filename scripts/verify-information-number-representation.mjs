import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { byteToBinary, decodeByte, getBitWeights, getByteContributions } from '../src/lib/informationNumberRepresentation.ts';

assert.equal(byteToBinary(0), '00000000');
assert.equal(byteToBinary(255), '11111111');
assert.equal(decodeByte(128, 'unsigned'), 128);
assert.equal(decodeByte(128, 'twos-complement'), -128);
assert.equal(decodeByte(255, 'twos-complement'), -1);
assert.deepEqual(getBitWeights('twos-complement'), [-128, 64, 32, 16, 8, 4, 2, 1]);
assert.equal(getByteContributions(255, 'twos-complement').reduce((sum, part) => sum + part, 0), -1);
for (const invalid of [-1, 256, 1.5, Number.NaN]) assert.throws(() => byteToBinary(invalid), RangeError);

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/information/number-representation-visual/page.tsx'), 'utf8');
assert.ok(page.includes('min="4" max="16" step="1"') && page.includes('htmlFor="bit-width-slider"'), 'the visual must provide an accessible 4-to-16-bit width control');
assert.ok(page.includes('符号なし：0〜{unsignedMaximum}') && page.includes('2の補数：{signedMinimum}〜{signedMaximum}'), 'both representable ranges must update with the selected bit width');
assert.ok(page.includes('max={unsignedMaximum}') && page.includes('value.toString(2).padStart(bitWidth'), 'the bit pattern and unsigned slider must scale with the selected width');
assert.ok(page.includes("mode === 'twos-complement' ? '2の補数の例を試す' : '選ぶと2の補数表示に切り替わります'"), 'presets shown in unsigned mode must explain that they switch to signed interpretation');
assert.ok(page.includes("setMode('twos-complement'); setValue(preset.value)"), 'all signed presets, including the maximum positive value, must switch to signed interpretation');
assert.ok(page.includes('`${signedMaximum}（最大の正数）`') && page.includes('`${2 ** (bitWidth - 1)}（最小の負数）`') && page.includes('`${unsignedMaximum}（−1）`'), 'signed example presets must match the selected bit width');
assert.ok(!page.includes('setBitWidth(8)'), 'choosing a signed example must preserve the selected bit width');
assert.ok(page.includes('href="/learn/information/number-representation-drill"'), 'visual must link directly to the related drill');

console.log('Information number representation checks passed.');
