import assert from 'node:assert/strict';
import fs from 'node:fs';
import katex from 'katex';
import { generateLogarithmProblem } from '../src/lib/logarithmDrill.ts';

let seed = 0x6a09e667;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const closeTo = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-10, `${message}: ${actual} != ${expected}`);
const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
const parseAndEvaluate = (problem) => {
  let match;
  if (problem.pattern === 'pattern1') {
    match = problem.qStr.match(/^\\log_\{(\d+)\} (\d+)$/);
    assert.ok(match, `invalid pattern 1 question: ${problem.qStr}`);
    return Math.log(Number(match[2])) / Math.log(Number(match[1]));
  }
  if (problem.pattern === 'pattern2') {
    match = problem.qStr.match(/^\\log_\{(\d+)\} (\d+) \\cdot \\log_\{(\d+)\} (\d+)$/);
    assert.ok(match, `invalid pattern 2 question: ${problem.qStr}`);
    const [baseA, argA, baseB, argB] = match.slice(1).map(Number);
    return (Math.log(argA) / Math.log(baseA)) * (Math.log(argB) / Math.log(baseB));
  }
  if (problem.pattern === 'pattern3') {
    match = problem.qStr.match(/^\\frac\{1\}\{\\log_\{(\d+)\} (\d+)\} \+ \\frac\{1\}\{\\log_\{(\d+)\} (\d+)\}$/);
    assert.ok(match, `invalid pattern 3 question: ${problem.qStr}`);
    const [baseA, argA, baseB, argB] = match.slice(1).map(Number);
    return 1 / (Math.log(argA) / Math.log(baseA)) + 1 / (Math.log(argB) / Math.log(baseB));
  }
  match = problem.qStr.match(/^(\d+)\^\{\\log_\{(\d+)\} (\d+)\}$/);
  assert.ok(match, `invalid pattern 4 question: ${problem.qStr}`);
  const [outerBase, innerBase, argument] = match.slice(1).map(Number);
  return outerBase ** (Math.log(argument) / Math.log(innerBase));
};

for (const pattern of patterns) {
  const variants = new Set();
  for (let index = 0; index < 5_000; index += 1) {
    const problem = generateLogarithmProblem(pattern, random);
    assert.equal(problem.pattern, pattern);
    const actual = parseAndEvaluate(problem);
    closeTo(actual, problem.ansNum / problem.ansDen, `${pattern} answer key must match the question`);
    assert.ok(problem.ansDen > 0);
    for (const line of problem.expLines) assert.doesNotThrow(() => katex.renderToString(line, { throwOnError: true }), `${pattern} explanation must render: ${line}`);
    variants.add(problem.qStr);
  }
  assert.ok(variants.size >= (pattern === 'pattern3' ? 12 : 10), `${pattern} should expose enough distinct questions (found ${variants.size})`);
  console.log(`${pattern}: 5,000 generated questions; parsed expression, answer key and KaTeX explanation verified (${variants.size} unique questions).`);
}

const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let longestRun = 0;
let run = 0;
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateLogarithmProblem('mix', random);
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  run = problem.pattern === previous ? run + 1 : 1;
  longestRun = Math.max(longestRun, run);
  previous = problem.pattern;
}
for (const [pattern, count] of counts) assert.equal(count, 5_000, `${pattern} should be evenly represented in mixed practice`);
assert.equal(longestRun, 1, 'mixed practice should not repeat the same strategy consecutively');

const page = fs.readFileSync('src/app/learn/math/logarithm-drill/page.tsx', 'utf8');
assert.ok(page.includes('generateLogarithmProblem'), 'page must use the tested production generator');
assert.ok(page.includes('aria-label="対数計算の答え"'), 'the logarithm answer input must have an accessible name');
for (const pattern of patterns) assert.ok(page.includes(`value="${pattern}"`), `${pattern} must be individually selectable`);
console.log('Logarithm mixed mode verified: 20,000 questions, exactly 5,000 per pattern, with no adjacent strategy repeats.');
