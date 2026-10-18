function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

/** Format r·cos(θ) or r·sin(θ) for the exact special angles used in the drill. */
export function formatExactTrigComponent(radius: number, trigValue: number): string {
  const sign = trigValue < 0 ? '-' : '';
  const value = Math.abs(trigValue);
  let denominator = 1;
  let radical: 2 | 3 | undefined;

  if (Math.abs(value - 1) < 0.01) {
    // integer coefficient
  } else if (Math.abs(value - 0.5) < 0.01) {
    denominator = 2;
  } else if (Math.abs(value - Math.SQRT1_2) < 0.01) {
    denominator = 2;
    radical = 2;
  } else if (Math.abs(value - Math.sqrt(3) / 2) < 0.01) {
    denominator = 2;
    radical = 3;
  } else if (value < 0.01) {
    return '0';
  } else {
    throw new RangeError(`Unsupported trigonometric value: ${trigValue}`);
  }

  const numerator = Math.round(radius);
  if (Math.abs(radius - numerator) > 1e-9) {
    throw new RangeError(`Expected an integer radius, received: ${radius}`);
  }
  const divisor = gcd(numerator, denominator);
  const coefficientNumerator = numerator / divisor;
  const coefficientDenominator = denominator / divisor;
  let coefficient = radical
    ? `${coefficientNumerator === 1 ? '' : coefficientNumerator}\\sqrt{${radical}}`
    : String(coefficientNumerator);
  if (coefficientDenominator > 1) coefficient += `/${coefficientDenominator}`;
  return `${sign}${coefficient}`;
}
