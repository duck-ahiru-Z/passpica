export interface HyperbolaMetrics {
  standardA2: number;
  standardB2: number;
  focusDistance: number;
  slopeNumerator: number;
  slopeDenominator: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Derive canonical labels and asymptote slope for either hyperbola orientation. */
export function getHyperbolaMetrics(a: number, b: number, horizontal: boolean): HyperbolaMetrics {
  const divisor = gcd(a, b);
  return {
    standardA2: horizontal ? a * a : b * b,
    standardB2: horizontal ? b * b : a * a,
    focusDistance: Math.hypot(a, b),
    slopeNumerator: b / divisor,
    slopeDenominator: a / divisor,
  };
}
