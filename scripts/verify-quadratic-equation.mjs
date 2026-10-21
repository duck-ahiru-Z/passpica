import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  createQuadraticEquationScheduler,
  generateQuadraticEquationProblem,
  isQuadraticEquationAnswerCorrect,
  quadraticEquationPatterns,
} from '../src/lib/quadraticEquationProblems.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/quadratic-equation-drill/page.tsx'), 'utf8');
assert.ok(page.includes('1つ目の解') && page.includes('2つ目の解'), 'answer input labels must not imply an order that the grader does not require');
assert.ok(page.includes('2つの解を小数第3位まで入力（順不同）'));
assert.ok(!page.includes('小さい方の解') && !page.includes('大きい方の解'));

let seed = 0x51a7;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
};

for (const pattern of quadraticEquationPatterns) {
  const examples = new Set();
  for (let index = 0; index < 1500; index += 1) {
    const problem = generateQuadraticEquationProblem(pattern, random);
    assert.equal(problem.pattern, pattern);
    assert.ok(problem.expression.includes('=') && problem.explanation.trim());
    if (pattern === 'quadratic-formula') {
      const [, b] = problem.coefficients;
      assert.ok(problem.explanation.includes(`D=(${b})²−`), 'the discriminant explanation must group a negative b before squaring');
    }
    assert.ok(problem.roots[0] < problem.roots[1]);
    for (const root of problem.roots) {
      const [a, b, c] = problem.coefficients;
      assert.ok(Math.abs(a * root ** 2 + b * root + c) < 1e-8, `${pattern} root does not satisfy its equation: ${JSON.stringify(problem)}`);
    }
    assert.ok(isQuadraticEquationAnswerCorrect(problem, problem.roots[0].toFixed(3), problem.roots[1].toFixed(3)));
    assert.ok(isQuadraticEquationAnswerCorrect(problem, problem.roots[1].toFixed(3), problem.roots[0].toFixed(3)), 'root order should not matter');
    assert.equal(isQuadraticEquationAnswerCorrect(problem, '', problem.roots[1].toFixed(3)), false);
    examples.add(problem.expression);
  }
  assert.ok(examples.size >= 30, `${pattern} produced too few distinct equations: ${examples.size}`);
}

const scheduler = createQuadraticEquationScheduler();
const mixed = Array.from({ length: 4000 }, () => scheduler.next(random));
for (let start = 0; start < mixed.length; start += quadraticEquationPatterns.length) {
  assert.equal(new Set(mixed.slice(start, start + quadraticEquationPatterns.length)).size, quadraticEquationPatterns.length, `mixed batch ${start} omitted a solution method`);
}
assert.ok(mixed.every((pattern, index) => index === 0 || pattern !== mixed[index - 1]), 'mixed mode must avoid adjacent repeats, including batch boundaries');

const zeroRootProblem = { pattern: 'factorization', expression: 'x²-2x=0', roots: [0, 2], coefficients: [1, -2, 0], explanation: 'x(x-2)=0' };
assert.equal(isQuadraticEquationAnswerCorrect(zeroRootProblem, '', '2.000'), false, 'blank input must not be interpreted as the valid root zero');
assert.equal(isQuadraticEquationAnswerCorrect(zeroRootProblem, '0', '2'), true);
assert.equal(isQuadraticEquationAnswerCorrect(zeroRootProblem, 'Infinity', '2'), false);

console.log('Quadratic-equation drill verified: 6,000 generated equations, all roots, 4,000 balanced mixed draws, unordered rounded answers, and input validation.');
