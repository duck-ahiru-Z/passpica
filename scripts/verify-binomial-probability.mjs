import assert from 'node:assert/strict';
import fs from 'node:fs';
import { atLeastOneSuccessProbability, generateBinomialProblem, getBinomialStrategy, gcd, nCr } from '../src/lib/binomialProbability.ts';

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
assert.deepEqual(patterns.map(getBinomialStrategy), ['exact-successes', 'exact-successes', 'complement', 'decisive-final-game']);
let seed = 0x3c6ef35f;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const diceEventNumerators = new Map([
  ['「1の目」', 1],
  ['「3の倍数の目」', 2],
  ['「4以下の目」', 4],
  ['「偶数の目」', 3],
]);

for (const pattern of patterns) {
  const variants = new Set();
  for (let index = 0; index < 2_000; index += 1) {
    const problem = generateBinomialProblem(pattern, random);
    assert.equal(problem.pattern, pattern);
    assert.ok(problem.n >= 3 && problem.n <= 7);
    assert.ok(problem.ans_num > 0 && problem.ans_den > 0);
    assert.equal(gcd(problem.ans_num, problem.ans_den), 1, 'answer fraction must be reduced');

    if (pattern === 'pattern1') {
      assert.ok(problem.n <= 6 && problem.r >= 1 && problem.r < problem.n);
      assert.equal(problem.p_num, 1);
      assert.equal(problem.p_den, 2);
      assert.equal(problem.ans_num / problem.ans_den, nCr(problem.n, problem.r) / 2 ** problem.n);
      variants.add(`${problem.n}:${problem.r}`);
    } else if (pattern === 'pattern2') {
      assert.ok(problem.n <= 5 && problem.r >= 1 && problem.r < problem.n);
      assert.ok(problem.event_label && diceEventNumerators.has(problem.event_label), `unknown dice event: ${problem.event_label}`);
      assert.equal(problem.p_num / problem.p_den, diceEventNumerators.get(problem.event_label) / 6,
        `${problem.event_label} does not match its dice probability`);
      const expected = nCr(problem.n, problem.r) * problem.p_num ** problem.r
        * (problem.p_den - problem.p_num) ** (problem.n - problem.r) / problem.p_den ** problem.n;
      assert.equal(problem.ans_num / problem.ans_den, expected);
      variants.add(`${problem.p_num}/${problem.p_den}:${problem.event_label}`);
    } else if (pattern === 'pattern3') {
      assert.ok(problem.n <= 5 && problem.r === 0);
      const visualSuccess = atLeastOneSuccessProbability(problem.p_num, problem.p_den, problem.n);
      assert.ok(Math.abs(problem.ans_num / problem.ans_den - visualSuccess) < 1e-12);
      assert.equal(visualSuccess + ((problem.p_den - problem.p_num) / problem.p_den) ** problem.n, 1);
      variants.add(`${problem.p_num}/${problem.p_den}:${problem.n}`);
    } else {
      assert.ok(problem.req_wins === 3 || problem.req_wins === 4);
      assert.equal(problem.r, problem.req_wins);
      assert.ok(problem.n > problem.req_wins && problem.n <= 2 * problem.req_wins - 1);
      assert.equal(problem.ans_num / problem.ans_den, nCr(problem.n - 1, problem.req_wins - 1) / 2 ** problem.n);
      variants.add(`${problem.req_wins}:${problem.n}`);
    }
  }
  const minimumVariants = pattern === 'pattern2' ? 4 : pattern === 'pattern3' ? 9 : pattern === 'pattern4' ? 5 : 9;
  assert.ok(variants.size >= minimumVariants, `${pattern} has too few generated variants (${variants.size})`);
}

const counts = new Map(patterns.map(pattern => [pattern, 0]));
let previous;
let longestRun = 0;
let run = 0;
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateBinomialProblem('mix', random);
  assert.ok(counts.has(problem.pattern));
  counts.set(problem.pattern, counts.get(problem.pattern) + 1);
  run = problem.pattern === previous ? run + 1 : 1;
  longestRun = Math.max(longestRun, run);
  previous = problem.pattern;
}
for (const [pattern, count] of counts) assert.equal(count, 5_000, `${pattern} appeared ${count}/20,000 times`);
assert.equal(longestRun, 1);

const page = fs.readFileSync('src/app/learn/math/binomial-probability-drill/page.tsx', 'utf8');
for (const pattern of patterns) assert.ok(page.includes(`value="${pattern}"`), `${pattern} must remain independently selectable`);
assert.ok(page.includes('aria-label="反復試行の演習パターン"'), 'the pattern selector must have an accessible name');
assert.ok(page.includes("selectedPattern === 'mix' && ("), 'mixed mode must ask for a method choice');
assert.ok(page.includes('selectedStrategy === getBinomialStrategy(problem.pattern)'), 'mixed answers must validate the selected method');
assert.ok(page.includes('name="binomial-strategy"'), 'method choices must use an accessible radio group');
assert.ok(page.includes('const successWidth = barW * successProbability'), 'at-least-one-success diagram must use the generated probability, not a hard-coded segment');
assert.ok(page.includes('aria-label={graphDescription}'), 'the diagram must have a problem-specific accessible description');
assert.ok(page.includes('problem.event_label'), 'dice event wording must come from the event probability definition');
assert.ok(page.includes('並び方：${problem.n}C${problem.r} 通り'), 'canvas combination counts must use readable text rather than raw LaTeX source');
assert.ok(!page.includes('ctx.fillText(`この並び方が \\( _{${problem.n}}\\mathrm{C}_'), 'canvas must not print unrendered LaTeX commands');

console.log('Repeated-trial probability verified: 4 patterns × 2,000 formula-checked questions; all die-event labels match their probabilities; mixed 20,000 balanced with no adjacent repeats; visual bar matches the answer.');
