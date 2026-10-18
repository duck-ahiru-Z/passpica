import { BalancedRandom } from './balancedRandom.ts';

export const completingSquarePatterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'] as const;
export type CompletingSquarePattern = (typeof completingSquarePatterns)[number];
export type CompletingSquareMode = CompletingSquarePattern | 'mix';

interface Rational {
  num: number;
  den: number;
}

export interface CompletingSquareProblem {
  pattern: CompletingSquarePattern;
  a: number;
  b: number;
  c: number;
  P: Rational;
  Q: Rational;
  eq: string;
}

export interface CompletingSquareAnswer {
  a: string;
  pSign: '+' | '-';
  pNum: string;
  pDen: string;
  qSign: '+' | '-';
  qNum: string;
  qDen: string;
}

const mixedPatternPicker = new BalancedRandom<CompletingSquarePattern>(completingSquarePatterns);

function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
}

function simplifyFraction(n: number, d: number): Rational {
  const divisor = gcd(n, d);
  let num = n / divisor;
  let den = d / divisor;
  if (den < 0) {
    num *= -1;
    den *= -1;
  }
  return { num, den };
}

export function generateCompletingSquareProblem(selectedPattern: CompletingSquareMode): CompletingSquareProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next() : selectedPattern;
  let a: number;
  let b: number;
  let c: number;

  while (true) {
    a = 1;
    b = 0;
    c = 0;
    if (pattern === 'pattern1') {
      b = (Math.floor(Math.random() * 9) + 1) * 2;
      if (Math.random() < 0.5) b = -b;
      c = Math.floor(Math.random() * 19) - 9;
    } else if (pattern === 'pattern2') {
      a = Math.floor(Math.random() * 9) - 4;
      if (a === 0 || a === 1) continue;
      const integerVertexOffset = Math.floor(Math.random() * 9) - 4;
      if (integerVertexOffset === 0) continue;
      b = -2 * a * integerVertexOffset;
      c = Math.floor(Math.random() * 19) - 9;
    } else if (pattern === 'pattern3') {
      b = Math.floor(Math.random() * 9) * 2 + 1;
      if (Math.random() < 0.5) b = -b;
      c = Math.floor(Math.random() * 19) - 9;
    } else {
      a = Math.floor(Math.random() * 9) - 4;
      if (a === 0 || a === 1) continue;
      b = Math.floor(Math.random() * 19) - 9;
      if (b === 0 || b % (2 * a) === 0) continue;
      c = Math.floor(Math.random() * 19) - 9;
    }
    break;
  }

  const P = simplifyFraction(b, 2 * a);
  const Q = simplifyFraction(4 * a * c - b * b, 4 * a);

  let eq = 'y = ';
  if (a === 1) eq += 'x^2';
  else if (a === -1) eq += '-x^2';
  else eq += `${a}x^2`;
  if (b > 0) eq += ` + ${b === 1 ? '' : b}x`;
  else if (b < 0) eq += ` - ${Math.abs(b) === 1 ? '' : Math.abs(b)}x`;
  if (c > 0) eq += ` + ${c}`;
  else if (c < 0) eq += ` - ${Math.abs(c)}`;

  return { pattern, a, b, c, P, Q, eq };
}

function parseInteger(value: string, options: { blankValue?: number; allowNegative?: boolean } = {}): number | null {
  const trimmed = value.trim();
  if (trimmed === '' && options.blankValue !== undefined) return options.blankValue;
  const expression = options.allowNegative ? /^[+-]?\d+$/ : /^\d+$/;
  if (!expression.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function isCompletingSquareAnswerCorrect(problem: CompletingSquareProblem, answer: CompletingSquareAnswer): boolean {
  const a = answer.a.trim() === '-' ? -1 : parseInteger(answer.a, { blankValue: 1, allowNegative: true });
  const pNum = parseInteger(answer.pNum, { blankValue: 0 });
  const pDen = parseInteger(answer.pDen, { blankValue: 1 });
  const qNum = parseInteger(answer.qNum, { blankValue: 0 });
  const qDen = parseInteger(answer.qDen, { blankValue: 1 });

  if (a === null || pNum === null || pDen === null || pDen === 0 || qNum === null || qDen === null || qDen === 0) return false;

  const P = simplifyFraction((answer.pSign === '+' ? 1 : -1) * pNum, pDen);
  const Q = simplifyFraction((answer.qSign === '+' ? 1 : -1) * qNum, qDen);
  return a === problem.a
    && P.num === problem.P.num && P.den === problem.P.den
    && Q.num === problem.Q.num && Q.den === problem.Q.den;
}
