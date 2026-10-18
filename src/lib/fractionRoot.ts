export interface FractionRootValue {
  sign: '+' | '-';
  numCoeff: string;
  numRoot: string;
  den: string;
}

export const defaultFractionRoot: FractionRootValue = {
  sign: '+',
  numCoeff: '',
  numRoot: '',
  den: '',
};

function parseIntegerField(value: string, blankValue: number): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return blankValue;
  if (!/^[+-]?\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function checkFractionRoot(
  val: FractionRootValue,
  expectedSign: 1 | -1,
  expectedNumCoeff: number,
  expectedNumRoot: number,
  expectedDen: number,
): boolean {
  if (val.sign !== '+' && val.sign !== '-') return false;

  let sign: 1 | -1 = val.sign === '+' ? 1 : -1;
  let numCoeff = parseIntegerField(val.numCoeff, 1);
  let numRoot = parseIntegerField(val.numRoot, 1);
  let den = parseIntegerField(val.den, 1);
  if (numCoeff === null || numRoot === null || den === null) return false;

  if (numCoeff === -1) {
    sign = sign === 1 ? -1 : 1;
    numCoeff = 1;
  } else if (numCoeff < 0) {
    return false;
  }

  if (numRoot === 0) {
    numCoeff = 0;
    numRoot = 1;
  } else if (numRoot < 0) {
    return false;
  }

  if (den === 0) return false;
  if (den < 0) {
    sign = sign === 1 ? -1 : 1;
    den = -den;
  }

  if (numCoeff === 0) return expectedNumCoeff === 0;
  return sign === expectedSign
    && numCoeff === expectedNumCoeff
    && numRoot === expectedNumRoot
    && den === expectedDen;
}
