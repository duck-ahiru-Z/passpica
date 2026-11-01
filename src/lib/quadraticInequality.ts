export type QuadraticInequalitySign = '<' | '>' | '\\le' | '\\ge';
export type QuadraticInequalityAnswerType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function getQuadraticInequalityRootLabelBaselines(
  labels: Array<{ x: number; width: number }>,
  baseY: number,
  verticalGap = 14,
  horizontalPadding = 6,
): number[] {
  const baselines = labels.map(() => baseY);
  if (labels.length < 2) return baselines;

  const ordered = labels.map((label, index) => ({ ...label, index })).sort((left, right) => left.x - right.x);
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    const minimumDistance = (previous.width + current.width) / 2 + horizontalPadding;
    if (current.x - previous.x < minimumDistance) baselines[current.index] = baselines[previous.index] + verticalGap;
  }
  return baselines;
}

export function reverseQuadraticInequalitySign(sign: QuadraticInequalitySign): QuadraticInequalitySign {
  switch (sign) {
    case '<': return '>';
    case '>': return '<';
    case '\\le': return '\\ge';
    case '\\ge': return '\\le';
  }
}

export function getQuadraticInequalityRegion(sign: QuadraticInequalitySign): { boundary: string; side: '下' | '上' } {
  switch (sign) {
    case '<': return { boundary: '0未満', side: '下' };
    case '\\le': return { boundary: '0以下', side: '下' };
    case '>': return { boundary: '0より大きい（0超）', side: '上' };
    case '\\ge': return { boundary: '0以上', side: '上' };
  }
}

export function parseQuadraticInequalityFraction(numerator: string, denominator = ''): { num: number; den: number } | null {
  const isInteger = (value: string) => /^[+-]?\d+$/.test(value.trim());
  if (!isInteger(numerator) || (denominator.trim() !== '' && !isInteger(denominator))) return null;

  const num = Number(numerator);
  let den = denominator.trim() === '' ? 1 : Number(denominator);
  if (!Number.isSafeInteger(num) || !Number.isSafeInteger(den) || den === 0) return null;
  if (den < 0) den = -den;
  const signedNum = Number(denominator.trim() !== '' && Number(denominator) < 0 ? -num : num);

  let a = Math.abs(signedNum);
  let b = den;
  while (b !== 0) [a, b] = [b, a % b];
  const divisor = a || 1;
  return { num: signedNum / divisor, den: den / divisor };
}

export function getQuadraticInequalityAnswerType(a: number, discriminant: number, sign: QuadraticInequalitySign): QuadraticInequalityAnswerType {
  if (discriminant > 0) {
    if (a > 0) {
      if (sign === '<') return 1;
      if (sign === '\\le') return 3;
      if (sign === '>') return 2;
      return 4;
    }
    if (sign === '<') return 2;
    if (sign === '\\le') return 4;
    if (sign === '>') return 1;
    return 3;
  }
  if (discriminant === 0) {
    if (a > 0) {
      if (sign === '<') return 8;
      if (sign === '\\le') return 5;
      if (sign === '>') return 6;
      return 7;
    }
    if (sign === '<') return 6;
    if (sign === '\\le') return 7;
    if (sign === '>') return 8;
    return 5;
  }
  // With no real roots, the quadratic keeps the sign of its leading term.
  if (a > 0) return sign === '>' || sign === '\\ge' ? 7 : 8;
  return sign === '<' || sign === '\\le' ? 7 : 8;
}
