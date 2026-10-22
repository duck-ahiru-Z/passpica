import assert from 'node:assert/strict';
import { generateGasCollectionProblem, gasCollectionPatterns, getGasCollectionAcceptedAnswerLabel, isGasCollectionAnswerCorrect } from '../src/lib/gasCollectionDrill.ts';

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
  assert.ok(problem.acceptedMethods.includes(problem.method), 'canonical collection method must remain an accepted answer');
  assert.notEqual(problem.pattern, previous, 'mixed practice should not repeat a pattern back-to-back');
  previous = problem.pattern;
  counts[problem.pattern] += 1;
}
for (const pattern of gasCollectionPatterns) {
  assert.ok(counts[pattern] >= Math.floor(mixedCount / gasCollectionPatterns.length) - 1);
  const fixedStyles = new Set();
  let previousQuestion = '';
  const fixedCount = 60;
  for (let index = 0; index < fixedCount; index += 1) {
    const fixed = generateGasCollectionProblem(pattern);
    assert.equal(fixed.pattern, pattern);
    assert.equal(fixed.method, {
      waterDisplacement: '水上置換法',
      upwardDisplacement: '上方置換法',
      downwardDisplacement: '下方置換法',
    }[pattern]);
    assert.notEqual(fixed.question, previousQuestion, 'focused practice should vary its prompt form');
    fixedStyles.add(fixed.questionStyle);
    previousQuestion = fixed.question;
  }
  assert.equal(fixedStyles.size, 3, `${pattern} should cover all three prompt styles`);
}
assert.match(generateGasCollectionProblem('waterDisplacement').explanation, /空気との密度差は、この方法を選ぶ理由ではありません/);
assert.match(generateGasCollectionProblem('upwardDisplacement').explanation, /逆さの集気びん/);
assert.match(generateGasCollectionProblem('downwardDisplacement').explanation, /上向きの集気びんに気体を底から導入し、空気を上へ押し出す/);
const carbonDioxide = generateGasCollectionProblem('downwardDisplacement', () => 0.999);
assert.equal(carbonDioxide.formula, 'CO₂');
assert.match(carbonDioxide.explanation, /水に少し溶けるため、回収量を確保する場合は水上置換法を避け/);
assert.match(carbonDioxide.explanation, /少量の溶解を許容する条件では水上置換法も使えます/);
assert.doesNotMatch(carbonDioxide.explanation, /水に溶けやすい気体/);
assert.deepEqual(carbonDioxide.acceptedMethods, ['下方置換法', '水上置換法']);
assert.equal(getGasCollectionAcceptedAnswerLabel(carbonDioxide), '下方置換法 または 水上置換法');
assert.ok(isGasCollectionAnswerCorrect(carbonDioxide, 'downwardDisplacement'));
assert.ok(isGasCollectionAnswerCorrect(carbonDioxide, 'waterDisplacement'), 'water displacement should be accepted for slightly soluble carbon dioxide, as stated in the visual');
assert.ok(!isGasCollectionAnswerCorrect(carbonDioxide, 'upwardDisplacement'));
for (const random of [() => 0, () => 0.5]) {
  const gas = generateGasCollectionProblem('downwardDisplacement', random);
  assert.equal(gas.acceptedMethods.length, 1, `${gas.formula} must not inherit carbon dioxide's alternate collection method`);
}
for (const pattern of gasCollectionPatterns) {
  const problem = generateGasCollectionProblem(pattern, () => 0.999);
  assert.ok(problem.explanation.includes(problem.solubility), `${problem.formula} explanation should match its solubility description`);
  assert.ok(problem.explanation.includes(problem.density), `${problem.formula} explanation should match its density description`);
}
console.log(`Gas collection drill verified: ${mixedCount} balanced mixed questions; ${JSON.stringify(counts)}.`);
