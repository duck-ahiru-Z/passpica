export function rotationCrossSectionArea(x: number): number {
  return Math.PI * x ** 4;
}

export function rotationVolume(upper: number): number {
  return Math.PI * upper ** 5 / 5;
}

export function rightDiskApproximation(upper: number, sliceCount: number): number {
  if (!Number.isInteger(sliceCount) || sliceCount <= 0) {
    throw new RangeError('sliceCount must be a positive integer');
  }
  const step = upper / sliceCount;
  return Math.PI * Array.from({ length: sliceCount }, (_, index) => ((index + 1) * step) ** 4 * step)
    .reduce((sum, diskVolume) => sum + diskVolume, 0);
}
