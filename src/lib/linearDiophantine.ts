import { BalancedRandom } from './balancedRandom.ts';

export type LinearDiophantinePattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type LinearDiophantineMode = LinearDiophantinePattern | 'mix';

export interface LinearDiophantineProblem {
  pattern: LinearDiophantinePattern;
  A: number;
  B: number;
  C: number;
  x0: number;
  y0: number;
}

export function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) [x, y] = [y, x % y];
  return x;
}

export function extGCD(a: number, b: number): { g: number; x: number; y: number } {
  let x0 = 1;
  let y0 = 0;
  let x1 = 0;
  let y1 = 1;
  let r0 = a;
  let r1 = b;
  while (r1 !== 0) {
    const quotient = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 % r1];
    [x0, x1] = [x1, x0 - quotient * x1];
    [y0, y1] = [y1, y0 - quotient * y1];
  }
  return { g: r0, x: x0, y: y0 };
}

const mixedPatternPicker = new BalancedRandom<LinearDiophantinePattern>([
  'pattern1', 'pattern2', 'pattern3', 'pattern4',
]);

export function generateLinearDiophantineProblem(
  selectedPattern: LinearDiophantineMode,
  random = Math.random,
): LinearDiophantineProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;

  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    let A = 0;
    let B = 0;
    let C = 1;
    if (pattern === 'pattern1') {
      A = Math.floor(random() * 8) + 2;
      B = Math.floor(random() * 8) + 2;
    } else if (pattern === 'pattern2') {
      A = Math.floor(random() * 89) + 11;
      B = Math.floor(random() * 89) + 11;
    } else if (pattern === 'pattern3') {
      A = Math.floor(random() * 20) + 5;
      B = Math.floor(random() * 20) + 5;
      C = Math.floor(random() * 5) + 2;
    } else {
      A = Math.floor(random() * 20) + 5;
      B = -(Math.floor(random() * 20) + 5);
    }

    if (gcd(A, B) !== 1) continue;
    let { x, y } = extGCD(Math.abs(A), Math.abs(B));
    if (A < 0) x = -x;
    if (B < 0) y = -y;
    x *= C;
    y *= C;
    return { pattern, A, B, C, x0: x, y0: y };
  }

  throw new Error(`Unable to generate a coprime coefficient pair for ${pattern}`);
}
