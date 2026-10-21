import fs from 'node:fs';
import path from 'node:path';
import { rightDiskApproximation, rotationCrossSectionArea, rotationDiskRadius, rotationSectionIndices, rotationVolume } from '../src/lib/calculus3VolumeVisual.ts';

const page = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/calculus3-volume-visual/page.tsx'), 'utf8');
if (!page.includes('y=x²') || !page.includes('断面積 A(x)') || !page.includes('πx⁴') || !page.includes('πb⁵/5')) {
  throw new Error('volume visual must connect the rotated region, disk cross-section, and integral volume formula');
}
if (!page.includes('/learn/math/calculus3-area-volume-drill')) {
  throw new Error('volume visual must link directly to its matching calculation exercise');
}
if (!page.includes('aria-label={`y=x²をx軸の周りに回転') || !page.includes('aria-label="回転区間の上端"') || !page.includes('aria-label="円板の分割数"')) {
  throw new Error('volume visual must provide accessible descriptions for the figure and controls');
}
if (!page.includes('rotationDiskRadius(index, sliceCount, solidRadius, upper)') || page.includes('Math.max(2, diskRadius(index))')) {
  throw new Error('the solid profile and its slices must scale with the selected upper bound without a radius floor');
}
if (!page.includes('右端円板和の分割数${sliceCount}') || page.includes('断面円板数${sliceCount}')) {
  throw new Error('the figure description must identify n as the numerical approximation partition count, not the number of drawn cross-sections');
}

const close = (actual, expected, tolerance = 1e-10) => Math.abs(actual - expected) <= tolerance;
for (const x of [0, 0.25, 0.5, 1, 1.5, 2]) {
  if (!close(rotationCrossSectionArea(x), Math.PI * x ** 4)) throw new Error(`cross-section area mismatch at x=${x}`);
}

for (const upper of [0.5, 1, 1.5, 2]) {
  for (const slices of [4, 8, 12, 16, 20]) {
    const sections = rotationSectionIndices(slices);
    if (sections.length === 0 || sections.some(index => index < 1 || index > slices)) {
      throw new Error(`displayed disk sections must be inside the solid at n=${slices}`);
    }
    if (new Set(sections).size !== sections.length) throw new Error(`displayed disk sections must be unique at n=${slices}`);
    for (const index of sections) {
      const radius = rotationDiskRadius(index, slices, 105, upper);
      const x = upper * index / slices;
      if (!close(radius / 105, (x / 2) ** 2)) throw new Error(`displayed disk radius must match y=x² for b=${upper}, i=${index}, n=${slices}`);
    }
    if (!close(rotationDiskRadius(slices, slices, 105, upper) / 105, (upper / 2) ** 2)) {
      throw new Error(`end disk must match the selected upper bound b=${upper}, n=${slices}`);
    }
  }
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

for (const [index, slices, radius, upper] of [[-1, 8, 105, 2], [9, 8, 105, 2], [1.5, 8, 105, 2], [1, 8, -1, 2], [1, 8, Infinity, 2], [1, 8, 105, -1], [1, 8, 105, Infinity]]) {
  let rejected = false;
  try {
    rotationDiskRadius(index, slices, radius, upper);
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  if (!rejected) throw new Error(`displayed disk geometry must reject invalid inputs: i=${index}, n=${slices}, R=${radius}, b=${upper}`);
}

for (const slices of [0, 2.5]) {
  let rejected = false;
  try {
    rotationSectionIndices(slices);
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  if (!rejected) throw new Error(`displayed disk sections must reject invalid slice count: ${slices}`);
}

console.log('Calculus III volume visual verified: cross-sections, displayed disk geometry, exact volumes, right-disk convergence, invalid inputs, and accessible controls.');
