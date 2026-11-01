import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateCosineRuleAmbiguousTriangle, getCosineRuleAmbiguousTriangleCount } from '../src/lib/cosineRuleAmbiguous.ts';
import { BalancedRandom } from '../src/lib/balancedRandom.ts';

// Reproduce each supported angle/side coefficient case from the production generator.
// For pattern 4, verify the quadratic coefficient is 2b cos(A), including radicals.
const cases = [
  { A: 30, b: { num: 2, root: 1 }, expected: 2 * Math.sqrt(3) },
  { A: 150, b: { num: 2, root: 1 }, expected: -2 * Math.sqrt(3) },
  { A: 45, b: { num: 2, root: 1 }, expected: 2 * Math.SQRT2 },
  { A: 135, b: { num: 2, root: 1 }, expected: -2 * Math.SQRT2 },
  { A: 45, b: { num: 2, root: 2 }, expected: 4 },
  { A: 135, b: { num: 2, root: 2 }, expected: -4 },
  { A: 60, b: { num: 3, root: 1 }, expected: 3 },
  { A: 120, b: { num: 3, root: 1 }, expected: -3 },
  { A: 90, b: { num: 3, root: 1 }, expected: 0 },
  { A: 30, b: { num: 2, root: 3 }, expected: 6 },
  { A: 150, b: { num: 2, root: 3 }, expected: -6 },
];

const production = fs.readFileSync('src/app/learn/math/cosine-rule-drill/page.tsx', 'utf8');
for (const { A, b, expected } of cases) {
  const actual = A === 60 || A === 120 || A === 90
    ? 2 * b.num * (A === 60 ? 0.5 : A === 120 ? -0.5 : 0)
    : A === 45 || A === 135
      ? b.num * Math.sqrt(b.root * 2) * (A === 45 ? 1 : -1)
      : b.num * Math.sqrt(b.root) * Math.sqrt(3) * (A === 30 ? 1 : -1);
  assert.ok(Math.abs(actual - expected) < 1e-10, `wrong 2b cos(A) at ${A}° and b=${b.num}√${b.root}`);
}

for (const pattern of ['pattern1', 'pattern2', 'pattern3', 'pattern4']) {
  assert.ok(production.includes(`value="${pattern}"`), `${pattern} must remain selectable`);
}
assert.ok(production.includes('c_other = two_b_cosA - c_orig'), 'pattern 4 must compute the second side from the quadratic root sum');
assert.ok(production.includes('? 60'), 'pattern 4 must use a rational cosine so both answers fit the current exact input format');
assert.ok(production.includes('a2 = triangle.opposite * triangle.opposite'), 'pattern 4 must derive an exact integer opposite side from its tested generator');
assert.ok(production.includes('generateCosineRuleAmbiguousTriangle'), 'pattern 4 must use its directly tested production generator');
assert.ok(production.includes('ansTerms!.length > 1'), 'pattern 4 must support both valid positive roots');
assert.ok(production.includes('余弦定理の適用'), 'checked answers must show a solution explanation');
assert.ok(production.includes("new BalancedRandom<Pattern>(['pattern1', 'pattern2', 'pattern3', 'pattern4'])"), 'mixed practice must schedule all four patterns evenly');
assert.ok(production.includes('mixedPatternPicker.next()'), 'mixed practice must use the balanced scheduler');
assert.ok(production.includes('label={problem.pattern === \'pattern4\' ? \'辺cの解（1つ目）\' : \'辺aの長さ\'}'), 'side answer input must identify the requested side');
assert.ok(production.includes('label="辺cの解（2つ目）"'), 'second ambiguous root input must be distinguishable');
assert.ok(production.includes('aria-label="角Aの大きさ（度）"'), 'angle answer input must have an accessible name');

const simplify = n => {
  let value = n;
  for (let factor = 2; factor * factor <= value; factor += 1) {
    while (value % (factor * factor) === 0) value /= factor * factor;
  }
  return value;
};
let seed = 0x243f6a88;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const picker = new BalancedRandom(['pattern1', 'pattern2', 'pattern3', 'pattern4']);
const mixed = Array.from({ length: 20_000 }, () => picker.next(random));
const patternCounts = new Map([...new Set(mixed)].map(pattern => [pattern, mixed.filter(item => item === pattern).length]));
assert.equal(patternCounts.size, 4, 'all patterns must appear in mixed practice');
assert.ok([...patternCounts.values()].every(count => count === 5_000), 'mixed practice must give each pattern equal frequency');
assert.ok(mixed.every((pattern, index) => index === 0 || pattern !== mixed[index - 1]), 'mixed practice must avoid adjacent repeats');
const seenPattern4 = new Set();
for (let index = 0; index < 10_000; index += 1) {
  const triangle = generateCosineRuleAmbiguousTriangle(random);
  assert.equal(triangle.angle, 60);
  assert.equal(triangle.opposite ** 2, triangle.adjacentB ** 2 + triangle.adjacentC ** 2 - triangle.adjacentB * triangle.adjacentC,
    'generated sides must satisfy the cosine rule exactly');
  assert.equal(triangle.alternateC, triangle.adjacentB - triangle.adjacentC);
  assert.ok(triangle.alternateC > 0);
  assert.notEqual(triangle.alternateC, triangle.adjacentC);
  for (const root of [triangle.adjacentC, triangle.alternateC]) {
    assert.equal(root ** 2 - triangle.adjacentB * root + triangle.adjacentB ** 2 - triangle.opposite ** 2, 0,
      'both displayed c answers must solve the quadratic');
  }
  seenPattern4.add(`${triangle.adjacentB},${triangle.adjacentC},${triangle.opposite}`);
}
assert.equal(seenPattern4.size, getCosineRuleAmbiguousTriangleCount(), 'every valid triangle must appear in the generated sample');
for (const pattern of ['pattern1', 'pattern2', 'pattern3', 'pattern4']) {
  const counts = new Map();
  for (let index = 0; index < 1_000; index += 1) {
    let A = pattern === 'pattern1' ? [60, 120][Math.floor(random() * 2)]
      : pattern === 'pattern2' ? [45, 135][Math.floor(random() * 2)]
        : pattern === 'pattern4' ? 60
          : [30, 45, 60, 90, 120, 135, 150][Math.floor(random() * 7)];
    let b = { num: 1, root: 1 };
    let c = { num: 1, root: 1 };
    let a2 = 0;
    let attempts = 0;
    if (pattern === 'pattern4') {
      const triangle = generateCosineRuleAmbiguousTriangle(random);
      A = triangle.angle;
      b = { num: triangle.adjacentB, root: 1 };
      c = { num: triangle.adjacentC, root: 1 };
      a2 = triangle.opposite ** 2;
    }
    while (pattern !== 'pattern4' && a2 <= 0) {
      assert.ok(attempts++ < 100, 'generator must not loop indefinitely');
      if ([60, 90, 120].includes(A)) {
        b = { num: 2 + Math.floor(random() * 8), root: 1 };
        c = { num: 2 + Math.floor(random() * 8), root: 1 };
        a2 = b.num ** 2 + c.num ** 2 - 2 * b.num * c.num * (A === 60 ? 0.5 : A === 120 ? -0.5 : 0);
      } else if ([45, 135].includes(A)) {
        b = { num: 1 + Math.floor(random() * 4), root: 2 };
        c = { num: 2 + Math.floor(random() * 8), root: 1 };
        if (pattern !== 'pattern4' && random() < 0.5) [b, c] = [c, b];
        const rootCoefficient = b.root === 2 ? b : c;
        const integerCoefficient = b.root === 1 ? b : c;
        a2 = b.num ** 2 * b.root + c.num ** 2 * c.root - 2 * rootCoefficient.num * integerCoefficient.num * (A === 45 ? 1 : -1);
      } else {
        b = { num: 1 + Math.floor(random() * 4), root: 3 };
        c = { num: 2 + Math.floor(random() * 8), root: 1 };
        if (pattern !== 'pattern4' && random() < 0.5) [b, c] = [c, b];
        const rootCoefficient = b.root === 3 ? b : c;
        const integerCoefficient = b.root === 1 ? b : c;
        a2 = b.num ** 2 * b.root + c.num ** 2 * c.root - 3 * rootCoefficient.num * integerCoefficient.num * (A === 30 ? 1 : -1);
      }
    }
    const a = { num: 1, root: simplify(a2) };
    let inside = a2;
    for (let factor = 2; factor * factor <= inside; factor += 1) {
      while (inside % (factor * factor) === 0) {
        a.num *= factor;
        inside /= factor * factor;
      }
    }
    a.root = inside;
    const value = term => term.num * Math.sqrt(term.root);
    const actualA2 = value(b) ** 2 + value(c) ** 2 - 2 * value(b) * value(c) * Math.cos(A * Math.PI / 180);
    assert.ok(Math.abs(actualA2 - value(a) ** 2) < 1e-8, `${pattern}: generated a must satisfy cosine rule`);
    if (pattern === 'pattern4') {
      const twoBCosA = A === 60 ? b.num : A === 120 ? -b.num : 0;
      const other = twoBCosA - c.num;
      const roots = [c.num, ...(other > 0 && other !== c.num ? [other] : [])];
      for (const answer of roots) {
        const residual = answer ** 2 - twoBCosA * answer + value(b) ** 2 - value(a) ** 2;
        assert.ok(Math.abs(residual) < 1e-8, `pattern4: displayed root ${answer} must satisfy quadratic (A=${A}, b=${b.num}, c=${c.num}, a=${value(a)})`);
      }
      assert.ok(Number.isInteger(twoBCosA), 'pattern4 coefficient must fit its integer-root answer model');
    }
    counts.set(A, (counts.get(A) ?? 0) + 1);
  }
  if (pattern !== 'pattern4') assert.ok(counts.size >= 2, `${pattern} must vary its special angles`);
  else assert.equal(counts.size, 1, 'pattern4 must stay within its exact 60-degree integer-root case');
}

console.log(`Cosine-rule drill verified: ${cases.length} exact 2b cos(A) angle/radical cases; all four selectable patterns and two-root explanation retained.`);
