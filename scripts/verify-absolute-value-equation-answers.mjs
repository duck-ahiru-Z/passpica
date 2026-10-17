import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseRationalRoot } from '../src/lib/absoluteValueEquationAnswer.ts';

const cases = [
  ['3', '', { num: 3, den: 1 }],
  ['-6', '8', { num: -3, den: 4 }],
  ['-6', '-8', { num: 3, den: 4 }],
  ['0', '7', { num: 0, den: 1 }],
  [' 12 ', ' -18 ', { num: -2, den: 3 }],
  ['', '', null], ['1.5', '', null], ['1abc', '', null],
  ['1', '0', null], ['2', '-0', null], ['1', '2.5', null],
  ['9007199254740992', '', null], ['1', '9007199254740992', null],
];

for (const [numerator, denominator, expected] of cases) {
  assert.deepEqual(parseRationalRoot(numerator, denominator), expected, `${numerator}/${denominator}`);
}

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/absolute-value-eq-drill/page.tsx'), 'utf8');
for (const label of ['1つ目の解の分子', '1つ目の解の分母', '2つ目の解の分子', '2つ目の解の分母']) {
  assert.ok(page.includes(`aria-label="${label}`), `missing accessible input label: ${label}`);
}
assert.ok(page.includes('role="status" aria-live="polite"'), 'answer feedback must be announced');
assert.ok(page.includes("aria-pressed={detailLevel === 'brief'}") && page.includes("aria-pressed={detailLevel === 'normal'}"), 'explanation-level buttons must expose their selected state');
assert.ok(!page.includes('$x$') && page.includes('<MathEq math="x" />'), 'math notation must render instead of showing literal Markdown delimiters');

console.log(`Absolute-value equation answer parsing verified: ${cases.length} rational-input cases and accessible answer feedback.`);
