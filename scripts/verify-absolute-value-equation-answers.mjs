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
assert.equal((page.match(/setHasChecked\(false\); setIsCorrect\(false\);/g) ?? []).length, 4, 'editing any answer field must clear stale feedback');
assert.ok(!page.includes('$x$') && page.includes('<MathEq math="x" />'), 'math notation must render instead of showing literal Markdown delimiters');

// Recreate each generator family over a dense deterministic parameter grid and
// validate every proposed root against the equation it is meant to solve.
const gcd = (left, right) => right === 0 ? Math.abs(left) : gcd(right, left % right);
const fraction = (num, den) => {
  const divisor = gcd(num, den);
  num /= divisor;
  den /= divisor;
  if (den < 0) return { num: -num, den: -den };
  return { num, den };
};
const close = (left, right) => Math.abs(left - right) < 1e-9;
const satisfiesPattern = (pattern, params, root) => {
  const x = root.num / root.den;
  const { a, b, c = 0, d = 0 } = params;
  if (pattern === 'pattern1') return close(Math.abs(x - a), b);
  if (pattern === 'pattern2') return close(Math.abs(a * x - b), c);
  if (pattern === 'pattern3') return close(Math.abs(a * x - b), c * x + d);
  return close(Math.abs(x - a) + Math.abs(x - b), c);
};
const checked = new Set();
const checkRoot = (pattern, params, root, valid = true) => {
  const x = root.num / root.den;
  const satisfies = satisfiesPattern(pattern, params, root);
  assert.equal(satisfies, valid, `${pattern} ${JSON.stringify(params)} x=${x}`);
  checked.add(pattern);
};

for (let a = -9; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    checkRoot('pattern1', { a, b }, fraction(a + b, 1));
    checkRoot('pattern1', { a, b }, fraction(a - b, 1));
  }
}
for (let a = 2; a <= 9; a++) {
  for (let b = -9; b <= 9; b++) {
    for (let c = 1; c <= 9; c++) {
      checkRoot('pattern2', { a, b, c }, fraction(b + c, a));
      checkRoot('pattern2', { a, b, c }, fraction(b - c, a));
    }
  }
}
for (let a = 2; a <= 9; a++) {
  for (let b = -9; b <= 9; b++) {
    for (let c = -9; c <= 9; c++) {
      for (let d = -9; d <= 9; d++) {
        if (a === c || a === -c) continue;
        const x1 = fraction(b + d, a - c);
        const x2 = fraction(b - d, a + c);
        const valid1 = a * x1.num / x1.den - b >= 0;
        const valid2 = a * x2.num / x2.den - b < 0;
        if (valid1 === valid2) continue;
        const validRoot = valid1 ? x1 : x2;
        const invalidRoot = valid1 ? x2 : x1;
        checkRoot('pattern3', { a, b, c, d }, validRoot);
        if (validRoot.num === invalidRoot.num && validRoot.den === invalidRoot.den) continue;
        const invalidBranchValid = a * invalidRoot.num / invalidRoot.den - b >= 0;
        const invalidEquationValue = c * (invalidRoot.num / invalidRoot.den) + d;
        if (close(Math.abs(a * invalidRoot.num / invalidRoot.den - b), invalidEquationValue)) {
          assert.equal(invalidBranchValid, !valid1, 'an equation-satisfying extraneous root must violate its branch condition');
        }
        checked.add('pattern3');
      }
    }
  }
}
for (let a = -9; a <= 9; a++) {
  for (let b = a + 1; b <= 9; b++) {
    for (let c = 1; c <= 15; c++) {
      if (c <= b - a) continue;
      checkRoot('pattern4', { a, b, c }, fraction(a + b + c, 2));
      checkRoot('pattern4', { a, b, c }, fraction(a + b - c, 2));
    }
  }
}
assert.deepEqual([...checked].sort(), ['pattern1', 'pattern2', 'pattern3', 'pattern4']);

console.log(`Absolute-value equation checks passed: ${cases.length} parser cases plus exhaustive valid/invalid root substitution across ${[...checked].length} patterns.`);
