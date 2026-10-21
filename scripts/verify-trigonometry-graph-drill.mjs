import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTrigGraphProblemPicker, isTrigGraphAnswerCorrect, isTrigGraphStrategyValid, trigGraphPatterns } from '../src/lib/trigonometryGraphDrill.ts';

const root = process.cwd();
const seeded = (seed) => () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 0x100000000;
};
const picker = createTrigGraphProblemPicker();

for (const pattern of trigGraphPatterns) {
  const fixedPicker = createTrigGraphProblemPicker();
  for (let i = 0; i < 600; i += 1) {
    const problem = fixedPicker.next(pattern, seeded(i + 23));
    assert.equal(problem.pattern, pattern);
    assert.ok(problem.answers.every(Number.isFinite));
    assert.ok(isTrigGraphStrategyValid(problem, pattern));
    assert.ok(!isTrigGraphStrategyValid(problem, ''));
    assert.ok(isTrigGraphAnswerCorrect(problem, problem.answers.map(String)));
    assert.ok(!isTrigGraphAnswerCorrect(problem, problem.answers.map(() => '')));
    const wrong = [...problem.answers];
    wrong[0] += 37;
    assert.ok(!isTrigGraphAnswerCorrect(problem, wrong.map(String)), `${pattern} accepts a wrong answer`);
  }
}

const counts = new Map(trigGraphPatterns.map(pattern => [pattern, 0]));
let previous = '';
for (let i = 0; i < 12000; i += 1) {
  const problem = picker.next('mix', seeded(i * 7919 + 101));
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  assert.notEqual(problem.pattern, previous, 'mixed mode should avoid adjacent repeated strategies');
  previous = problem.pattern;
}
for (const [pattern, count] of counts) {
  assert.ok(count >= 1998 && count <= 2002, `${pattern} frequency out of balance: ${count}`);
}

const visual = fs.readFileSync(path.join(root, 'src/app/learn/math/trigonometry-graph/page.tsx'), 'utf8');
const drill = fs.readFileSync(path.join(root, 'src/app/learn/math/trigonometry-graph-drill/page.tsx'), 'utf8');
const learningPortal = fs.readFileSync(path.join(root, 'src/app/learn/page.tsx'), 'utf8');
assert.ok(visual.includes('href="/learn/math/trigonometry-graph-drill"'));
assert.ok(drill.includes('href="/learn/math/trigonometry-graph"'));
assert.ok(learningPortal.includes("practiceLink: '/learn/math/trigonometry-graph-drill'"));
assert.ok(drill.includes('全パターンランダム') && drill.includes('基礎練習'));
console.log(`Trigonometry graph drill verified: ${trigGraphPatterns.length} fixed patterns, 12,000 balanced mixed questions (${[...counts].map(([pattern, count]) => `${pattern}=${count}`).join(', ')}), no adjacent pattern repeats.`);
