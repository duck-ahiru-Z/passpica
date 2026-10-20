export interface CircleTangentProblem {
  s: number;
  t: number;
  R2: number;
  A1: number;
  B1: number;
  C1: number;
  A2: number;
  B2: number;
  C2: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const slopeLineDistanceFormula = String.raw`d = \frac{|m(0) - (-1)(0) - \dots|}{\sqrt{m^2 + (-1)^2}}`;

function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function gcd3(x: number, y: number, z: number): number {
  return gcd(gcd(x, y), z);
}

function normalizeLine(a: number, b: number, c: number): [number, number, number] {
  const divisor = gcd3(a, b, c);
  let na = a / divisor;
  let nb = b / divisor;
  let nc = c / divisor;
  if (na < 0 || (na === 0 && nb < 0)) [na, nb, nc] = [-na, -nb, -nc];
  return [na, nb, nc];
}

const basePoints = [
  [3, 4], [4, 3], [-3, 4], [4, -3], [3, -4], [-4, 3], [1, 2], [2, 1], [-1, 2], [2, -1], [1, -2], [-2, 1],
  [2, 3], [3, 2], [-2, 3], [3, -2], [2, -3], [-3, 2], [1, 3], [3, 1], [-1, 3], [3, -1], [1, -3], [-3, 1],
] as const;

export function createCircleTangentProblem(random = Math.random): CircleTangentProblem {
  const [x1, y1] = basePoints[Math.floor(random() * basePoints.length)];
  const R2 = x1 * x1 + y1 * y1;
  const k = [-2, -1, 1, 2][Math.floor(random() * 4)];
  const s = x1 - k * y1;
  const t = y1 + k * x1;
  const [A1, B1, C1] = normalizeLine(x1, y1, R2);
  const s2MinusT2 = s * s - t * t;
  const twiceST = 2 * s * t;
  const X2 = s2MinusT2 * x1 + twiceST * y1;
  const Y2 = twiceST * x1 - s2MinusT2 * y1;
  const normFactor = s * s + t * t;
  const [A2, B2, C2] = normalizeLine(X2, Y2, normFactor * R2);

  return {
    s, t, R2, A1, B1, C1, A2, B2, C2, x1, y1,
    x2: X2 / normFactor,
    y2: Y2 / normFactor,
  };
}
