import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateBaseNProblem } from '../src/lib/baseNConversion.ts';

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
let seed = 0x6b6173;
const random = () => {
  seed = (seed * 48271) % 2147483647;
  return seed / 2147483647;
};
const parseInteger = (digits, base) => Number.parseInt(String(digits), base);
const parseFractional = (digits, base) => {
  const fraction = String(digits).split('.')[1];
  return [...fraction].reduce((sum, digit, index) => sum + Number(digit) / base ** (index + 1), 0);
};

for (const pattern of patterns) {
  const variants = new Set();
  for (let index = 0; index < 1_000; index += 1) {
    const problem = generateBaseNProblem(pattern, random);
    assert.equal(problem.pattern, pattern);
    assert.ok(problem.n >= 2 && problem.n <= 9);

    if (pattern === 'pattern1') {
      assert.ok(Number.isInteger(problem.q_val) && problem.q_val >= 10 && problem.q_val <= 200);
      assert.equal(parseInteger(problem.a_val, problem.n), problem.q_val);
      assert.equal(problem.dec_val, problem.q_val);
      variants.add(`${problem.n}:${problem.q_val}`);
    } else if (pattern === 'pattern2') {
      const digits = String(problem.q_val);
      assert.match(digits, /^[1-9][0-8]{2,3}$/);
      assert.ok([...digits].every(digit => Number(digit) < problem.n), `${digits} contains a digit invalid in base ${problem.n}`);
      assert.equal(parseInteger(digits, problem.n), Number(problem.a_val));
      assert.equal(problem.dec_val, Number(problem.a_val));
      variants.add(`${problem.n}:${digits}`);
    } else if (pattern === 'pattern3') {
      assert.ok(problem.m && problem.m >= 2 && problem.m <= 9 && problem.m !== problem.n);
      assert.ok(problem.dec_val >= 10 && problem.dec_val <= 49);
      assert.equal(parseInteger(problem.q_val, problem.n), problem.dec_val);
      assert.equal(parseInteger(problem.a_val, problem.m), problem.dec_val);
      variants.add(`${problem.n}:${problem.q_val}->${problem.m}:${problem.a_val}`);
    } else {
      assert.ok([2, 4, 5, 8].includes(problem.n));
      assert.match(problem.a_val, /^0\.[0-7][1-7]$/);
      const digits = problem.a_val.slice(2);
      assert.ok([...digits].every(digit => Number(digit) < problem.n));
      assert.ok(Math.abs(parseFractional(problem.a_val, problem.n) - problem.q_val) < 1e-12);
      assert.equal(problem.dec_val, problem.q_val);
      variants.add(`${problem.n}:${problem.a_val}`);
    }
  }
  assert.ok(variants.size > (pattern === 'pattern4' ? 70 : 100), `${pattern} generated only ${variants.size} distinct questions`);
}

const exhaustiveFractionalVariants = new Set();
for (const [baseIndex, base] of [2, 4, 5, 8].entries()) {
  for (let firstDigit = 0; firstDigit < base; firstDigit += 1) {
    for (let secondDigit = 1; secondDigit < base; secondDigit += 1) {
      const draws = [(baseIndex + 0.1) / 4, (firstDigit + 0.1) / base, (secondDigit - 1 + 0.1) / (base - 1)];
      let cursor = 0;
      const problem = generateBaseNProblem('pattern4', () => draws[cursor++]);
      assert.equal(problem.n, base);
      assert.equal(problem.a_val, `0.${firstDigit}${secondDigit}`);
      exhaustiveFractionalVariants.add(`${base}:${problem.a_val}`);
    }
  }
}
assert.equal(exhaustiveFractionalVariants.size, 90, 'fractional conversion must cover all valid two-digit answers across the four supported bases');
const displayDraws = [0.625, 0.3, 0.1];
let displayDrawIndex = 0;
const floatingPointDisplayCase = generateBaseNProblem('pattern4', () => displayDraws[displayDrawIndex++]);
assert.equal(floatingPointDisplayCase.q_val, 0.24, 'finite decimal values must not expose binary floating-point artifacts');
assert.equal(String(floatingPointDisplayCase.q_val), '0.24');

const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let longestRun = 0;
let run = 0;
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateBaseNProblem('mix', random);
  assert.ok(counts.has(problem.pattern), `unknown mixed pattern: ${problem.pattern}`);
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  run = problem.pattern === previous ? run + 1 : 1;
  longestRun = Math.max(longestRun, run);
  previous = problem.pattern;
}
for (const [pattern, count] of counts) assert.equal(count, 5_000, `${pattern} appeared ${count}/20,000 times`);
assert.equal(longestRun, 1, 'mixed mode must not repeat the same conversion pattern consecutively');

const page = fs.readFileSync('src/app/learn/math/base-n-conversion-drill/page.tsx', 'utf8');
for (const pattern of patterns) assert.ok(page.includes(`value="${pattern}"`), `${pattern} must remain independently selectable`);
assert.ok(page.includes('generateBaseNProblem'), 'the UI must call the tested production generator');
assert.ok(page.includes('ansVal.trim() === problem.a_val'), 'answers must be checked against the generated conversion result');
assert.ok(page.includes('aria-label="n進法変換の演習パターン"'), 'the conversion mode selector must have an accessible name');
assert.ok(page.includes('aria-label="変換した数値の答え"'), 'the answer input must have an accessible name');
assert.ok(page.includes("selectedPattern === 'mix' && ("), 'mixed mode must require the learner to identify the conversion method');
assert.ok(page.includes('selectedStrategy === problem.pattern'), 'mixed answers must validate the selected conversion method');
assert.ok(page.includes('name="base-n-conversion-strategy"'), 'conversion methods must be grouped in one accessible radio set');
assert.ok(!page.includes('flex flex-col justify-center min-h-[120px] gap-3 text-lg'), 'inline conversion expressions must not be split into vertical flex items');
assert.ok(page.includes('mulSteps.map(s =>'), 'fractional conversion explanation must show its repeated-multiplication steps');
assert.ok(!page.includes('\\cline'), 'KaTeX explanations must not contain unsupported cline commands');

console.log('Base conversion verified: 4 patterns × 1,000 mathematically checked questions; mixed 20,000 with exact balance and no adjacent repeats; answer and explanation wiring checked.');
