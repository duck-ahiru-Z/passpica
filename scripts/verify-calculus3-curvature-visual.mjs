import fs from 'node:fs';
import path from 'node:path';
import {
  curvatureExtrema,
  curvatureFirstDerivative,
  curvatureFunction,
  curvatureInflectionPoints,
  curvatureInflectionX,
  curvatureSecondDerivative,
} from '../src/lib/calculus3CurvatureVisual.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-curvature-visual/page.tsx'), 'utf8');
if (!page.includes('aria-label="xの位置"') || !page.includes('role="img"') || !page.includes('curvatureSecondDerivative(x)')) {
  throw new Error('curvature visual must expose its slider and graph accessibly and derive concavity from f′′');
}
if (!page.includes('curvatureExtrema.map') || !page.includes('curvatureInflectionPoints.map') || !page.includes('curvatureFirstDerivative(x).toFixed(3)')) {
  throw new Error('graph markers and displayed derivative values must use the tested calculus model');
}

const close = (actual, expected, tolerance = 1e-10) => Math.abs(actual - expected) <= tolerance;
for (const x of [-1.5, -1, -curvatureInflectionX, -0.58, 0, 0.58, curvatureInflectionX, 1, 1.5]) {
  const h = 1e-5;
  const numericalFirst = (curvatureFunction(x + h) - curvatureFunction(x - h)) / (2 * h);
  const numericalSecond = (curvatureFunction(x + h) - 2 * curvatureFunction(x) + curvatureFunction(x - h)) / h ** 2;
  if (!close(curvatureFirstDerivative(x), numericalFirst, 1e-7)) throw new Error(`first derivative mismatch at x=${x}`);
  if (!close(curvatureSecondDerivative(x), numericalSecond, 1e-4)) throw new Error(`second derivative mismatch at x=${x}`);
}

if (curvatureExtrema.length !== 3 || curvatureExtrema[0].x !== -1 || curvatureExtrema[1].x !== 0 || curvatureExtrema[2].x !== 1) {
  throw new Error('the graph must mark all three critical points');
}
for (const critical of curvatureExtrema) {
  if (!close(curvatureFirstDerivative(critical.x), 0) || !close(curvatureFunction(critical.x), critical.y)) {
    throw new Error(`critical-point coordinates or tangent slope mismatch at x=${critical.x}`);
  }
  if (critical.label === '極小' && curvatureSecondDerivative(critical.x) <= 0) throw new Error(`minimum classification mismatch at x=${critical.x}`);
  if (critical.label === '極大' && curvatureSecondDerivative(critical.x) >= 0) throw new Error(`maximum classification mismatch at x=${critical.x}`);
}

if (curvatureInflectionPoints.length !== 2 || !close(curvatureInflectionX, 1 / Math.sqrt(3))) {
  throw new Error('both inflection points must be marked at ±1/√3');
}
for (const x of curvatureInflectionPoints) {
  if (!close(curvatureSecondDerivative(x), 0) || !close(curvatureFunction(x), -5 / 9)) {
    throw new Error(`inflection point formula mismatch at x=${x}`);
  }
}
if (!(curvatureSecondDerivative(0.57) < 0 && curvatureSecondDerivative(0.58) > 0)) {
  throw new Error('the displayed slider steps must show the concavity sign change around x≈0.577');
}

console.log('Calculus III curvature visual verified: function derivatives, maxima/minima, both inflection points, concavity sign change, and accessible controls.');
