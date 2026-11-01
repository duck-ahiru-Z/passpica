import fs from 'node:fs';
import path from 'node:path';
import { createSequenceProblem, getSequenceGeneralTerm, getSequenceTerms, sequencePatterns } from '../src/lib/sequenceRecurrence.ts';

const sequencePage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/sequence-drill/page.tsx'), 'utf8');
for (const label of ['数列の演習モード', '一般項の係数 C', '一般項の公比 p', '一般項の定数 α']) {
  if (!sequencePage.includes(`aria-label="${label}"`)) throw new Error(`sequence drill must expose ${label} to assistive technology`);
}
if (!sequencePage.includes('role="img" aria-label={`漸化式の階段図。') || !sequencePage.includes('role="status" aria-live="polite"')) {
  throw new Error('sequence graph and answer feedback must be announced accessibly');
}
if (!sequencePage.includes('aria-expanded={showExplanation} aria-controls="sequence-explanation"') || !sequencePage.includes('aria-expanded={showGraph} aria-controls="sequence-cobweb-graph"')) {
  throw new Error('sequence explanation and graph toggles must expose their expanded state');
}

let randomState = 0x5e91c0de;
const seededRandom = () => {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState / 0x100000000;
};

const modes = {
  'positive-contracting': p => p > 0 && p < 1,
  'positive-expanding': p => p > 1,
  'negative-contracting': p => p < 0 && p > -1,
  'negative-expanding': p => p < -1,
};

for (const pattern of sequencePatterns) {
  const observedRatios = new Set();
  for (let index = 0; index < 1200; index += 1) {
    const problem = createSequenceProblem(pattern, seededRandom);
    if (problem.pattern !== pattern || !modes[pattern](problem.p) || problem.a1 === problem.alpha || problem.C !== problem.a1 - problem.alpha) {
      throw new Error(`invalid sequence pattern: ${JSON.stringify(problem)}`);
    }
    if (Math.abs(problem.alpha - (problem.p * problem.alpha + problem.q)) > 1e-12) {
      throw new Error(`fixed point does not solve the recurrence: ${JSON.stringify(problem)}`);
    }
    const terms = getSequenceTerms(problem, 6);
    for (let n = 1; n <= terms.length; n += 1) {
      const closedForm = getSequenceGeneralTerm(problem, n);
      if (Math.abs(terms[n - 1] - closedForm) > 1e-8) {
        throw new Error(`recurrence and general term disagree at n=${n}: ${JSON.stringify(problem)}`);
      }
    }
    observedRatios.add(problem.p);
  }
  if (observedRatios.size < 2) throw new Error(`${pattern} did not vary its common ratio`);
}

const mixed = Array.from({ length: 4000 }, () => createSequenceProblem('mix', seededRandom).pattern);
for (let start = 0; start < mixed.length; start += sequencePatterns.length) {
  if (new Set(mixed.slice(start, start + sequencePatterns.length)).size !== sequencePatterns.length) {
    throw new Error(`mixed batch ${start / sequencePatterns.length} omitted a recurrence pattern`);
  }
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) {
  throw new Error('mixed recurrence practice repeated adjacent patterns');
}

console.log(`Sequence recurrence verified: 4,800 fixed-pattern and 4,000 mixed problems; fixed points, closed forms, convergence/divergence classes, ratio variation, balance, and adjacency checked.`);
