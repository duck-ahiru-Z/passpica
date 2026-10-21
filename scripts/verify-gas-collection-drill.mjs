import assert from 'node:assert/strict';
import { generateGasCollectionProblem, gasCollectionPatterns } from '../src/lib/gasCollectionDrill.ts';

const counts = Object.fromEntries(gasCollectionPatterns.map(pattern => [pattern, 0]));
let previous = '';
const mixedCount = 6000;
for (let index = 0; index < mixedCount; index += 1) {
  const problem = generateGasCollectionProblem('mix');
  assert.ok(gasCollectionPatterns.includes(problem.pattern));
  assert.equal(problem.method, {
    waterDisplacement: '水上置換法',
    upwardDisplacement: '上方置換法',
    downwardDisplacement: '下方置換法',
  }[problem.pattern]);
  assert.notEqual(problem.pattern, previous, 'mixed practice should not repeat a pattern back-to-back');
  previous = problem.pattern;
  counts[problem.pattern] += 1;
}
for (const pattern of gasCollectionPatterns) {
  assert.ok(counts[pattern] >= Math.floor(mixedCount / gasCollectionPatterns.length) - 1);
  const fixed = generateGasCollectionProblem(pattern);
  assert.equal(fixed.pattern, pattern);
  assert.equal(fixed.method, {
    waterDisplacement: '水上置換法',
    upwardDisplacement: '上方置換法',
    downwardDisplacement: '下方置換法',
  }[pattern]);
}
assert.match(generateGasCollectionProblem('waterDisplacement').explanation, /空気との密度差は、この方法を選ぶ理由ではありません/);
assert.match(generateGasCollectionProblem('upwardDisplacement').explanation, /逆さの集気びん/);
assert.match(generateGasCollectionProblem('downwardDisplacement').explanation, /口を上にした集気びん/);
console.log(`Gas collection drill verified: ${mixedCount} balanced mixed questions; ${JSON.stringify(counts)}.`);
