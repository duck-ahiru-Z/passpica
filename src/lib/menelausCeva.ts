export interface CevaMasses {
  mA: number;
  mB: number;
  mC: number;
  total: number;
}

/** Barycentric weights for cevians with BD:DC=a:b and CE:EA=c:d. */
export function getCevaMasses(a: number, b: number, c: number, d: number): CevaMasses {
  const mA = a * c;
  const mB = b * d;
  const mC = a * d;
  return { mA, mB, mC, total: mA + mB + mC };
}
