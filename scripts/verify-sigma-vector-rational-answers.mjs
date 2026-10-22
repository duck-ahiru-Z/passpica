import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseRationalAnswer, rationalEquals } from '../src/lib/rationalInput.ts';
import { BalancedRandom } from '../src/lib/balancedRandom.ts';

const routes = ['sigma-calculation-drill', 'vector-dot-product-drill'];
for (const route of routes) {
  const page = fs.readFileSync(path.join(process.cwd(), `src/app/learn/math/${route}/page.tsx`), 'utf8');
  assert.ok(page.includes('parseRationalAnswer(ansVal)'), `${route} must strictly parse rational answers`);
  assert.ok(page.includes('rationalEquals(answer,'), `${route} must compare normalized rational answers`);
  assert.ok(!/parseInt\((?:parts\[|uStr)/.test(page), `${route} must not truncate malformed answers`);
}

const vectorPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/vector-dot-product-drill/page.tsx'), 'utf8');
for (const label of ['ベクトルaとbの内積', 'ベクトルaとbのなす角（度）', '垂直条件を満たすxの値', 'ベクトルaとbの和の大きさの二乗']) {
  assert.ok(vectorPage.includes(label), `vector dot-product answer needs an accessible label for ${label}`);
}
assert.ok(vectorPage.includes("new BalancedRandom<Pattern>(['pattern1', 'pattern2', 'pattern3', 'pattern4'])"));
assert.ok(vectorPage.includes('mixedPatternPicker.next()'));

let seed = 0x243f6a88;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const picker = new BalancedRandom(['pattern1', 'pattern2', 'pattern3', 'pattern4']);
const mixed = Array.from({ length: 20_000 }, () => picker.next(random));
assert.deepEqual(['pattern1', 'pattern2', 'pattern3', 'pattern4'].map(pattern => mixed.filter(item => item === pattern).length), [5_000, 5_000, 5_000, 5_000]);
assert.ok(mixed.every((pattern, index) => index === 0 || pattern !== mixed[index - 1]), 'mixed vector patterns must not repeat adjacently');

for (const [input, expected] of [
  ['12', { numerator: 12, denominator: 1 }],
  ['-12', { numerator: -12, denominator: 1 }],
  ['10/11', { numerator: 10, denominator: 11 }],
  [' 6 / 8 ', { numerator: 3, denominator: 4 }],
  ['1/-2', { numerator: -1, denominator: 2 }],
  ['', null],
  ['1/0', null],
  ['1/2/3', null],
  ['1.5', null],
  ['2abc', null],
  ['1e2', null],
  ['9007199254740992', null],
]) assert.deepEqual(parseRationalAnswer(input), expected, `parseRationalAnswer(${JSON.stringify(input)})`);

assert.ok(rationalEquals(parseRationalAnswer('6/8'), { numerator: 3, denominator: 4 }));
assert.ok(!rationalEquals(parseRationalAnswer('3.8/4'), { numerator: 1, denominator: 1 }));
console.log('Sigma/vector rational answer checks: 12 strict parser cases, equivalent fractions, and both drill integrations passed.');
