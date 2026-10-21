import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getEllipseParametricState } from '../src/lib/calculus3ParametricVisual.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-parametric-visual/page.tsx'), 'utf8');
if (!page.includes('getEllipseParametricState(t)') || !page.includes('aria-label="媒介変数t"') || !page.includes('role="img"')) {
  throw new Error('the accessible visual controls and displayed values must use the tested parametric model');
}
const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-differentiation-drill/page.tsx'), 'utf8');
if (!page.includes('/learn/math/calculus3-differentiation-drill') || !drillPage.includes('/learn/math/calculus3-parametric-visual')) {
  throw new Error('parametric visual and differentiation practice must link to each other');
}

const close = (actual, expected, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≉ ${expected}`);
};

const specialCases = [
  { t: 0, x: 2, y: 0, dxdt: 0, dydt: 1, slope: null, speed: 1 },
  { t: Math.PI / 2, x: 0, y: 1, dxdt: -2, dydt: 0, slope: 0, speed: 2 },
  { t: Math.PI, x: -2, y: 0, dxdt: 0, dydt: -1, slope: null, speed: 1 },
  { t: 3 * Math.PI / 2, x: 0, y: -1, dxdt: 2, dydt: 0, slope: 0, speed: 2 },
  { t: 2 * Math.PI, x: 2, y: 0, dxdt: 0, dydt: 1, slope: null, speed: 1 },
];

for (const expected of specialCases) {
  const actual = getEllipseParametricState(expected.t);
  for (const key of ['x', 'y', 'dxdt', 'dydt', 'speed']) close(actual[key], expected[key]);
  assert.equal(actual.slope, expected.slope);
}

const sampleCount = 20_000;
const delta = 1e-6;
const patternCounts = { vertical: 0, horizontal: 0, positive: 0, negative: 0 };
let minSpeed = Infinity;
let maxSpeed = -Infinity;

for (let index = 0; index <= sampleCount; index += 1) {
  const t = 2 * Math.PI * index / sampleCount;
  const state = getEllipseParametricState(t);
  close((state.x ** 2) / 4 + state.y ** 2, 1, 1e-12);
  close(state.speed ** 2, state.dxdt ** 2 + state.dydt ** 2, 1e-12);

  const ahead = getEllipseParametricState(t + delta);
  const behind = getEllipseParametricState(t - delta);
  close(state.dxdt, (ahead.x - behind.x) / (2 * delta), 2e-6);
  close(state.dydt, (ahead.y - behind.y) / (2 * delta), 2e-6);

  if (state.slope === null) patternCounts.vertical += 1;
  else if (state.slope === 0) patternCounts.horizontal += 1;
  else if (state.slope > 0) patternCounts.positive += 1;
  else patternCounts.negative += 1;
  minSpeed = Math.min(minSpeed, state.speed);
  maxSpeed = Math.max(maxSpeed, state.speed);
}

for (const [pattern, count] of Object.entries(patternCounts)) {
  const minimumExpected = pattern === 'vertical' || pattern === 'horizontal' ? 2 : 100;
  assert.ok(count >= minimumExpected, `insufficient ${pattern}: ${count}`);
}
assert.ok(minSpeed >= 1 - 1e-12 && maxSpeed <= 2 + 1e-12);
console.log(`Parametric visual verified: ${sampleCount + 1} samples; ${JSON.stringify(patternCounts)}; speed ${minSpeed.toFixed(3)}–${maxSpeed.toFixed(3)}.`);
