export interface TrigSumParameters {
  p: number;
  q: number;
}

export function generateTrigSumParameters(random = Math.random): TrigSumParameters {
  const q = Math.floor(random() * 4) + 2;
  const maxP = Math.floor(q * Math.SQRT2);
  const candidates = Array.from({ length: maxP * 2 + 1 }, (_, index) => index - maxP)
    .filter(value => value !== 0 && Math.abs(value) !== q);
  const p = candidates[Math.floor(random() * candidates.length)];
  return { p, q };
}
