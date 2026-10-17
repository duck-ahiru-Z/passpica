import assert from 'node:assert/strict';
import { generateMathAQuestion, mathAAreas } from '../src/lib/mathAMixedQuestions.ts';

for (const area of mathAAreas) {
  const seen = new Set();
  for (let i = 0; i < 500; i += 1) {
    const question = generateMathAQuestion(area);
    assert.equal(question.area, area);
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.options.includes(question.answer));
    assert.ok(question.explanation.length > 0);
    seen.add(question.prompt);
  }
  assert.equal(seen.size, 5, `${area} should rotate through all five patterns`);
}

const seenAreas = new Set();
const seenQuestions = new Set();
let previous;
for (let i = 0; i < 1000; i += 1) {
  const question = generateMathAQuestion('all');
  assert.notEqual(question.area, previous, 'mixed mode should avoid consecutive area repeats');
  previous = question.area;
  seenAreas.add(question.area);
  seenQuestions.add(question.prompt);
}
assert.equal(seenAreas.size, mathAAreas.length);
assert.equal(seenQuestions.size, mathAAreas.length * 5);
console.log('Math A: all 20 patterns verified across focused and mixed practice.');
