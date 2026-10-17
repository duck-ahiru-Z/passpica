import { calculus3Questions, createCalculus3MixedQuestionPicker } from '../src/lib/calculus3MixedQuestions.ts';

const areas = ['limit', 'differentiation', 'integral', 'geometry', 'differential-equation'];
if (calculus3Questions.length !== 10) throw new Error(`expected 10 Math III mixed questions, got ${calculus3Questions.length}`);
for (const area of areas) {
  const questions = calculus3Questions.filter(question => question.area === area);
  if (questions.length !== 2) throw new Error(`${area} has ${questions.length} questions instead of 2`);
}
for (const question of calculus3Questions) {
  if (question.options.length !== 4 || new Set(question.options).size !== 4) throw new Error(`options must be four unique choices: ${question.prompt}`);
  if (question.options.filter(option => option === question.answer).length !== 1) throw new Error(`answer must occur exactly once among options: ${question.prompt}`);
  if (!question.explanation.trim()) throw new Error(`missing explanation: ${question.prompt}`);
}
const separation = calculus3Questions.find(question => question.area === 'differential-equation' && question.prompt.includes('一般解'));
if (!separation?.explanation.includes('y=0 も解')) throw new Error('the zero solution must be covered when separating variables');

const picker = createCalculus3MixedQuestionPicker();
for (let batch = 0; batch < 60; batch += 1) {
  const questions = Array.from({ length: calculus3Questions.length }, () => picker.next('all'));
  if (new Set(questions.map(question => question.prompt)).size !== calculus3Questions.length) throw new Error(`full-range batch ${batch} repeated or omitted a question`);
  for (const area of areas) {
    if (questions.filter(question => question.area === area).length !== 2) throw new Error(`full-range batch ${batch} is imbalanced for ${area}`);
  }
}

const optionPicker = createCalculus3MixedQuestionPicker();
const correctPositions = [0, 0, 0, 0];
for (let index = 0; index < 24; index += 1) {
  const question = optionPicker.next('all');
  correctPositions[question.options.indexOf(question.answer)] += 1;
}
if (correctPositions.some(count => count !== 6)) throw new Error(`correct answer positions are biased: ${correctPositions.join(', ')}`);

for (const area of areas) {
  const areaPicker = createCalculus3MixedQuestionPicker();
  const prompts = new Set(Array.from({ length: 40 }, () => areaPicker.next(area).prompt));
  const expectedPrompts = calculus3Questions.filter(question => question.area === area).map(question => question.prompt);
  if (expectedPrompts.some(prompt => !prompts.has(prompt)) || prompts.size !== expectedPrompts.length) throw new Error(`${area} filter did not retain both of its questions`);
}

console.log('Calculus III mixed practice verified: 10 questions across 5 areas, balanced full-range batches, fixed-area coverage, unique answers, and 24-cycle balanced answer positions checked.');
