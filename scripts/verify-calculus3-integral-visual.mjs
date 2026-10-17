import fs from 'node:fs';
import path from 'node:path';
import { rightRectangleApproximation, squareAreaBetweenZeroAnd } from '../src/lib/calculus3IntegralVisual.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-integral-visual/page.tsx'), 'utf8');
if (!page.includes('y = x²') || !page.includes('∫₀^{upper.toFixed(2)} x² dx') || !page.includes('近似−正確')) {
  throw new Error('integral visual must connect the square curve, definite-integral notation, and approximation error');
}
if (!page.includes('aria-label="積分区間の上端"') || !page.includes('aria-label="長方形の分割数"') || !page.includes('rightRectangleApproximation(upper, rectangleCount)')) {
  throw new Error('integral visual must expose its controls accessibly and use the tested approximation');
}

const close = (actual, expected, tolerance = 1e-10) => Math.abs(actual - expected) <= tolerance;
for (const upper of [0, 0.2, 0.5, 1, 2, 2.5]) {
  const exact = squareAreaBetweenZeroAnd(upper);
  if (!close(exact, upper ** 3 / 3)) throw new Error(`exact area mismatch at upper=${upper}`);
  let previousError = Infinity;
  for (const rectangles of [4, 8, 12, 16, 20, 24, 28, 32]) {
    const approximation = rightRectangleApproximation(upper, rectangles);
    const error = approximation - exact;
    if (upper > 0 && error <= 0) throw new Error(`right endpoint rectangles did not overestimate at upper=${upper}, n=${rectangles}`);
    if (error > previousError + 1e-10) throw new Error(`approximation did not converge at upper=${upper}, n=${rectangles}`);
    previousError = error;
  }
}

for (const [upper, rectangles] of [[2, 8], [2.5, 32]]) {
  const exact = squareAreaBetweenZeroAnd(upper);
  const approximation = rightRectangleApproximation(upper, rectangles);
  if (!Number.isFinite(exact) || !Number.isFinite(approximation) || approximation <= exact) {
    throw new Error(`displayed values must show a finite right-endpoint overestimate at upper=${upper}, n=${rectangles}`);
  }
}

for (const [upper, rectangles] of [[-1, 8], [1, 0], [1, -1], [1, 1.5]]) {
  let rejected = false;
  try {
    rightRectangleApproximation(upper, rectangles);
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  if (!rejected) throw new Error(`invalid inputs should be rejected: upper=${upper}, n=${rectangles}`);
}

console.log('Calculus III integral visual verified: exact area, right-endpoint overestimate, convergence through 32 rectangles, invalid input, and accessible controls.');
