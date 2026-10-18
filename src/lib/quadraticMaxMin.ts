export function isQuadraticExtremumAnswerCorrect(
  valueInput: string,
  firstXInput: string,
  secondXInput: string,
  expectedValue: number,
  expectedXValues: readonly number[],
): boolean {
  const parseInteger = (input: string): number | null => {
    const value = input.trim();
    if (value === '') return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  };

  const value = parseInteger(valueInput);
  const firstX = parseInteger(firstXInput);
  const secondX = parseInteger(secondXInput);
  if (value === null || firstX === null || (secondXInput.trim() !== '' && secondX === null)) return false;
  const xValues = [firstX, ...(secondX === null ? [] : [secondX])].sort((left, right) => left - right);
  const expected = [...expectedXValues].sort((left, right) => left - right);

  return value === expectedValue
    && xValues.length === expected.length
    && xValues.every((item, index) => item === expected[index]);
}
