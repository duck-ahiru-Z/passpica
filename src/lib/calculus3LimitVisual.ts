/** Evaluate sin(x)/x for nonzero x measured in radians. */
export function sineRatioForNonzeroRadians(x: number): number {
  if (!Number.isFinite(x) || x === 0) {
    throw new RangeError('x must be a finite, nonzero radian value');
  }
  return Math.sin(x) / x;
}

/** Evaluate the positive-parameter sequence (1 + a/n)^n for integer n ≥ 1. */
export function exponentialSequenceTerm(coefficient: number, n: number): number {
  if (!Number.isFinite(coefficient) || coefficient <= 0 || !Number.isSafeInteger(n) || n < 1) {
    throw new RangeError('The exponential-sequence coefficient must be positive and n must be a positive integer.');
  }
  return (1 + coefficient / n) ** n;
}
