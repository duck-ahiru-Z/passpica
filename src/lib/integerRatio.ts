/** Compare two positive integer ratios without overflowing Number arithmetic. */
export function arePositiveIntegerRatiosEquivalent(
  numerator: number,
  denominator: number,
  expectedNumerator: number,
  expectedDenominator: number,
): boolean {
  if (numerator <= 0 || denominator <= 0 || expectedNumerator <= 0 || expectedDenominator <= 0) return false;
  return BigInt(numerator) * BigInt(expectedDenominator)
    === BigInt(denominator) * BigInt(expectedNumerator);
}
