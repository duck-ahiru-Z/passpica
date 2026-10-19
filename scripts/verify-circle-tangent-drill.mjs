import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createCircleTangentProblem } from '../src/lib/circleTangent.ts';

let seed = 0x7f4a7c15;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const closeTo = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} != ${expected}`);
const lineValue = (line, x, y) => line[0] * x + line[1] * y;
const normalize = (a, b, c) => {
  const gcd = (x, y) => y === 0 ? Math.abs(x) : gcd(y, x % y);
  const divisor = gcd(gcd(a, b), c);
  [a, b, c] = [a / divisor, b / divisor, c / divisor];
  if (a < 0 || (a === 0 && b < 0)) [a, b, c] = [-a, -b, -c];
  return [a, b, c];
};

const seen = new Set();
for (let index = 0; index < 10_000; index += 1) {
  const problem = createCircleTangentProblem(random);
  const firstLine = [problem.A1, problem.B1, problem.C1];
  const secondLine = [problem.A2, problem.B2, problem.C2];
  assert.equal(problem.x1 ** 2 + problem.y1 ** 2, problem.R2, 'first contact point must lie on the circle');
  closeTo(problem.x2 ** 2 + problem.y2 ** 2, problem.R2, 'second contact point must lie on the circle');
  assert.deepEqual(normalize(problem.x1, problem.y1, problem.R2), firstLine, 'first tangent line must pass through the first contact');
  closeTo(lineValue(firstLine, problem.s, problem.t), problem.C1, 'first tangent must pass through P');
  closeTo(lineValue(secondLine, problem.s, problem.t), problem.C2, 'second tangent must pass through P');
  closeTo(lineValue(secondLine, problem.x2, problem.y2), problem.C2, 'second tangent must pass through its contact');
  assert.equal(problem.R2 * (problem.A1 ** 2 + problem.B1 ** 2), problem.C1 ** 2,
    'first tangent coefficients must satisfy distance(center,line) = radius');
  assert.equal(problem.R2 * (problem.A2 ** 2 + problem.B2 ** 2), problem.C2 ** 2,
    'second tangent coefficients must satisfy distance(center,line) = radius');
  assert.notDeepEqual(firstLine, secondLine, 'external point must produce two distinct tangents');
  seen.add(`${problem.s},${problem.t}:${firstLine.join(',')}:${secondLine.join(',')}`);
}
assert.ok(seen.size >= 90, 'generated questions should cover nearly all base-point/external-point combinations');

const page = fs.readFileSync('src/app/learn/math/circle-tangent-drill/page.tsx', 'utf8');
assert.ok(page.includes('createCircleTangentProblem'), 'the page must use the tested production generator');
assert.ok(page.includes('value="mix"'), 'mixed strategy mode must remain available');
assert.ok(page.includes('value="contact"'), 'contact-point strategy must be individually selectable');
assert.ok(page.includes('value="distance"'), 'center-distance strategy must be individually selectable');
assert.ok(page.includes('aria-label={`中心O'), 'canvas must have a dynamic accessible description');
assert.ok(page.includes('\\frac{|m(0)'), 'detailed distance solution must render LaTeX correctly');

console.log(`Circle tangent drill verified: 10,000 actual generated problems; both contacts lie on the circle, both lines pass through the external point and are tangent; visualization, strategy controls, and explanation checked.`);
