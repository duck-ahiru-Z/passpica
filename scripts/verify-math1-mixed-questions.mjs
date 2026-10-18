import { generateMath1Question, math1Areas } from '../src/lib/math1MixedQuestions.ts';
import fs from 'node:fs';
import path from 'node:path';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/math1-mixed-drill/page.tsx'), 'utf8');
if (!page.includes('aria-pressed={answer === option}')) throw new Error('Math I answer options must expose the selected state');
if (!page.includes('disabled={!answer}')) throw new Error('Math I answers must not be submitted before choosing an option');
if (!page.includes('role="status" aria-live="polite"')) throw new Error('Math I answer feedback must be announced to assistive technology');

const stableRandom = () => 0.37;

for (const area of math1Areas) {
  const prompts = new Set();
  for (let index = 0; index < 500; index += 1) {
    const question = generateMath1Question(area, stableRandom);
    if (question.area !== area || question.options.length !== 4 || new Set(question.options).size !== 4 || !question.options.includes(question.answer) || !question.explanation.trim()) {
      throw new Error(`invalid question or answer key in ${area}: ${JSON.stringify(question)}`);
    }
    prompts.add(question.prompt);
  }
  if (prompts.size !== 5) throw new Error(`${area} generated ${prompts.size}/5 expected patterns`);
}

const mixed = Array.from({ length: 800 }, () => generateMath1Question('all', stableRandom).area);
for (let start = 0; start < mixed.length; start += math1Areas.length) {
  if (new Set(mixed.slice(start, start + math1Areas.length)).size !== math1Areas.length) throw new Error(`mixed set omitted a Math I area in batch ${start / math1Areas.length}`);
}
if (mixed.some((area, index) => index > 0 && area === mixed[index - 1])) throw new Error('Math I mixed practice repeated adjacent areas');
console.log('Math I mixed drill verified: 2,000 fixed-area questions and 800 mixed questions; five prompt variants per area, answer keys, balanced coverage, and adjacency checked.');
