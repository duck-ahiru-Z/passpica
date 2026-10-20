import { BalancedRandom } from './balancedRandom.ts';
import { getQuadraticInequalityAnswerType, type QuadraticInequalityAnswerType, type QuadraticInequalitySign } from './quadraticInequality.ts';

export type QuadraticInequalityPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type QuadraticInequalityRoot = { num: number; den: number };
export type QuadraticInequalityProblem = {
  pattern: QuadraticInequalityPattern;
  a: number;
  b: number;
  c: number;
  ineqSign: QuadraticInequalitySign;
  roots: QuadraticInequalityRoot[];
  ansType: QuadraticInequalityAnswerType;
  eq: string;
};

const mixedPatternPicker = new BalancedRandom<QuadraticInequalityPattern>(['pattern1', 'pattern2', 'pattern3', 'pattern4']);

function simplifyFraction(numerator: number, denominator: number): QuadraticInequalityRoot {
  let a = Math.abs(numerator);
  let b = Math.abs(denominator);
  while (b) [a, b] = [b, a % b];
  const divisor = a || 1;
  const sign = denominator < 0 ? -1 : 1;
  return { num: sign * numerator / divisor, den: Math.abs(denominator) / divisor };
}

export function generateQuadraticInequalityProblem(
  selectedPattern: QuadraticInequalityPattern | 'mix',
  random: () => number = Math.random,
): QuadraticInequalityProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;
  const signs: QuadraticInequalitySign[] = ['<', '>', '\\le', '\\ge'];

  while (true) {
    const sign = signs[Math.floor(random() * signs.length)];
    let a: number;
    let b: number;
    let c: number;
    let roots: QuadraticInequalityRoot[];

    if (pattern === 'pattern4') {
      const root = Math.floor(random() * 19) - 9;
      const leadingSign = random() < 0.5 ? 1 : -1;
      a = leadingSign;
      b = -2 * leadingSign * root;
      c = leadingSign * root * root;
      roots = [simplifyFraction(root, 1)];
      if (b === 0 || c === 0) continue;
    } else {
      let p: number;
      let q: number;
      let r: number;
      let s: number;
      if (pattern === 'pattern1') {
        p = 1;
        r = 1;
        q = Math.floor(random() * 11) - 5;
        s = Math.floor(random() * 11) - 5;
      } else if (pattern === 'pattern2') {
        p = -1;
        r = 1;
        q = Math.floor(random() * 11) - 5;
        s = Math.floor(random() * 11) - 5;
      } else {
        p = Math.floor(random() * 5) + 1;
        r = Math.floor(random() * 5) + 1;
        if (p === 1 && r === 1) r = 2;
        q = Math.floor(random() * 11) - 5;
        s = Math.floor(random() * 11) - 5;
      }
      if (q === 0 || s === 0) continue;

      const root1 = simplifyFraction(-q, p);
      const root2 = simplifyFraction(-s, r);
      const value1 = root1.num / root1.den;
      const value2 = root2.num / root2.den;
      if (value1 === value2) continue;
      if (pattern === 'pattern3' && (root1.den === 1 || root2.den === 1)) continue;

      roots = value1 < value2 ? [root1, root2] : [root2, root1];
      a = p * r;
      b = p * s + q * r;
      c = q * s;
    }

    const discriminant = b * b - 4 * a * c;
    const ansType = getQuadraticInequalityAnswerType(a, discriminant, sign);
    let equation = a === 1 ? 'x^2' : a === -1 ? '-x^2' : `${a}x^2`;
    if (b > 0) equation += ` + ${b === 1 ? '' : b}x`;
    else if (b < 0) equation += ` - ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
    if (c > 0) equation += ` + ${c}`;
    else if (c < 0) equation += ` - ${Math.abs(c)}`;
    equation += ` ${sign} 0`;

    return { pattern, a, b, c, ineqSign: sign, roots, ansType, eq: equation };
  }
}
