import { createCalculus3MixedQuestionPicker } from '../src/lib/calculus3MixedQuestions.ts';
import { integralPatterns } from '../src/lib/calculus3Integrals.ts';
import { geometryPatterns } from '../src/lib/calculus3Geometry.ts';
import { curvePatterns } from '../src/lib/calculus3CurveAnalysis.ts';
import { differentiationPatterns } from '../src/lib/calculus3Differentiation.ts';
import { limitPatterns } from '../src/lib/calculus3Limits.ts';
import { differentialEquationPatterns } from '../src/lib/calculus3DifferentialEquations.ts';
import katex from 'katex';
import fs from 'node:fs';
import path from 'node:path';

const areas = ['limit', 'differentiation', 'curve-analysis', 'integral', 'geometry', 'differential-equation'];
const patternCounts = { limit: limitPatterns.length, differentiation: differentiationPatterns.length, 'curve-analysis': curvePatterns.length, integral: integralPatterns.length, geometry: geometryPatterns.length, 'differential-equation': differentialEquationPatterns.length };
const areaLabels = { limit: '極限', differentiation: '微分法', 'curve-analysis': '曲線分析', integral: '積分法', geometry: '面積・体積', 'differential-equation': '微分方程式' };
const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-mixed-drill/page.tsx'), 'utf8');
for (const requirement of ['実戦練習：数学III 全体ランダム', 'type="radio" name="calculus3-mixed-answer"', 'disabled={!answer}', 'role="status"', 'MathEq math={question.expression}', 'acceptedAnswers.includes(answer)', 'question.alternativeExplanations?.[answer]']) {
  if (!drillPage.includes(requirement)) throw new Error(`Math III mixed drill is missing expected UI behavior: ${requirement}`);
}
if (!drillPage.includes("mode === 'all' ? '解法選択' : '方針を選択'")) {
  throw new Error('the mixed practice mode must clearly label its strategy-selection task');
}
if (drillPage.includes('aria-pressed=') || drillPage.includes('question.options.map(option => <button')) {
  throw new Error('single-choice method selection must be exposed as a radio group');
}
if (drillPage.includes('数式: ${math.replace') || /markup\.replace\('<span class="katex">'.*aria-hidden/.test(drillPage)) {
  throw new Error('mixed-drill math must preserve KaTeX MathML instead of exposing a lossy flattened TeX label');
}

const validateQuestion = (question, allMode = false) => {
  if (!areas.includes(question.area) || question.areaLabel !== areaLabels[question.area]) throw new Error(`invalid area metadata: ${JSON.stringify(question)}`);
  if (!question.pattern.startsWith(`${question.area}:`)) throw new Error(`pattern is not linked to its area: ${question.pattern}`);
  if (!question.prompt.trim() || !question.explanation.trim() || !question.expression.trim()) throw new Error(`question content must not be empty: ${question.pattern}`);
  const expectedOptionCount = allMode ? areas.length + (question.acceptedAnswers?.length ?? 1) : patternCounts[question.area];
  if (question.options.length !== expectedOptionCount || new Set(question.options).size !== question.options.length) throw new Error(`unexpected unique options for ${question.pattern}`);
  if (question.options.filter(option => option === question.answer).length !== 1) throw new Error(`answer must occur exactly once for ${question.pattern}`);
  for (const answer of question.acceptedAnswers ?? [question.answer]) {
    if (!question.options.includes(answer)) throw new Error(`accepted method is missing from the options for ${question.pattern}: ${answer}`);
  }
  if (allMode) {
    const countsByArea = new Map(areas.map(area => [area, question.options.filter(option => option.startsWith(`${areaLabels[area]}：`)).length]));
    for (const area of areas) {
      const expectedCount = area === question.area ? (question.acceptedAnswers?.length ?? 1) + 1 : 1;
      if (countsByArea.get(area) !== expectedCount) throw new Error(`all-mode choices must cover every Math III area with plausible same-area alternatives: ${question.pattern}`);
    }
    if (!question.answer.startsWith(`${question.areaLabel}：`)
      || (question.acceptedAnswers ?? []).some(answer => !answer.startsWith(`${question.areaLabel}：`))) {
      throw new Error(`all-mode answers must identify both the area and the strategy: ${question.pattern}`);
    }
  }
  if (question.pattern === 'geometry:x-axis-rotation' && !question.prompt.includes('xで積分')) throw new Error('x-axis disk-method prompts must specify integration with respect to x');
  if (question.pattern === 'geometry:y-axis-rotation' && !question.prompt.includes('yで積分')) throw new Error('y-axis washer-method prompts must specify integration with respect to y');
  if (question.pattern === 'geometry:shell-method' && !question.prompt.includes('xで積分')) throw new Error('shell-method prompts must specify integration with respect to x');
  if (question.expressionFormat === 'math') katex.renderToString(question.expression, { displayMode: true, throwOnError: true, strict: 'error' });
};

const allPicker = createCalculus3MixedQuestionPicker();
const allQuestions = Array.from({ length: 1_002 }, () => allPicker.next('all'));
for (const question of allQuestions) validateQuestion(question, true);
const allPatterns = new Map(areas.map(area => [area, new Set()]));
for (const question of allQuestions) allPatterns.get(question.area).add(question.pattern);
for (let index = 0; index < allQuestions.length; index += areas.length) {
  const batch = allQuestions.slice(index, index + areas.length);
  if (new Set(batch.map(question => question.area)).size !== areas.length) throw new Error(`all-range batch ${index / areas.length} did not evenly mix all six areas`);
}
for (let index = 0; index < allQuestions.length; index += areas.length + 1) {
  const batch = allQuestions.slice(index, index + areas.length + 1);
  const correctPositions = batch.map(question => question.options.indexOf(question.answer));
  if (batch.length === areas.length + 1 && new Set(correctPositions).size !== correctPositions.length) {
    throw new Error(`all-mode answer positions were not balanced in batch ${index / (areas.length + 1)}`);
  }
}
for (const area of areas) {
  if (allPatterns.get(area).size !== patternCounts[area]) throw new Error(`${area} exposes ${allPatterns.get(area).size}/${patternCounts[area]} lower-level patterns in the full-range picker`);
}

const geometryPicker = createCalculus3MixedQuestionPicker();
const geometryQuestions = Array.from({ length: 500 }, () => geometryPicker.next('geometry'));
const washerQuestion = geometryQuestions.find(question => question.pattern === 'geometry:y-axis-rotation');
const shellQuestion = geometryQuestions.find(question => question.pattern === 'geometry:shell-method');
const diskVolumeQuestion = geometryQuestions.find(question => question.pattern === 'geometry:disk-volume');
if (!washerQuestion || !shellQuestion || !diskVolumeQuestion) throw new Error('geometry mode must generate y-axis rotation and y=x² disk-volume patterns');
for (const question of [washerQuestion, shellQuestion]) {
  const expectedMethods = question.pattern === 'geometry:y-axis-rotation'
    ? ['y軸回転体の体積（円環法）', 'y軸回転体の体積（円筒殻法）']
    : ['y軸回転体の体積（円筒殻法）', 'y軸回転体の体積（円環法）'];
  if (JSON.stringify(question.acceptedAnswers) !== JSON.stringify(expectedMethods)) {
    throw new Error(`${question.pattern} must accept both equivalent methods: ${JSON.stringify(question.acceptedAnswers)}`);
  }
  if (expectedMethods.slice(1).some(method => !question.alternativeExplanations?.[method]?.trim())) {
    throw new Error(`${question.pattern} must explain each valid alternate method`);
  }
}
if (!diskVolumeQuestion.acceptedAnswers?.includes('x軸回転体の体積（円板法）')
  || !diskVolumeQuestion.options.includes('x軸回転体の体積（円板法）')
  || !diskVolumeQuestion.alternativeExplanations?.['x軸回転体の体積（円板法）']?.includes('円板法')) {
  throw new Error('Math III mixed practice must accept and explain the general disk method for the y=x² rotation-volume problem');
}

const integralPicker = createCalculus3MixedQuestionPicker();
const trigIntegral = Array.from({ length: 500 }, () => integralPicker.next('integral')).find(question => question.pattern === 'integral:trig');
if (!trigIntegral
  || JSON.stringify(trigIntegral.acceptedAnswers) !== JSON.stringify(['三角関数の積分', '置換積分'])
  || trigIntegral.acceptedAnswers.some(method => !trigIntegral.options.includes(method))
  || !trigIntegral.alternativeExplanations?.['置換積分']?.includes('u=cos x')) {
  throw new Error('Math III full-range mixed practice must accept and explain substitution as a valid method for odd-powered sine integrals');
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
  for (const question of questions) validateQuestion(question, true);
  for (let index = 0; index < questions.length; index += areas.length) {
    if (new Set(questions.slice(index, index + areas.length).map(question => question.area)).size !== areas.length) {
      throw new Error(`seed ${seed} failed to include every area in a six-question batch`);
    }
  }
}

const totalPatterns = Object.values(patternCounts).reduce((sum, count) => sum + count, 0);
console.log(`Calculus III mixed practice verified: all ${totalPatterns} lower-level strategy patterns, varied generated questions, six-area balance across 10,000 seeded questions, KaTeX rendering, single-choice UI, and balanced answer positions.`);
