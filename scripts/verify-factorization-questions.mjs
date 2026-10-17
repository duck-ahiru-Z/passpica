import { factorizationPatterns, generateFactorizationQuestion } from '../src/lib/factorizationQuestions.ts';

const fixedRandom = () => 0.42;
for (const pattern of factorizationPatterns) {
  for (let index = 0; index < 500; index += 1) {
    const question = generateFactorizationQuestion(pattern, fixedRandom);
    if (question.pattern !== pattern || !question.expression || !question.explanation) throw new Error(`incomplete ${pattern} question`);
    if (!question.options.includes(question.answer) || question.options.length !== factorizationPatterns.length) throw new Error(`invalid choices for ${pattern}`);
  }
}

const mixed = Array.from({ length: 1000 }, () => generateFactorizationQuestion('mix', fixedRandom).pattern);
for (let start = 0; start < mixed.length; start += factorizationPatterns.length) {
  if (new Set(mixed.slice(start, start + factorizationPatterns.length)).size !== factorizationPatterns.length) throw new Error(`mixed batch ${start} omitted a pattern`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed mode repeated adjacent patterns');

console.log('Factorization strategy verified: 2,500 fixed-mode questions and 1,000 balanced mixed questions across all five patterns.');
