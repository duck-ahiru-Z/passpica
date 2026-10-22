import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateSineRuleProblem, getSinVal } from '../src/lib/sineRule.ts';

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
let seed = 0x243f6a88;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const termValue = term => term.num * Math.sqrt(term.root) / term.den;
const closeTo = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} != ${expected}`);
const ratioPart = term => {
  const coefficient = term.num * 2 / term.den;
  return term.root === 1 ? String(coefficient) : `${coefficient === 1 ? '' : coefficient}\\sqrt{${term.root}}`;
};

for (const pattern of patterns) {
  const variants = new Set();
  for (let index = 0; index < 2_000; index += 1) {
    const problem = generateSineRuleProblem(pattern, random);
    assert.equal(problem.pattern, pattern);
    assert.equal(problem.A + problem.B + problem.C, 180, 'triangle angles must sum to 180 degrees');
    for (const angle of [problem.A, problem.B, problem.C]) {
      assert.ok(getSinVal(angle).num > 0, `triangle angle ${angle} has no supported nonzero sine`);
    }

    if (pattern !== 'pattern4') {
      const expectedSide = angle => 2 * problem.R * Math.sin(angle * Math.PI / 180);
      closeTo(termValue(problem.a), expectedSide(problem.A), 'side a must match 2R sin(A)');
      closeTo(termValue(problem.b), expectedSide(problem.B), 'side b must match 2R sin(B)');
      closeTo(termValue(problem.c), expectedSide(problem.C), 'side c must match 2R sin(C)');
      assert.ok(problem.ansTerm);
      if (pattern === 'pattern1') closeTo(termValue(problem.ansTerm), problem.R, 'pattern 1 answer must be the circumradius');
      if (pattern === 'pattern2') closeTo(termValue(problem.ansTerm), termValue(problem.b), 'pattern 2 answer must be side b');
      if (pattern === 'pattern3') {
        assert.ok(problem.B < 90, 'unknown angle B must be acute to match the single-valued sine explanation');
        assert.equal(problem.ansAngle, problem.B);
        closeTo(Math.sin(problem.B * Math.PI / 180), termValue(problem.b) * Math.sin(problem.A * Math.PI / 180) / termValue(problem.a), 'pattern 3 sine rule must recover angle B');
      }
      variants.add(`${problem.A},${problem.B},${problem.C}:${problem.R}`);
    } else {
      assert.ok(problem.ratioStr);
      assert.equal(problem.ansAngle, Math.max(problem.A, problem.B, problem.C));
      assert.equal([problem.A, problem.B, problem.C].map(angle => ratioPart(getSinVal(angle))).join(' : '), problem.ratioStr,
        'displayed side ratio must correspond to the ordered triangle angles');
      variants.add(`${problem.A},${problem.B},${problem.C}:${problem.ratioStr}`);
    }
  }
  assert.ok(variants.size >= (pattern === 'pattern4' ? 10 : 30), `${pattern} produced too few angle/radius combinations (${variants.size})`);
}

assert.throws(() => getSinVal(15), /Unsupported special angle/, 'unsupported angles must not silently become a zero-length side');

const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let longestRun = 0;
let run = 0;
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateSineRuleProblem('mix', random);
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  run = problem.pattern === previous ? run + 1 : 1;
  longestRun = Math.max(longestRun, run);
  previous = problem.pattern;
}
for (const [pattern, count] of counts) assert.equal(count, 5_000, `${pattern} appeared ${count}/20,000 times`);
assert.equal(longestRun, 1);

const page = fs.readFileSync('src/app/learn/math/sine-rule-drill/page.tsx', 'utf8');
for (const pattern of patterns) assert.ok(page.includes(`value="${pattern}"`), `${pattern} must remain independently selectable`);
assert.ok(page.includes('generateSineRuleProblem'), 'the UI must use the tested production generator');
assert.ok(page.includes('は鋭角なので'), 'pattern 3 explanation must identify the acute-angle condition it relies on');
assert.ok(page.includes('aria-label={`外接円上の三角形ABC'), 'the triangle canvas must have an angle-aware accessible description');
assert.ok(page.includes("aria-label={problem.pattern === 'pattern3' ? '求める角Bの大きさ（度）' : '最大角の大きさ（度）'}"), 'the angle input must have a pattern-specific accessible name');

console.log('Sine-rule drill verified: 4 patterns × 2,000 formula-checked questions; every side matches 2R sin(angle), pattern 3 has acute B, ratio diagram labels match; mixed 20,000 balanced with no repeats.');
