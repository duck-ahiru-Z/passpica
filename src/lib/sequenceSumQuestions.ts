import { BalancedRandom } from './balancedRandom.ts';
import { formatGeometricSequenceSumPrompt } from './sequenceSumPrompt.ts';

export const sequenceSumPatterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'] as const;
export type SequenceSumPattern = (typeof sequenceSumPatterns)[number];
export type SequenceSumMode = SequenceSumPattern | 'mix';
export type SequenceSumProblem = {
  pattern: SequenceSumPattern;
  qStr: string;
  ansNum: number;
  ansDen: number;
  expLines: string[];
};

const mixedPatternPicker = new BalancedRandom<SequenceSumPattern>(sequenceSumPatterns);

function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) [x, y] = [y, x % y];
  return x;
}

const integer = (random: () => number, min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;

export function generateSequenceSumProblem(
  selectedPattern: SequenceSumMode,
  random: () => number = Math.random,
): SequenceSumProblem {
  const pattern = selectedPattern === 'mix' ? mixedPatternPicker.next(random) : selectedPattern;

  while (true) {
    if (pattern === 'pattern1') {
      const a = integer(random, -10, 10);
      const d = integer(random, -10, 10);
      const n = integer(random, 5, 20);
      if (d === 0) continue;

      const sum = (n * (2 * a + (n - 1) * d)) / 2;
      const qStr = `初項 ${a} 、公差 ${d} の等差数列の初項から第 ${n} 項までの和 S_{${n}} を求めよ。`;
      const expLines = [
        `\\text{等差数列の和の公式 } S_n = \\frac{n}{2}\\{2a + (n-1)d\\} \\text{ に代入します。}`,
        `S_{${n}} = \\frac{${n}}{2} \\{ 2 \\cdot (${a}) + (${n}-1) \\cdot (${d}) \\}`,
        `= \\frac{${n}}{2} \\{ ${2 * a} + ${n - 1} \\cdot (${d}) \\}`,
        `= \\frac{${n}}{2} \\{ ${2 * a + (n - 1) * d} \\}`,
        `= ${sum}`,
      ];
      return { pattern, qStr, ansNum: sum, ansDen: 1, expLines };
    }

    if (pattern === 'pattern2') {
      const a = integer(random, -10, 10);
      const last = integer(random, -20, 20);
      const n = integer(random, 5, 20);
      if (a === last) continue;

      let sumNum = n * (a + last);
      let sumDen = 2;
      const divisor = gcd(sumNum, sumDen);
      sumNum /= divisor;
      sumDen /= divisor;
      const qStr = `初項 ${a} 、末項 ${last} 、項数 ${n} の等差数列の和 S_{${n}} を求めよ。`;
      const expLines = [
        `\\text{末項がわかっている場合の公式 } S_n = \\frac{n}{2}(a+l) \\text{ を用います。}`,
        `S_{${n}} = \\frac{${n}}{2} ( ${a} + (${last}) )`,
        `= \\frac{${n}}{2} \\cdot (${a + last})`,
        sumDen === 1 ? `= ${sumNum}` : `= \\frac{${sumNum}}{${sumDen}}`,
      ];
      return { pattern, qStr, ansNum: sumNum, ansDen: sumDen, expLines };
    }

    if (pattern === 'pattern3') {
      const a = integer(random, 1, 5);
      const r = integer(random, 2, 4);
      const n = integer(random, 4, 7);
      const sum = (a * (r ** n - 1)) / (r - 1);
      const qStr = `初項 ${a} 、公比 ${r} の等比数列の初項から第 ${n} 項までの和 S_{${n}} を求めよ。`;
      const expLines = [
        `\\text{等比数列の和の公式 } S_n = \\frac{a(r^n - 1)}{r - 1} \\text{ に代入します。}`,
        `S_{${n}} = \\frac{${a} \\cdot (${r}^{${n}} - 1)}{${r} - 1}`,
        `= \\frac{${a} \\cdot (${r ** n} - 1)}{${r - 1}}`,
        `= \\frac{${a} \\cdot ${r ** n - 1}}{${r - 1}}`,
        `= ${sum}`,
      ];
      return { pattern, qStr, ansNum: sum, ansDen: 1, expLines };
    }

    const ratioChoices = [-2, 0.5, -0.5] as const;
    const ratio = ratioChoices[integer(random, 0, ratioChoices.length - 1)];
    let a: number;
    let n: number;
    let ratioText: string;
    let ratioNumerator: number;
    let ratioDenominator: number;
    let powerNumerator: number;
    let powerDenominator: number;

    if (ratio === -2) {
      a = integer(random, 1, 5);
      n = integer(random, 5, 8);
      ratioText = '-2';
      ratioNumerator = -2;
      ratioDenominator = 1;
      powerNumerator = (-2) ** n;
      powerDenominator = 1;
    } else {
      const startValues = ratio === 0.5 ? [8, 16, 32, 64] : [8, 16, 32];
      a = startValues[integer(random, 0, startValues.length - 1)];
      n = ratio === 0.5 ? integer(random, 4, 7) : integer(random, 4, 6);
      ratioText = ratio === 0.5 ? '\\frac{1}{2}' : '-\\frac{1}{2}';
      ratioNumerator = ratio === 0.5 ? 1 : -1;
      ratioDenominator = 2;
      powerNumerator = ratio === 0.5 ? 1 : n % 2 === 0 ? 1 : -1;
      powerDenominator = 2 ** n;
    }

    const qStr = formatGeometricSequenceSumPrompt(a, ratioText, n);
    let ansNum = a * (powerDenominator - powerNumerator) * ratioDenominator;
    let ansDen = powerDenominator * (ratioDenominator - ratioNumerator);
    const divisor = gcd(ansNum, ansDen);
    ansNum /= divisor;
    ansDen /= divisor;

    let expLines: string[];
    if (ratio === -2) {
      expLines = [
        `\\text{公比が負の場合は } S_n = \\frac{a(1 - r^n)}{1 - r} \\text{ の形が安全です。}`,
        `S_{${n}} = \\frac{${a} \\{ 1 - (-2)^{${n}} \\}}{1 - (-2)}`,
        `= \\frac{${a} \\{ 1 - (${powerNumerator}) \\}}{3}`,
        `= \\frac{${a} \\cdot (${1 - powerNumerator})}{3}`,
        ansDen === 1 ? `= ${ansNum}` : `= \\frac{${ansNum}}{${ansDen}}`,
      ];
    } else {
      expLines = [
        `\\text{公比が分数の場合は } S_n = \\frac{a(1 - r^n)}{1 - r} \\text{ を用います。}`,
        `S_{${n}} = \\frac{${a} \\left\\{ 1 - \\left(${ratioText}\\right)^{${n}} \\right\\}}{1 - \\left(${ratioText}\\right)}`,
        `= \\frac{${a} \\left( 1 - \\frac{${powerNumerator}}{${powerDenominator}} \\right)}{\\frac{${ratioDenominator - ratioNumerator}}{${ratioDenominator}}}`,
        `= ${a} \\left( \\frac{${powerDenominator - powerNumerator}}{${powerDenominator}} \\right) \\times \\frac{${ratioDenominator}}{${ratioDenominator - ratioNumerator}}`,
        ansDen === 1 ? `= ${ansNum}` : `= \\frac{${ansNum}}{${ansDen}}`,
      ];
    }

    return { pattern, qStr, ansNum, ansDen, expLines };
  }
}
