import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generatePointLineDistanceProblem } from '../src/lib/pointLineDistance.ts';

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
let seed = 0x51f15e;
const random = () => {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
};
const valueOf = answer => {
  const [numerator, denominator] = String(answer).split('/').map(Number);
  return denominator === undefined ? numerator : numerator / denominator;
};
const distanceFrom = (a, b, c, x, y) => Math.abs(a * x + b * y + c) / Math.hypot(a, b);

for (const pattern of patterns) {
  for (let index = 0; index < 1_000; index += 1) {
    const problem = generatePointLineDistanceProblem(pattern, random);
    assert.equal(problem.pattern, pattern, `${pattern} selector returned the wrong pattern`);
    assert.ok(problem.a !== 0 && problem.b !== 0, `${pattern} generated a degenerate line`);
    assert.ok(problem.questionText.includes(`${problem.px}, ${problem.py}`) || (pattern === 'pattern1' && problem.questionText.includes('(0,0)')));

    if (pattern === 'pattern1') {
      assert.notEqual(problem.c, 0);
      assert.ok(Math.abs(valueOf(problem.ans1) - distanceFrom(problem.a, problem.b, problem.c, 0, 0)) < 1e-12);
      assert.equal(problem.ans2, undefined);
    } else if (pattern === 'pattern2' || pattern === 'pattern3') {
      assert.notEqual(problem.a * problem.px + problem.b * problem.py + problem.c, 0, `${pattern} put the point on the line`);
      assert.ok(Math.abs(valueOf(problem.ans1) - distanceFrom(problem.a, problem.b, problem.c, problem.px, problem.py)) < 1e-12);
      assert.equal(problem.ans2, undefined);
      if (pattern === 'pattern3') assert.ok(problem.questionText.includes('y = '));
    } else {
      assert.ok(problem.ans2 !== undefined, 'inverse-distance pattern must return two answers');
      const targetDistance = Number(problem.questionText.match(/距離が \$(\d+)\$/)?.[1]);
      assert.ok(targetDistance >= 1 && targetDistance <= 4, 'inverse-distance prompt must expose a valid target distance');
      for (const answer of [problem.ans1, problem.ans2]) {
        assert.ok(Math.abs(distanceFrom(problem.a, problem.b, Number(answer), problem.px, problem.py) - targetDistance) < 1e-12);
      }
      assert.notEqual(problem.ans1, problem.ans2);
    }
  }
}

const mixedCounts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let longestRun = 0;
let run = 0;
for (let index = 0; index < 20_000; index += 1) {
  const problem = generatePointLineDistanceProblem('mix', random);
  assert.ok(mixedCounts.has(problem.pattern), `mixed mode returned unknown pattern ${problem.pattern}`);
  mixedCounts.set(problem.pattern, mixedCounts.get(problem.pattern) + 1);
  run = problem.pattern === previous ? run + 1 : 1;
  longestRun = Math.max(longestRun, run);
  previous = problem.pattern;
}

for (const [pattern, count] of mixedCounts) assert.equal(count, 5_000, `${pattern} was not equally represented in 20,000 mixed questions`);
assert.equal(longestRun, 1, 'mixed mode should never present the same pattern consecutively');

const page = fs.readFileSync('src/app/learn/math/point-line-distance-drill/page.tsx', 'utf8');
for (const pattern of patterns) assert.ok(page.includes(`value="${pattern}"`), `${pattern} must remain independently selectable`);
assert.ok(page.includes('generatePointLineDistanceProblem(selectedPattern)'), 'the drill UI must use the tested problem generator');

console.log(`Point-line distance generation verified: 4 patterns × 1,000 mathematically checked problems; mixed 20,000 with ${[...mixedCounts].map(([pattern, count]) => `${pattern}=${count}`).join(', ')}; longest run ${longestRun}.`);
