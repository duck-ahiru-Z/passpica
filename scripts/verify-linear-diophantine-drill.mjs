import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateLinearDiophantineProblem, gcd } from '../src/lib/linearDiophantine.ts';

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
let seed = 0xbb67ae85;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};

for (const pattern of patterns) {
  let minC = Infinity;
  let maxC = -Infinity;
  const variants = new Set();
  for (let index = 0; index < 5_000; index += 1) {
    const problem = generateLinearDiophantineProblem(pattern, random);
    assert.equal(problem.pattern, pattern);
    assert.equal(gcd(problem.A, problem.B), 1, 'coefficients must be coprime so integer solutions exist for every displayed C');
    assert.equal(problem.A * problem.x0 + problem.B * problem.y0, problem.C, 'generated answer must satisfy the equation');
    if (pattern === 'pattern1') assert.ok(problem.A >= 2 && problem.A <= 9 && problem.B >= 2 && problem.B <= 9 && problem.C === 1);
    if (pattern === 'pattern2') assert.ok(problem.A >= 11 && problem.A <= 99 && problem.B >= 11 && problem.B <= 99 && problem.C === 1);
    if (pattern === 'pattern3') assert.ok(problem.A >= 5 && problem.A <= 24 && problem.B >= 5 && problem.B <= 24 && problem.C >= 2 && problem.C <= 6);
    if (pattern === 'pattern4') assert.ok(problem.A >= 5 && problem.A <= 24 && problem.B <= -5 && problem.B >= -24 && problem.C === 1);
    for (let k = -5; k <= 5; k += 1) {
      assert.equal(problem.A * (problem.x0 + k * problem.B) + problem.B * (problem.y0 - k * problem.A), problem.C,
        'every plotted lattice point must remain on the line');
    }
    minC = Math.min(minC, problem.C);
    maxC = Math.max(maxC, problem.C);
    variants.add(`${problem.A},${problem.B},${problem.C}`);
  }
  const minVariants = pattern === 'pattern1' ? 20 : pattern === 'pattern4' ? 150 : 500;
  assert.ok(variants.size > minVariants, `${pattern} should have broad coefficient variety (${variants.size})`);
  if (pattern === 'pattern3') assert.ok(minC >= 2 && maxC <= 6);
  console.log(`${pattern}: 5,000 actual generated equations; coprimality, sample solution, all 11 plotted lattice points, and bounds checked (${variants.size} coefficient triples).`);
}

const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let run = 0;
let maxRun = 0;
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateLinearDiophantineProblem('mix', random);
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  run = problem.pattern === previous ? run + 1 : 1;
  maxRun = Math.max(maxRun, run);
  previous = problem.pattern;
}
for (const [pattern, count] of counts) assert.equal(count, 5_000, `${pattern} should appear once per mixed batch`);
assert.equal(maxRun, 1, 'mixed practice should not repeat a pattern consecutively');

const page = fs.readFileSync('src/app/learn/math/linear-diophantine-drill/page.tsx', 'utf8');
assert.ok(page.includes('generateLinearDiophantineProblem'), 'UI must use the tested production generator');
assert.ok(page.includes('BigInt(problem.A) * BigInt(ux) + BigInt(problem.B) * BigInt(uy)'), 'any integer solution must be accepted by exact arithmetic');
assert.ok(page.includes('aria-label="整数解の x の値"') && page.includes('aria-label="整数解の y の値"'), 'answer fields need distinct accessible names');
assert.ok(page.includes('role="img"') && page.includes('aria-label={`格子点を示す直線'), 'canvas must have an equation-aware image description');
for (const pattern of patterns) assert.ok(page.includes(`value="${pattern}"`), `${pattern} must be individually selectable`);
console.log('Linear Diophantine mixed mode verified: 20,000 questions, exactly 5,000 per strategy, no adjacent repeats.');
