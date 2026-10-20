import fs from 'node:fs';
import path from 'node:path';
import { generateMath2Question, math2Areas } from '../src/lib/math2MixedQuestions.ts';
import { generateMathBcQuestion, mathBcAreas } from '../src/lib/mathBcMixedQuestions.ts';

for (const pageName of ['math2-mixed-drill', 'mathbc-mixed-drill']) {
  const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math', pageName, 'page.tsx'), 'utf8');
  if (!page.includes('aria-pressed={answer === option}') || !page.includes('disabled={!answer}') || !page.includes('role="status" aria-live="polite"')) {
    throw new Error(`${pageName} must announce selected answers, block empty submissions, and announce feedback`);
  }
}

const stableRandom = () => 0.37;

function verifyBank(areas, generate, name) {
  for (const area of areas) {
    const prompts = new Set();
    for (let index = 0; index < 500; index += 1) {
      const question = generate(area, stableRandom);
      if (question.area !== area || question.options.length !== 4 || new Set(question.options).size !== 4 || !question.options.includes(question.answer) || !question.explanation.trim()) {
        throw new Error(`invalid question or answer key in ${name}/${area}: ${JSON.stringify(question)}`);
      }
      if (name === 'Math II' && question.prompt.startsWith('sin 2x を sin x、cos x で表す') && question.options.includes('加法定理だけ')) {
        throw new Error('a mathematically valid route to the answer must not be marked as a distractor');
      }
      prompts.add(question.prompt);
    }
    if (prompts.size !== 5) throw new Error(`${name}/${area} generated ${prompts.size}/5 expected variants`);
  }
  const mixed = Array.from({ length: areas.length * 200 }, () => generate('all', stableRandom).area);
  for (let start = 0; start < mixed.length; start += areas.length) {
    if (new Set(mixed.slice(start, start + areas.length)).size !== areas.length) throw new Error(`${name} mixed set omitted an area in batch ${start / areas.length}`);
  }
  if (mixed.some((area, index) => index > 0 && area === mixed[index - 1])) throw new Error(`${name} mixed practice repeated adjacent areas`);
  return areas.length * 500 + mixed.length;
}

const verified = verifyBank(math2Areas, generateMath2Question, 'Math II') + verifyBank(mathBcAreas, generateMathBcQuestion, 'Math B/C');
console.log(`Math II and B/C verified: ${verified.toLocaleString('en-US')} fixed-area and mixed questions; five prompts per area, answer-key coverage, balanced distribution, and adjacency checked.`);
