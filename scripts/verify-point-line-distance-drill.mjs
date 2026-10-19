import { BalancedRandom } from '../src/lib/balancedRandom.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
const page = fs.readFileSync('src/app/learn/math/point-line-distance-drill/page.tsx', 'utf8');
assert.match(page, /mixedPatternPicker\.next\(random\)/);
assert.match(page, /const draw = \(\) => random\(\)/);
for (const pattern of patterns) assert.ok(page.includes(`value="${pattern}"`), `${pattern} must remain independently selectable`);
const pick = new BalancedRandom(patterns);
const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let longestRun = 0;
let run = 0;

for (let index = 0; index < 20_000; index += 1) {
  const pattern = pick.next();
  counts.set(pattern, counts.get(pattern) + 1);
  run = pattern === previous ? run + 1 : 1;
  longestRun = Math.max(longestRun, run);
  previous = pattern;
}

for (const [pattern, count] of counts) {
  if (count !== 5000) throw new Error(`${pattern} appeared ${count}/20000 times; expected balanced batches of 5000`);
}
if (longestRun > 1) throw new Error(`mixed mode repeated one pattern ${longestRun} times consecutively`);

console.log(`Point-line distance mixed scheduler verified: ${[...counts].map(([pattern, count]) => `${pattern}=${count}`).join(', ')}; longest run ${longestRun}.`);
