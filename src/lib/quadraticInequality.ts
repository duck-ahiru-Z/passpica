export type QuadraticInequalitySign = '<' | '>' | '\\le' | '\\ge';
export type QuadraticInequalityAnswerType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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
