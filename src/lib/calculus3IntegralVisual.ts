function validateUpper(upper: number) {
  if (!Number.isFinite(upper) || upper < 0) throw new RangeError('upper must be a finite non-negative number');
}

export function squareAreaBetweenZeroAnd(upper: number): number {
  validateUpper(upper);
  return upper ** 3 / 3;
}

export function rightRectangleApproximation(upper: number, rectangleCount: number): number {
  validateUpper(upper);
  if (!Number.isInteger(rectangleCount) || rectangleCount <= 0) {
    throw new RangeError('rectangleCount must be a positive integer');
  }

  const width = upper / rectangleCount;
  let sum = 0;
  for (let index = 1; index <= rectangleCount; index += 1) {
    sum += (index * width) ** 2 * width;
  }
  return sum;
}
