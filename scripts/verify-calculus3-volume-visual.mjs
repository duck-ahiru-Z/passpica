import fs from 'node:fs';
import path from 'node:path';
import { rightDiskApproximation, rotationCrossSectionArea, rotationVolume } from '../src/lib/calculus3VolumeVisual.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-volume-visual/page.tsx'), 'utf8');
if (!page.includes('y=x²') || !page.includes('断面積 A(x)') || !page.includes('πx⁴') || !page.includes('πb⁵/5')) {
  throw new Error('volume visual must connect the rotated region, disk cross-section, and integral volume formula');
}
if (!page.includes('aria-label={`y=x²をx軸の周りに回転') || !page.includes('aria-label="回転区間の上端"') || !page.includes('aria-label="円板の分割数"')) {
  throw new Error('volume visual must provide accessible descriptions for the figure and controls');
}

const close = (actual, expected, tolerance = 1e-10) => Math.abs(actual - expected) <= tolerance;
for (const x of [0, 0.25, 0.5, 1, 1.5, 2]) {
  if (!close(rotationCrossSectionArea(x), Math.PI * x ** 4)) throw new Error(`cross-section area mismatch at x=${x}`);
}

for (const upper of [0.5, 1, 1.5, 2]) {
  const exact = rotationVolume(upper);
  if (!close(exact, Math.PI * upper ** 5 / 5)) throw new Error(`exact volume mismatch at upper=${upper}`);
  let previousError = Infinity;
  for (const slices of [4, 8, 12, 16, 20]) {
    const approximation = rightDiskApproximation(upper, slices);
    const error = approximation - exact;
    if (error < -1e-10) throw new Error(`right-endpoint disks underestimated volume at upper=${upper}, n=${slices}`);
    if (!(error < previousError)) throw new Error(`disk sum did not converge as n increased at upper=${upper}, n=${slices}`);
    previousError = error;
  }
}

let rejectedInvalidCount = false;
try {
  rightDiskApproximation(1, 0);
} catch (error) {
  rejectedInvalidCount = error instanceof RangeError;
}
if (!rejectedInvalidCount) throw new Error('disk approximation must reject a non-positive slice count');

console.log('Calculus III volume visual verified: cross-sections, exact volumes, right-disk convergence, invalid slice counts, and accessible controls.');
