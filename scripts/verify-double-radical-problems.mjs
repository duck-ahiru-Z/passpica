import { doubleRadicalPatterns, generateDoubleRadicalProblem, parseRadicandAnswer } from '../src/lib/doubleRadicalProblems.ts';
import fs from 'node:fs';
import path from 'node:path';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/double-radical-drill/page.tsx'), 'utf8');
if (!drillPage.includes('role="status" aria-live="polite"')
  || !drillPage.includes('role="alert"')
  || drillPage.includes("alert('枠に整数を入力してください。')")
  || !drillPage.includes('aria-invalid={Boolean(validationError)}')
  || !drillPage.includes("aria-pressed={detailLevel === 'brief'}")
  || !drillPage.includes("aria-pressed={detailLevel === 'normal'}")
  || !drillPage.includes("aria-pressed={detailLevel === 'detailed'}")
  || (drillPage.match(/setValidationError\(''\); setHasChecked\(false\); setIsCorrect\(false\);/g) ?? []).length !== 4) {
  throw new Error('double-radical validation, feedback, and explanation-level choices must be exposed accessibly');
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function verify(problem) {
  const sign = problem.sign === '+' ? 1 : -1;
  const radicand = problem.pattern === 'pattern3'
    ? problem.sum + sign * 2 * problem.k * Math.sqrt(problem.inner)
    : problem.pattern === 'pattern4'
      ? problem.X + sign * Math.sqrt(problem.prod)
      : problem.sum + sign * 2 * Math.sqrt(problem.prod);
  const answer = problem.pattern === 'pattern4'
    ? (Math.sqrt(problem.a) + sign * Math.sqrt(problem.b)) / Math.sqrt(2)
    : Math.sqrt(problem.a) + sign * Math.sqrt(problem.b);
  if (radicand < 0 || Math.abs(Math.sqrt(radicand) - answer) > 1e-10) {
    throw new Error(`identity failed: ${JSON.stringify(problem)}; sqrt(${radicand}) != ${answer}`);
  }
  if (problem.pattern === 'pattern3' && 2 * problem.k === 2) throw new Error('pattern3 did not produce a non-basic coefficient');
  if (problem.pattern === 'pattern4' && (problem.a % 2 === 0 || problem.b % 2 === 0)) throw new Error('pattern4 requires odd a and b');
}

for (const [input, expected] of [['3', 3], [' 12 ', 12], ['3.8', null], ['', null], ['3abc', null], ['1e2', null], ['9007199254740992', null], ['0', null], ['-2', null]]) {
  if (parseRadicandAnswer(input) !== expected) throw new Error(`answer parser failed for ${JSON.stringify(input)}`);
}

for (let patternIndex = 0; patternIndex < doubleRadicalPatterns.length; patternIndex += 1) {
  const pattern = doubleRadicalPatterns[patternIndex];
  const random = seeded(patternIndex + 41);
  for (let index = 0; index < 1000; index += 1) {
    const problem = generateDoubleRadicalProblem(pattern, random);
    if (problem.pattern !== pattern || problem.a <= problem.b) throw new Error(`invalid fixed pattern output: ${pattern}`);
    verify(problem);
  }
}

const random = seeded(20261017);
const mixed = Array.from({ length: 1200 }, () => generateDoubleRadicalProblem('mix', random));
for (let start = 0; start < mixed.length; start += doubleRadicalPatterns.length) {
  if (new Set(mixed.slice(start, start + doubleRadicalPatterns.length).map(problem => problem.pattern)).size !== doubleRadicalPatterns.length) {
    throw new Error(`mixed batch ${start} omitted a pattern`);
  }
}
if (mixed.some((problem, index) => index > 0 && problem.pattern === mixed[index - 1].pattern)) throw new Error('mixed mode repeated adjacent patterns');
mixed.forEach(verify);

console.log('Double-radical drills verified: 4,000 fixed and 1,200 mixed problems; all identities, variant constraints, pattern coverage, and adjacency checked.');
