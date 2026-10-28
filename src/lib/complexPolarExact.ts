function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

const nonFirstQuadrantSigns = [
  [-1, 1],
  [-1, -1],
  [1, -1],
] as const;

/** Pick quadrants II, III, and IV uniformly for fixed-pattern practice. */
export function getUniformNonFirstQuadrantSigns(random = Math.random) {
  const index = Math.min(nonFirstQuadrantSigns.length - 1, Math.floor(random() * nonFirstQuadrantSigns.length));
  return nonFirstQuadrantSigns[index];
}

/** Familiar angles available to the product/quotient drill. */
export const polarAngleChoices = [
  { val: Math.PI / 6, s: "\\frac{\\pi}{6}" },
  { val: Math.PI / 4, s: "\\frac{\\pi}{4}" },
  { val: Math.PI / 3, s: "\\frac{\\pi}{3}" },
  { val: Math.PI / 2, s: "\\frac{\\pi}{2}" },
  { val: 2 * Math.PI / 3, s: "\\frac{2\\pi}{3}" },
  { val: 3 * Math.PI / 4, s: "\\frac{3\\pi}{4}" },
  { val: 5 * Math.PI / 6, s: "\\frac{5\\pi}{6}" },
] as const;

export const supportedPolarAngleLabels = [
  { val: 0, label: '0' },
  { val: Math.PI / 6, label: 'pi/6' },
  { val: Math.PI / 4, label: 'pi/4' },
  { val: Math.PI / 3, label: 'pi/3' },
  { val: Math.PI / 2, label: 'pi/2' },
  { val: 2 * Math.PI / 3, label: '2pi/3' },
  { val: 3 * Math.PI / 4, label: '3pi/4' },
  { val: 5 * Math.PI / 6, label: '5pi/6' },
  { val: Math.PI, label: 'pi' },
  { val: 7 * Math.PI / 6, label: '7pi/6' },
  { val: 5 * Math.PI / 4, label: '5pi/4' },
  { val: 4 * Math.PI / 3, label: '4pi/3' },
  { val: 3 * Math.PI / 2, label: '3pi/2' },
  { val: 5 * Math.PI / 3, label: '5pi/3' },
  { val: 7 * Math.PI / 4, label: '7pi/4' },
  { val: 11 * Math.PI / 6, label: '11pi/6' },
  { val: 2 * Math.PI, label: '2pi' },
] as const;

export function formatPolarAngle(angle: number): string {
  const match = supportedPolarAngleLabels.find(({ val }) => Math.abs(angle - val) < 0.01);
  if (!match) throw new RangeError(`Unsupported polar angle: ${angle}`);
  return match.label;
}

export function getSupportedPolarAnglePairs(operation: 'sum' | 'difference') {
  return polarAngleChoices.flatMap(first => polarAngleChoices
    .filter(second => {
      const raw = operation === 'sum' ? first.val + second.val : first.val - second.val;
      const result = ((raw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      try {
        formatPolarAngle(result);
        formatExactTrigComponent(12, Math.cos(result));
        formatExactTrigComponent(12, Math.sin(result));
        return true;
      } catch {
        return false;
      }
    })
    .map(second => [first, second] as const));
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

/** Accept common equivalent exact forms for a single rational/radical component. */
export function isExactComponentAnswerCorrect(input: string, expected: string): boolean {
  const parse = (source: string): number | null => {
    let normalized = source.trim().replace(/\s+/g, '');
    if (!normalized) return null;
    normalized = normalized
      .replace(/\\sqrt\{(\d+)\}/g, 'sqrt($1)')
      .replace(/√\s*(\d+)/g, 'sqrt($1)');
    for (let pass = 0; pass < 3; pass += 1) {
      normalized = normalized.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
    }
    normalized = normalized.replace(/\\/g, '');
    const match = normalized.match(/^([+-]?)(?:(\d+(?:\.\d*)?|\.\d+)?(?:sqrt\((\d+)\))?)(?:\/(\d+(?:\.\d*)?|\.\d+))?$/);
    if (!match || (!match[2] && !match[3])) return null;
    const coefficient = match[2] ? Number(match[2]) : 1;
    const radicand = match[3] ? Number(match[3]) : 1;
    const denominator = match[4] ? Number(match[4]) : 1;
    if (!Number.isFinite(coefficient) || !Number.isFinite(radicand) || !Number.isFinite(denominator)
      || radicand <= 0 || denominator <= 0) return null;
    return (match[1] === '-' ? -1 : 1) * coefficient * Math.sqrt(radicand) / denominator;
  };

  const actualValue = parse(input);
  const expectedValue = parse(expected);
  return actualValue !== null && expectedValue !== null
    && Math.abs(actualValue - expectedValue) <= 1e-10 * Math.max(1, Math.abs(expectedValue));
}

/** Accept exact π fractions and decimal radians for a principal polar angle. */
export function isPolarAngleAnswerCorrect(input: string, expected: string): boolean {
  const parse = (source: string): number | null => {
    let normalized = source.trim().toLowerCase().replace(/\s+/g, '').replace(/π/g, 'pi');
    if (!normalized) return null;
    normalized = normalized.replace(/\\left|\\right/g, '');
    for (let pass = 0; pass < 3; pass += 1) {
      normalized = normalized.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2');
    }
    normalized = normalized.replace(/\\pi/g, 'pi').replace(/[\\{}$]/g, '').replace(/\*/g, '');

    const decimalMatch = normalized.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/);
    if (decimalMatch) {
      const value = Number(decimalMatch[1]);
      return Number.isFinite(value) ? value : null;
    }

    const piMatch = normalized.match(/^([+-]?)(?:(\d+(?:\.\d*)?|\.\d+))?pi(?:\/(\d+(?:\.\d*)?|\.\d+))?$/);
    if (!piMatch) return null;
    const coefficient = piMatch[2] ? Number(piMatch[2]) : 1;
    const denominator = piMatch[3] ? Number(piMatch[3]) : 1;
    if (!Number.isFinite(coefficient) || !Number.isFinite(denominator) || denominator <= 0) return null;
    return (piMatch[1] === '-' ? -1 : 1) * coefficient * Math.PI / denominator;
  };

  const actualValue = parse(input);
  const expectedValue = parse(expected);
  if (actualValue === null || expectedValue === null) return false;
  const tolerance = 1e-10;
  if (Math.abs(actualValue - expectedValue) <= tolerance) return true;
  const fullTurn = 2 * Math.PI;
  return (Math.abs(actualValue) <= tolerance && Math.abs(expectedValue - fullTurn) <= tolerance)
    || (Math.abs(expectedValue) <= tolerance && Math.abs(actualValue - fullTurn) <= tolerance);
}
