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
assert.ok(page.includes("mode === 'twos-complement' ? 'ビット列の符号なし表現（0〜255）から設定'"), 'signed mode must explain that the slider sets the raw byte pattern');
assert.ok(page.includes("mode === 'twos-complement' ? 'ビット列の符号なし表現値（0〜255）'"), 'signed mode slider needs an accessible raw-byte label');
assert.ok(page.includes("mode === 'twos-complement' ? '2の補数の例を試す' : '選ぶと2の補数表示に切り替わります'"), 'presets shown in unsigned mode must explain that they switch to signed interpretation');
assert.ok(page.includes("setMode('twos-complement'); setValue(preset.value)"), 'all signed presets, including the maximum positive value, must switch to signed interpretation');
assert.ok(page.includes('href="/learn/information/number-representation-drill"'), 'visual must link directly to the related drill');

console.log('Information number representation checks passed.');
