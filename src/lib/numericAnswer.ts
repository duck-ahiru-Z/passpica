/** Check a numeric answer against the precision shown to the learner. */
export function isNumericAnswerCorrect(input: string, expected: number, decimalPlaces: number): boolean {
  if (input.trim() === '') return false;
  const value = Number(input);
  if (!Number.isFinite(value) || !Number.isFinite(expected) || !Number.isInteger(decimalPlaces) || decimalPlaces < 0) return false;

  const tolerance = 0.5 * 10 ** -decimalPlaces;
  const floatingPointAllowance = Number.EPSILON * Math.max(1, Math.abs(value), Math.abs(expected)) * 2;
  return Math.abs(value - expected) <= tolerance + floatingPointAllowance;
}
