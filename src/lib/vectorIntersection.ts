export interface ReducedPositiveFraction {
  numerator: number;
  denominator: number;
}

export interface VectorIntersectionWeights {
  x: ReducedPositiveFraction;
  y: ReducedPositiveFraction;
}

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function reduceFraction(numerator: number, denominator: number): ReducedPositiveFraction {
  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

/** Position-vector coefficients of the intersection of AD and BC in an OAB triangle. */
export function calculateVectorIntersectionWeights(m: number, n: number, s: number, t: number): VectorIntersectionWeights {
  if (![m, n, s, t].every(value => Number.isSafeInteger(value) && value > 0)) {
    throw new RangeError('Internal-division ratios must be positive safe integers.');
  }

  const denominator = s * n + t * m + t * n;
  return {
    x: reduceFraction(t * m, denominator),
    y: reduceFraction(n * s, denominator),
  };
}
