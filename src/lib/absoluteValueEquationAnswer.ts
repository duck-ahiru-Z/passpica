export type RationalRoot = { num: number; den: number };

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

/** Parse an integer or fraction answer without accepting partial numeric strings or zero denominators. */
export function parseRationalRoot(numeratorText: string, denominatorText: string): RationalRoot | null {
  const numeratorValue = numeratorText.trim();
  const denominatorValue = denominatorText.trim();
  if (!/^[+-]?\d+$/.test(numeratorValue)) return null;
  if (denominatorValue !== '' && !/^[+-]?\d+$/.test(denominatorValue)) return null;

  let num = Number(numeratorValue);
  let den = denominatorValue === '' ? 1 : Number(denominatorValue);
  if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den) || den === 0) return null;

  const divisor = gcd(num, den);
  num /= divisor;
  den /= divisor;
  if (den < 0) {
    num *= -1;
    den *= -1;
  }
  return { num, den };
}
