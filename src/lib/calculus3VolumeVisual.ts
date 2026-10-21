export function rotationCrossSectionArea(x: number): number {
  return Math.PI * x ** 4;
}

export function rotationVolume(upper: number): number {
  return Math.PI * upper ** 5 / 5;
}

export function rotationDiskRadius(index: number, sliceCount: number, displayRadius: number, upper: number): number {
  if (!Number.isInteger(sliceCount) || sliceCount <= 0) {
    throw new RangeError('sliceCount must be a positive integer');
  }
  if (!Number.isInteger(index) || index < 0 || index > sliceCount) {
    throw new RangeError('index must be an integer within the slice range');
  }
  if (!Number.isFinite(displayRadius) || displayRadius < 0) {
    throw new RangeError('displayRadius must be a finite non-negative number');
  }
  if (!Number.isFinite(upper) || upper < 0) {
    throw new RangeError('upper must be a finite non-negative number');
  }
  return displayRadius * (upper / 2) ** 2 * (index / sliceCount) ** 2;
}

export function rotationSectionIndices(sliceCount: number): number[] {
  if (!Number.isInteger(sliceCount) || sliceCount <= 0) {
    throw new RangeError('sliceCount must be a positive integer');
  }
  return [...new Set([1, Math.round(sliceCount / 4), Math.round(sliceCount / 2), Math.round(3 * sliceCount / 4), sliceCount])]
    .filter(index => index > 0 && index <= sliceCount);
}

export function rightDiskApproximation(upper: number, sliceCount: number): number {
  if (!Number.isInteger(sliceCount) || sliceCount <= 0) {
    throw new RangeError('sliceCount must be a positive integer');
  }
  const step = upper / sliceCount;
  return Math.PI * Array.from({ length: sliceCount }, (_, index) => ((index + 1) * step) ** 4 * step)
    .reduce((sum, diskVolume) => sum + diskVolume, 0);
}
