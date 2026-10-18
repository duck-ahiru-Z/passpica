import { createCalculus3MixedQuestionPicker } from '../src/lib/calculus3MixedQuestions.ts';
import katex from 'katex';
import fs from 'node:fs';
import path from 'node:path';

const areas = ['limit', 'differentiation', 'curve-analysis', 'integral', 'geometry', 'differential-equation'];
const patternCounts = { limit: 7, differentiation: 7, 'curve-analysis': 6, integral: 5, geometry: 5, 'differential-equation': 4 };
const areaLabels = { limit: '極限', differentiation: '微分法', 'curve-analysis': '曲線分析', integral: '積分法', geometry: '面積・体積', 'differential-equation': '微分方程式' };
const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-mixed-drill/page.tsx'), 'utf8');
for (const requirement of ['実戦練習：数学III 全体ランダム', 'type="radio" name="calculus3-mixed-answer"', 'disabled={!answer}', 'role="status"', 'MathEq math={question.expression}']) {
  if (!drillPage.includes(requirement)) throw new Error(`Math III mixed drill is missing expected UI behavior: ${requirement}`);
}
if (drillPage.includes('aria-pressed=') || drillPage.includes('question.options.map(option => <button')) {
  throw new Error('single-choice method selection must be exposed as a radio group');
}

const validateQuestion = question => {
  if (!areas.includes(question.area) || question.areaLabel !== areaLabels[question.area]) throw new Error(`invalid area metadata: ${JSON.stringify(question)}`);
  if (!question.pattern.startsWith(`${question.area}:`)) throw new Error(`pattern is not linked to its area: ${question.pattern}`);
  if (!question.prompt.trim() || !question.explanation.trim() || !question.expression.trim()) throw new Error(`question content must not be empty: ${question.pattern}`);
  if (question.options.length !== patternCounts[question.area] || new Set(question.options).size !== question.options.length) throw new Error(`unexpected unique options for ${question.pattern}`);
  if (question.options.filter(option => option === question.answer).length !== 1) throw new Error(`answer must occur exactly once for ${question.pattern}`);
  if (question.pattern === 'geometry:x-axis-rotation' && !question.prompt.includes('xで積分')) throw new Error('x-axis disk-method prompts must specify integration with respect to x');
  if (question.pattern === 'geometry:y-axis-rotation' && !question.prompt.includes('yで積分')) throw new Error('y-axis washer-method prompts must specify integration with respect to y');
  if (question.pattern === 'geometry:shell-method' && !question.prompt.includes('xで積分')) throw new Error('shell-method prompts must specify integration with respect to x');
  if (question.expressionFormat === 'math') katex.renderToString(question.expression, { displayMode: true, throwOnError: true, strict: 'error' });
};

const allPicker = createCalculus3MixedQuestionPicker();
const allQuestions = Array.from({ length: 1_002 }, () => allPicker.next('all'));
for (const question of allQuestions) validateQuestion(question);
const allPatterns = new Map(areas.map(area => [area, new Set()]));
for (const question of allQuestions) allPatterns.get(question.area).add(question.pattern);
for (let index = 0; index < allQuestions.length; index += areas.length) {
  const batch = allQuestions.slice(index, index + areas.length);
  if (new Set(batch.map(question => question.area)).size !== areas.length) throw new Error(`all-range batch ${index / areas.length} did not evenly mix all six areas`);
}
for (const area of areas) {
  if (allPatterns.get(area).size !== patternCounts[area]) throw new Error(`${area} exposes ${allPatterns.get(area).size}/${patternCounts[area]} lower-level patterns in the full-range picker`);
}

for (const area of areas) {
  const picker = createCalculus3MixedQuestionPicker();
  const questions = Array.from({ length: 500 }, () => picker.next(area));
  for (const question of questions) {
    validateQuestion(question);
    if (question.area !== area) throw new Error(`${area} filter returned ${question.area}`);
  }
  const patterns = new Set(questions.map(question => question.pattern));
  if (patterns.size !== patternCounts[area]) throw new Error(`${area} filter exposed ${patterns.size}/${patternCounts[area]} patterns`);
  if (new Set(questions.map(question => question.expression)).size <= patterns.size) throw new Error(`${area} filter did not vary question parameters beyond the fixed patterns`);

  const optionCount = questions[0].options.length;
  const positions = Array(optionCount).fill(0);
  for (const question of questions.slice(0, optionCount)) positions[question.options.indexOf(question.answer)] += 1;
  if (positions.some(count => count !== 1)) throw new Error(`${area} answer positions are unbalanced in the first cycle: ${positions.join(', ')}`);
}

for (let seed = 1; seed <= 20; seed += 1) {
  let state = seed;
  const random = () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const picker = createCalculus3MixedQuestionPicker();
  const questions = Array.from({ length: 504 }, () => picker.next('all', random));
  for (const question of questions) validateQuestion(question);
  for (let index = 0; index < questions.length; index += areas.length) {
    if (new Set(questions.slice(index, index + areas.length).map(question => question.area)).size !== areas.length) {
      throw new Error(`seed ${seed} failed to include every area in a six-question batch`);
    }
  }
}

console.log('Calculus III mixed practice verified: all 34 lower-level strategy patterns, varied generated questions, six-area balance across 10,000 seeded questions, KaTeX rendering, single-choice UI, and balanced answer positions.');
