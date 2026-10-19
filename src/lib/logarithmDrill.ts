import { BalancedRandom } from './balancedRandom.ts';

export type LogarithmPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type LogarithmMode = LogarithmPattern | 'mix';

export interface LogarithmProblem {
  pattern: LogarithmPattern;
  qStr: string;
  ansNum: number;
  ansDen: number;
  expLines: string[];
}

function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) [x, y] = [y, x % y];
  return x;
}

const primes = [2, 3, 5] as const;
const mixedPatternPicker = new BalancedRandom<LogarithmPattern>(['pattern1', 'pattern2', 'pattern3', 'pattern4']);

export function generateLogarithmProblem(selectedPattern: LogarithmMode, random = Math.random): LogarithmProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;

  if (pattern === 'pattern1') {
    const prime = primes[Math.floor(random() * primes.length)];
    const exponents = [[2, 3], [2, 4], [3, 2], [3, 4], [4, 2], [4, 3]] as const;
    const [a, b] = exponents[Math.floor(random() * exponents.length)];
    const divisor = gcd(a, b);
    const base = prime ** a;
    const argument = prime ** b;
    const answerNumerator = b / divisor;
    const answerDenominator = a / divisor;
    const expLines = [
      `\\log_{${base}} ${argument} = \\frac{\\log_{${prime}} ${argument}}{\\log_{${prime}} ${base}}`,
      `= \\frac{\\log_{${prime}} ${prime}^${b}}{\\log_{${prime}} ${prime}^${a}}`,
      `= \\frac{${b}}{${a}}`,
    ];
    if (divisor !== 1) expLines.push(`= \\frac{${answerNumerator}}{${answerDenominator}}`);
    return { pattern, qStr: `\\log_{${base}} ${argument}`, ansNum: answerNumerator, ansDen: answerDenominator, expLines };
  }

  if (pattern === 'pattern2') {
    const prime = primes[Math.floor(random() * primes.length)];
    const exponent = Math.floor(random() * 3) + 2;
    const primePower = prime ** exponent;
    const allowedBases = Array.from({ length: 6 }, (_, index) => index + 2).filter(value => value !== prime && value !== primePower);
    const intermediateBase = allowedBases[Math.floor(random() * allowedBases.length)];
    const qStr = `\\log_{${prime}} ${intermediateBase} \\cdot \\log_{${intermediateBase}} ${primePower}`;
    const expLines = [
      `\\text{底の変換公式より、底を } ${prime} \\text{ にそろえると：}`,
      `\\log_{${prime}} ${intermediateBase} \\cdot \\log_{${intermediateBase}} ${primePower} = \\log_{${prime}} ${intermediateBase} \\cdot \\frac{\\log_{${prime}} ${primePower}}{\\log_{${prime}} ${intermediateBase}}`,
      `= \\log_{${prime}} ${primePower}`,
      `= \\log_{${prime}} ${prime}^${exponent} = ${exponent}`,
    ];
    return { pattern, qStr, ansNum: exponent, ansDen: 1, expLines };
  }

  if (pattern === 'pattern3') {
    const prime = primes[Math.floor(random() * primes.length)];
    const i = Math.floor(random() * 2) + 1;
    const j = Math.floor(random() * 2) + 1;
    const a = prime ** i;
    const b = prime ** j;
    const exponentSum = i + j;
    const qStr = `\\frac{1}{\\log_{${a}} ${prime}} + \\frac{1}{\\log_{${b}} ${prime}}`;
    const expLines = [
      `\\text{底の変換公式の逆数の性質 } \\frac{1}{\\log_A B} = \\log_B A \\text{ より：}`,
      `\\frac{1}{\\log_{${a}} ${prime}} + \\frac{1}{\\log_{${b}} ${prime}} = \\log_{${prime}} ${a} + \\log_{${prime}} ${b}`,
      `= \\log_{${prime}} (${a} \\times ${b})`,
      `= \\log_{${prime}} ${a * b}`,
      `= \\log_{${prime}} ${prime}^${exponentSum} = ${exponentSum}`,
    ];
    return { pattern, qStr, ansNum: exponentSum, ansDen: 1, expLines };
  }

  const prime = primes[Math.floor(random() * primes.length)];
  const exponent = prime === 5 ? 1 : Math.floor(random() * 2) + 1;
  const base = prime ** exponent;
  const allowedArguments = [2, 3, 4, 5].filter(value => value !== prime);
  const argument = allowedArguments[Math.floor(random() * allowedArguments.length)];
  const answer = argument ** exponent;
  const qStr = `${base}^{\\log_{${prime}} ${argument}}`;
  const expLines = exponent === 1
    ? [
      `\\text{対数の定義式 } a^{\\log_a b} = b \\text{ をそのまま利用します。}`,
      `${prime}^{\\log_{${prime}} ${argument}} = ${argument}`,
    ]
    : [
      `\\text{まず底をそろえるために、} ${base} = ${prime}^${exponent} \\text{ と変形します。}`,
      `${base}^{\\log_{${prime}} ${argument}} = \\left(${prime}^${exponent}\\right)^{\\log_{${prime}} ${argument}}`,
      `= ${prime}^{${exponent} \\log_{${prime}} ${argument}}`,
      `\\text{対数の係数を真数の肩に乗せます。}`,
      `= ${prime}^{\\log_{${prime}} ${argument}^${exponent}} = ${prime}^{\\log_{${prime}} ${answer}}`,
      `\\text{定義式 } a^{\\log_a b} = b \\text{ より：}`,
      `= ${answer}`,
    ];
  return { pattern, qStr, ansNum: answer, ansDen: 1, expLines };
}
