import { BalancedRandom } from './balancedRandom.ts';

export type BaseNPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type BaseNMode = BaseNPattern | 'mix';

export interface BaseNProblem {
  pattern: BaseNPattern;
  n: number;
  m?: number;
  q_val: number | string;
  a_val: string;
  dec_val: number;
}

const mixedPatternPicker = new BalancedRandom<BaseNPattern>([
  'pattern1', 'pattern2', 'pattern3', 'pattern4',
]);

export function generateBaseNProblem(selectedPattern: BaseNMode, random = Math.random): BaseNProblem {
  const pattern = selectedPattern === 'mix'
    ? mixedPatternPicker.next(random)
    : selectedPattern;

  while (true) {
    if (pattern === 'pattern1') {
      const decimal = Math.floor(random() * 191) + 10;
      const base = Math.floor(random() * 8) + 2;
      return { pattern, n: base, q_val: decimal, a_val: decimal.toString(base), dec_val: decimal };
    }

    if (pattern === 'pattern2') {
      const base = Math.floor(random() * 8) + 2;
      const length = Math.floor(random() * 2) + 3;
      let digits = '';
      for (let index = 0; index < length; index += 1) {
        const minimum = index === 0 ? 1 : 0;
        const maximum = base - 1;
        digits += String(Math.floor(random() * (maximum - minimum + 1)) + minimum);
      }
      const decimal = Number.parseInt(digits, base);
      return { pattern, n: base, q_val: digits, a_val: String(decimal), dec_val: decimal };
    }

    if (pattern === 'pattern3') {
      const sourceBase = Math.floor(random() * 8) + 2;
      const targetBase = Math.floor(random() * 8) + 2;
      if (sourceBase === targetBase) continue;
      const decimal = Math.floor(random() * 40) + 10;
      return {
        pattern,
        n: sourceBase,
        m: targetBase,
        q_val: decimal.toString(sourceBase),
        a_val: decimal.toString(targetBase),
        dec_val: decimal,
      };
    }

    const allowedBases = [2, 4, 5, 8];
    const base = allowedBases[Math.floor(random() * allowedBases.length)];
    const firstDigit = Math.floor(random() * base);
    const secondDigit = Math.floor(random() * (base - 1)) + 1;
    const value = Number((firstDigit / base + secondDigit / (base * base)).toPrecision(12));
    return {
      pattern,
      n: base,
      q_val: value,
      a_val: `0.${firstDigit}${secondDigit}`,
      dec_val: value,
    };
  }
}
