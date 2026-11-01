import { BalancedRandom } from './balancedRandom.ts';

export type QuadraticMaxMinPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type QuadraticMaxMinMode = QuadraticMaxMinPattern | 'mix';

export interface QuadraticMaxMinProblem {
  pattern: QuadraticMaxMinPattern;
  eq: string;
  alpha: number;
  beta: number;
  a: number;
  p: number;
  q: number;
  maxV: number;
  maxX: number[];
  minV: number;
  minX: number[];
  isDownward: boolean;
}

const mixedPatternPicker = new BalancedRandom<QuadraticMaxMinPattern>([
  'pattern1', 'pattern2', 'pattern3', 'pattern4',
]);

export function generateQuadraticMaxMinProblem(
  selectedPattern: QuadraticMaxMinMode,
  random = Math.random,
): QuadraticMaxMinProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;
  const alpha = Math.floor(random() * 9) - 4;
  let length = Math.floor(random() * 4) + 2;
  let beta = alpha + length;
  let p = 0;
  const isDownward = pattern === 'pattern4';
  const a = isDownward ? -(Math.floor(random() * 3) + 1) : Math.floor(random() * 3) + 1;
  const locationPattern: 'pattern1' | 'pattern2' | 'pattern3' = pattern === 'pattern4'
    ? (['pattern1', 'pattern2', 'pattern3'] as const)[Math.floor(random() * 3)]
    : pattern;

  if (locationPattern === 'pattern1') {
    if (length === 2) {
      length += 1;
      beta += 1;
    }
    p = alpha + Math.floor(random() * (length - 1)) + 1;
    if (p - alpha === beta - p) {
      p += random() < 0.5 ? 1 : -1;
      if (p <= alpha || p >= beta) p = alpha + 1;
      if (p - alpha === beta - p) p = alpha + 1;
    }
  } else if (locationPattern === 'pattern2') {
    p = random() < 0.5
      ? alpha - Math.floor(random() * 3) - 1
      : beta + Math.floor(random() * 3) + 1;
  } else {
    if (length % 2 !== 0) {
      length += 1;
      beta += 1;
    }
    p = alpha + length / 2;
  }

  const q = Math.floor(random() * 9) - 4;
  const vertexTerm = p === 0 ? 'x' : `(x ${p > 0 ? '-' : '+'} ${Math.abs(p)})`;
  const constantTerm = q === 0 ? '' : ` ${q > 0 ? '+' : '-'} ${Math.abs(q)}`;
  const eq = `y = ${a === 1 ? '' : a === -1 ? '-' : a}${vertexTerm}^2${constantTerm}`;
  const f = (x: number) => a * (x - p) * (x - p) + q;
  const candidates = [alpha, beta];
  if (p >= alpha && p <= beta) candidates.push(p);
  const values = candidates.map(x => ({ x, y: f(x) }));
  const maxV = Math.max(...values.map(({ y }) => y));
  const minV = Math.min(...values.map(({ y }) => y));
  const maxX = values.filter(({ y }) => y === maxV).map(({ x }) => x).sort((x, y) => x - y);
  const minX = values.filter(({ y }) => y === minV).map(({ x }) => x).sort((x, y) => x - y);

  return { pattern, eq, alpha, beta, a, p, q, maxV, maxX, minV, minX, isDownward };
}

export function isQuadraticExtremumAnswerCorrect(
  valueInput: string,
  firstXInput: string,
  secondXInput: string,
  expectedValue: number,
  expectedXValues: readonly number[],
): boolean {
  const parseInteger = (input: string): number | null => {
    const value = input.trim();
    if (!/^[+-]?\d+$/.test(value)) return null;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  };

  const value = parseInteger(valueInput);
  const firstX = parseInteger(firstXInput);
  const secondX = parseInteger(secondXInput);
  if (value === null || firstX === null || (secondXInput.trim() !== '' && secondX === null)) return false;
  const xValues = [firstX, ...(secondX === null ? [] : [secondX])].sort((left, right) => left - right);
  const expected = [...expectedXValues].sort((left, right) => left - right);

  return value === expectedValue
    && xValues.length === expected.length
    && xValues.every((item, index) => item === expected[index]);
}
