export type Rational = { numerator: number; denominator: number };

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

function normalize(numeratorText: string, denominatorText: string): Rational | null {
  if (!/^[+-]?\d+$/.test(numeratorText) || !/^[+-]?\d+$/.test(denominatorText)) return null;
  const numerator = Number(numeratorText);
  const denominator = Number(denominatorText);
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator) || denominator === 0) return null;

  const divisor = gcd(numerator, denominator);
  const sign = denominator < 0 ? -1 : 1;
  return { numerator: sign * numerator / divisor, denominator: Math.abs(denominator) / divisor };
}

export function parseRationalParts(numerator: string, denominator: string): Rational | null {
  return normalize(numerator.trim(), denominator.trim() === '' ? '1' : denominator.trim());
}

export function parseRationalAnswer(value: string): Rational | null {
  const compact = value.replace(/\s+/g, '');
  const match = /^([+-]?\d+)(?:\/([+-]?\d+))?$/.exec(compact);
  if (!match) return null;
  return normalize(match[1], match[2] ?? '1');
}

export function rationalEquals(left: Rational | null, right: Rational): boolean {
  return left !== null && left.numerator === right.numerator && left.denominator === right.denominator;
}
