import { BalancedRandom } from './balancedRandom.ts';

export const quadraticEquationPatterns = ['factorization', 'square-root', 'completing-square', 'quadratic-formula'] as const;
export type QuadraticEquationPattern = (typeof quadraticEquationPatterns)[number];
export type QuadraticEquationMode = QuadraticEquationPattern | 'mix';

export const quadraticEquationLabels: Record<QuadraticEquationPattern, string> = {
  factorization: '因数分解',
  'square-root': '平方根を利用',
  'completing-square': '平方完成',
  'quadratic-formula': '解の公式',
};

export type QuadraticEquationProblem = {
  pattern: QuadraticEquationPattern;
  expression: string;
  roots: [number, number];
  coefficients: [number, number, number];
  explanation: string;
};

const integer = (random: () => number, min: number, max: number) =>
  min + Math.floor(Math.max(0, Math.min(0.999999999, random())) * (max - min + 1));

const signedTerm = (coefficient: number, variable: string) => coefficient === 0
  ? ''
  : `${coefficient < 0 ? ' - ' : ' + '}${Math.abs(coefficient) === 1 ? variable : `${Math.abs(coefficient)}${variable}`}`;

const polynomial = (a: number, b: number, c: number) =>
  `${a === 1 ? '' : a === -1 ? '-' : a}x^2${signedTerm(b, 'x')}${c === 0 ? '' : c < 0 ? ` - ${Math.abs(c)}` : ` + ${c}`} = 0`;

const nonSquareRadicands = [2, 3, 5, 6, 7];

const formulaCandidates = (() => {
  const candidates: Array<{ a: number; b: number; c: number; discriminant: number }> = [];
  for (let a = 2; a <= 5; a += 1) {
    for (let b = -7; b <= 7; b += 1) {
      for (let c = -6; c <= 6; c += 1) {
        const discriminant = b * b - 4 * a * c;
        const root = Math.sqrt(discriminant);
        if (discriminant > 0 && !Number.isInteger(root)) candidates.push({ a, b, c, discriminant });
      }
    }
  }
  return candidates;
})();

export function generateQuadraticEquationProblem(
  pattern: QuadraticEquationPattern,
  random: () => number = Math.random,
): QuadraticEquationProblem {
  if (pattern === 'factorization') {
    let first = integer(random, -5, 5);
    let second = integer(random, -5, 5);
    while (first === 0 || second === 0 || first === second) {
      first = integer(random, -5, 5);
      second = integer(random, -5, 5);
    }
    const roots: [number, number] = [Math.min(first, second), Math.max(first, second)];
    const expression = polynomial(1, -(first + second), first * second);
    return { pattern, expression, roots, coefficients: [1, -(first + second), first * second], explanation: `左辺を因数分解すると (x ${first < 0 ? '+' : '-'} ${Math.abs(first)})(x ${second < 0 ? '+' : '-'} ${Math.abs(second)})=0。解は x=${roots[0]}, ${roots[1]} です。` };
  }

  if (pattern === 'square-root') {
    const center = integer(random, -4, 4);
    const radicand = nonSquareRadicands[integer(random, 0, nonSquareRadicands.length - 1)];
    const first = center - Math.sqrt(radicand);
    const second = center + Math.sqrt(radicand);
    const shift = center === 0 ? 'x' : `(x ${center < 0 ? '+' : '-'} ${Math.abs(center)})`;
    const shiftedX = center === 0 ? 'x' : `x ${center < 0 ? '+' : '-'} ${Math.abs(center)}`;
    const expression = `${shift}^2 = ${radicand}`;
    return { pattern, expression, roots: [first, second], coefficients: [1, -2 * center, center * center - radicand], explanation: `平方根をとると ${shiftedX}=±√${radicand}。よって x≈${first.toFixed(3)}, ${second.toFixed(3)} です。` };
  }

  if (pattern === 'completing-square') {
    let p = integer(random, -4, 4);
    while (p === 0) p = integer(random, -4, 4);
    const radicand = nonSquareRadicands[integer(random, 0, nonSquareRadicands.length - 1)];
    const constant = p * p - radicand;
    const roots: [number, number] = [-p - Math.sqrt(radicand), -p + Math.sqrt(radicand)];
    const expression = polynomial(1, 2 * p, constant);
    const completedSquare = p === 0 ? 'x²' : `(x ${p < 0 ? '-' : '+'} ${Math.abs(p)})²`;
    return { pattern, expression, roots, coefficients: [1, 2 * p, constant], explanation: `${completedSquare}=${radicand} と平方完成します。解は x≈${roots[0].toFixed(3)}, ${roots[1].toFixed(3)} です。` };
  }

  const candidate = formulaCandidates[integer(random, 0, formulaCandidates.length - 1)];
  const { a, b, c, discriminant } = candidate;
  const roots: [number, number] = [(-b - Math.sqrt(discriminant)) / (2 * a), (-b + Math.sqrt(discriminant)) / (2 * a)];
  return {
    pattern,
    expression: polynomial(a, b, c),
    roots,
    coefficients: [a, b, c],
    explanation: `判別式 D=(${b})²−4·${a}·(${c})=${discriminant}>0。解の公式に代入し、x≈${roots[0].toFixed(3)}, ${roots[1].toFixed(3)} です。`,
  };
}

export function createQuadraticEquationScheduler() {
  return new BalancedRandom(quadraticEquationPatterns);
}

export function isQuadraticEquationAnswerCorrect(problem: QuadraticEquationProblem, firstInput: string, secondInput: string): boolean {
  if (!firstInput.trim() || !secondInput.trim()) return false;
  const first = Number(firstInput);
  const second = Number(secondInput);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return false;
  const [expectedFirst, expectedSecond] = problem.roots;
  const tolerance = 0.00051;
  return (Math.abs(first - expectedFirst) <= tolerance && Math.abs(second - expectedSecond) <= tolerance)
    || (Math.abs(first - expectedSecond) <= tolerance && Math.abs(second - expectedFirst) <= tolerance);
}
