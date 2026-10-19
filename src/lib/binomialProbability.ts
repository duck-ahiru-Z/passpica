import { BalancedRandom } from './balancedRandom.ts';

export type BinomialPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type BinomialMode = BinomialPattern | 'mix';

export interface BinomialProblem {
  pattern: BinomialPattern;
  n: number;
  r: number;
  p_num: number;
  p_den: number;
  ans_num: number;
  ans_den: number;
  req_wins?: number;
  event_label?: string;
}

export function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x;
}

export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let result = 1;
  for (let index = 1; index <= r; index += 1) {
    result = result * (n - index + 1) / index;
  }
  return result;
}

export function atLeastOneSuccessProbability(pNumerator: number, pDenominator: number, trials: number): number {
  return 1 - ((pDenominator - pNumerator) / pDenominator) ** trials;
}

const mixedPatternPicker = new BalancedRandom<BinomialPattern>([
  'pattern1', 'pattern2', 'pattern3', 'pattern4',
]);

const diceEvents = [
  { p_num: 1, p_den: 6, event_label: '「1の目」' },
  { p_num: 1, p_den: 3, event_label: '「3の倍数の目」' },
  { p_num: 2, p_den: 3, event_label: '「4以下の目」' },
  { p_num: 1, p_den: 2, event_label: '「偶数の目」' },
];
const lotteryProbabilities = [{ p_num: 1, p_den: 6 }, { p_num: 1, p_den: 3 }, { p_num: 1, p_den: 4 }];

export function generateBinomialProblem(selectedPattern: BinomialMode, random = Math.random): BinomialProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;

  if (pattern === 'pattern1') {
    const n = Math.floor(random() * 4) + 3;
    const r = Math.floor(random() * (n - 1)) + 1;
    const p_num = 1;
    const p_den = 2;
    const divisor = gcd(nCr(n, r), 2 ** n);
    return { pattern, n, r, p_num, p_den, ans_num: nCr(n, r) / divisor, ans_den: 2 ** n / divisor };
  }

  if (pattern === 'pattern2') {
    const event = diceEvents[Math.floor(random() * diceEvents.length)];
    const n = Math.floor(random() * 3) + 3;
    const r = Math.floor(random() * (n - 1)) + 1;
    const numerator = nCr(n, r) * event.p_num ** r * (event.p_den - event.p_num) ** (n - r);
    const denominator = event.p_den ** n;
    const divisor = gcd(numerator, denominator);
    return {
      pattern, n, r, ...event,
      ans_num: numerator / divisor,
      ans_den: denominator / divisor,
    };
  }

  if (pattern === 'pattern3') {
    const probability = lotteryProbabilities[Math.floor(random() * lotteryProbabilities.length)];
    const n = Math.floor(random() * 3) + 3;
    const numerator = probability.p_den ** n - (probability.p_den - probability.p_num) ** n;
    const denominator = probability.p_den ** n;
    const divisor = gcd(numerator, denominator);
    return {
      pattern, n, r: 0, ...probability,
      ans_num: numerator / divisor,
      ans_den: denominator / divisor,
    };
  }

  const req_wins = Math.floor(random() * 2) + 3;
  let n = Math.floor(random() * req_wins) + req_wins;
  if (n === req_wins) n += 1;
  const r = req_wins;
  const p_num = 1;
  const p_den = 2;
  const numerator = nCr(n - 1, r - 1);
  const denominator = 2 ** n;
  const divisor = gcd(numerator, denominator);
  return {
    pattern, n, r, p_num, p_den, req_wins,
    ans_num: numerator / divisor,
    ans_den: denominator / divisor,
  };
}
