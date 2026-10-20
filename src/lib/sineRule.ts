import { BalancedRandom } from './balancedRandom.ts';

export type SineRulePattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type SineRuleMode = SineRulePattern | 'mix';

export interface TermVal {
  num: number;
  root: number;
  den: number;
}

export interface SineRuleProblem {
  pattern: SineRulePattern;
  A: number;
  B: number;
  C: number;
  R: number;
  a: TermVal;
  b: TermVal;
  c: TermVal;
  ratioStr?: string;
  ansTerm?: TermVal;
  ansAngle?: number;
}

export function getSinVal(angle: number): TermVal {
  if (angle === 30 || angle === 150) return { num: 1, root: 1, den: 2 };
  if (angle === 45 || angle === 135) return { num: 1, root: 2, den: 2 };
  if (angle === 60 || angle === 120) return { num: 1, root: 3, den: 2 };
  if (angle === 90) return { num: 1, root: 1, den: 1 };
  throw new RangeError(`Unsupported special angle: ${angle}`);
}

function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) [x, y] = [y, x % y];
  return x;
}

function simplifyTerm(num: number, root: number, den: number): TermVal {
  const divisor = gcd(num, den);
  return { num: num / divisor, root, den: den / divisor };
}

function uniquePermutations(values: number[]): number[][] {
  const output: number[][] = [];
  const visit = (remaining: number[], current: number[]) => {
    if (remaining.length === 0) {
      output.push(current);
      return;
    }
    const used = new Set<number>();
    remaining.forEach((value, index) => {
      if (used.has(value)) return;
      used.add(value);
      visit([...remaining.slice(0, index), ...remaining.slice(index + 1)], [...current, value]);
    });
  };
  visit(values, []);
  return output;
}

const validTriangleAngles = [
  ...uniquePermutations([30, 60, 90]),
  ...uniquePermutations([45, 45, 90]),
  ...uniquePermutations([30, 30, 120]),
  [60, 60, 60],
];
const pattern3Angles = validTriangleAngles.filter(([, angleB]) => angleB < 90);
const mixedPatternPicker = new BalancedRandom<SineRulePattern>([
  'pattern1', 'pattern2', 'pattern3', 'pattern4',
]);

function formatRatioPart(value: TermVal): string {
  const coefficient = value.num * 2 / value.den;
  if (value.root === 1) return String(coefficient);
  return `${coefficient === 1 ? '' : coefficient}\\sqrt{${value.root}}`;
}

export function generateSineRuleProblem(selectedPattern: SineRuleMode, random = Math.random): SineRuleProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;

  if (pattern === 'pattern4') {
    const sets = [[30, 60, 90], [45, 45, 90], [30, 30, 120]];
    const angles = [...sets[Math.floor(random() * sets.length)]];
    for (let index = angles.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [angles[index], angles[swapIndex]] = [angles[swapIndex], angles[index]];
    }
    const [A, B, C] = angles;
    return {
      pattern, A, B, C, R: 1,
      a: { num: 1, root: 1, den: 1 },
      b: { num: 1, root: 1, den: 1 },
      c: { num: 1, root: 1, den: 1 },
      ratioStr: [A, B, C].map(angle => formatRatioPart(getSinVal(angle))).join(' : '),
      ansAngle: Math.max(...angles),
    };
  }

  const choices = pattern === 'pattern3' ? pattern3Angles : validTriangleAngles;
  const [A, B, C] = choices[Math.floor(random() * choices.length)];
  const R = Math.floor(random() * 5) + 2;
  const a = simplifyTerm(2 * R * getSinVal(A).num, getSinVal(A).root, getSinVal(A).den);
  const b = simplifyTerm(2 * R * getSinVal(B).num, getSinVal(B).root, getSinVal(B).den);
  const c = simplifyTerm(2 * R * getSinVal(C).num, getSinVal(C).root, getSinVal(C).den);

  return {
    pattern, A, B, C, R, a, b, c,
    ansTerm: pattern === 'pattern1' ? { num: R, root: 1, den: 1 } : b,
    ansAngle: B,
  };
}
