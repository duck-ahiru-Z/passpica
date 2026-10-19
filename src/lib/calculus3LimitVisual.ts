/** Evaluate sin(x)/x for nonzero x measured in radians. */
export function sineRatioForNonzeroRadians(x: number): number {
  if (!Number.isFinite(x) || x === 0) {
    throw new RangeError('x must be a finite, nonzero radian value');
  }
  return Math.sin(x) / x;
}
