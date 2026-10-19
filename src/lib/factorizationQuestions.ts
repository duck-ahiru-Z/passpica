import { BalancedRandom } from './balancedRandom.ts';

export const factorizationPatterns = ['common', 'identity', 'cross', 'substitution', 'higher'] as const;
export type FactorizationPattern = (typeof factorizationPatterns)[number];
export type FactorizationMode = FactorizationPattern | 'mix';
export type FactorizationQuestion = {
  pattern: FactorizationPattern;
  expression: string;
  factorization: string;
  answer: string;
  options: string[];
  explanation: string;
};

export const factorizationLabels: Record<FactorizationPattern, string> = {
  common: '共通因数',
  identity: '展開公式',
  cross: 'たすき掛け',
  substitution: '置き換え',
  higher: '高次式・グループ分け',
};

const patternPicker = new BalancedRandom(factorizationPatterns);
const integer = (random: () => number, min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

export function generateFactorizationQuestion(mode: FactorizationMode, random = Math.random): FactorizationQuestion {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const n = integer(random, 2, 9);
  let expression: string;
  let factorization: string;
  const answer = factorizationLabels[pattern];
  let explanation: string;

  switch (pattern) {
    case 'common': {
      const a = integer(random, 2, 6);
      const b = integer(random, 2, 6);
      const c = Math.floor((b * b) / (4 * a)) + 1;
      expression = `${a * n}x^2 + ${b * n}x + ${c * n}`;
      factorization = `${n}(${a}x^2+${b}x+${c})`;
      explanation = `全ての項に ${n} が含まれるので、まず共通因数 ${n} をくくり出します。残った ${a}x²+${b}x+${c} は、判別式 b²−4ac=${b ** 2 - 4 * a * c} < 0 で整数係数の一次式には分解できません。`;
      break;
    }
    case 'identity': {
      const forms = [
        { expression: `x^2-${n ** 2}`, factorization: `(x-${n})(x+${n})`, explanation: `平方の差 x²−${n ** 2}=(x−${n})(x+${n}) を使います。` },
        { expression: `x^2+${2 * n}x+${n ** 2}`, factorization: `(x+${n})^2`, explanation: `x²+2·${n}·x+${n}² の形なので、(${`x+${n}`})² です。` },
        { expression: `x^2-${2 * n}x+${n ** 2}`, factorization: `(x-${n})^2`, explanation: `x²−2·${n}·x+${n}² の形なので、(${`x-${n}`})² です。` },
      ];
      const form = forms[integer(random, 0, forms.length - 1)];
      expression = form.expression;
      explanation = form.explanation;
      factorization = form.factorization;
      break;
    }
    case 'cross': {
      const p = integer(random, 2, 4);
      const r = integer(random, 1, 3);
      const qOptions = Array.from({ length: 5 }, (_, index) => index + 1).filter(value => gcd(p, value) === 1);
      const sOptions = Array.from({ length: 5 }, (_, index) => index + 1).filter(value => gcd(r, value) === 1);
      const q = qOptions[integer(random, 0, qOptions.length - 1)];
      const s = sOptions[integer(random, 0, sOptions.length - 1)];
      const leading = p * r;
      const middle = p * s + q * r;
      const constant = q * s;
      expression = `${leading}x^2+${middle}x+${constant}`;
      factorization = `(${p}x+${q})(${r}x+${s})`;
      explanation = `積の係数 ${leading} は ${p}×${r}、定数項 ${constant} は ${q}×${s} と分けます。交差積は ${p}×${s}=${p * s} と ${q}×${r}=${q * r} で、和が中項 ${middle} に一致します。したがって (${p}x+${q})(${r}x+${s}) です。`;
      break;
    }
    case 'substitution': {
      // Keep both constants non-squares and distinct so the quartic cannot
      // collapse into a perfect-square identity or factor further over Z.
      const values = [2, 3, 5, 6, 7, 8];
      const aIndex = Math.floor(random() * values.length);
      const bOffset = Math.floor(random() * (values.length - 1));
      const bIndex = bOffset >= aIndex ? bOffset + 1 : bOffset;
      const a = values[aIndex];
      const b = values[bIndex];
      const middle = a + b;
      const constant = a * b;
      expression = `x^4-${middle}x^2+${constant}`;
      factorization = `(x^2-${a})(x^2-${b})`;
      explanation = `X=x² と置くと X²−${middle}X+${constant}=(X−${a})(X−${b})。最後に X を x² に戻し、(x²−${a})(x²−${b}) とします。`;
      break;
    }
    case 'higher': {
      const a = integer(random, 2, 6);
      expression = `x^3+${a}x^2-x-${a}`;
      factorization = `(x+${a})(x-1)(x+1)`;
      explanation = `前2項・後2項でまとめると x²(x+${a})−(x+${a})。共通な (x+${a}) をくくり、平方差も使って (x+${a})(x−1)(x+1) とします。`;
      break;
    }
  }

  const options = [...factorizationPatterns.map(item => factorizationLabels[item])];
  return { pattern, expression, factorization, answer, options, explanation };
}

export function normalizeFactorizationAnswer(value: string): string {
  return value.trim().replace(/\s+/g, '').replace(/[×·]/g, '*').replaceAll('−', '-').replaceAll('²', '^2').replaceAll('³', '^3').replaceAll('*', '');
}

function splitParenthesizedFactors(expression: string): string[] | null {
  const factors: string[] = [];
  let index = 0;

  while (index < expression.length) {
    if (expression[index] !== '(') return null;
    const start = index;
    let depth = 0;
    for (; index < expression.length; index += 1) {
      if (expression[index] === '(') depth += 1;
      if (expression[index] === ')') depth -= 1;
      if (depth === 0) {
        index += 1;
        break;
      }
    }
    if (depth !== 0) return null;
    factors.push(expression.slice(start, index));
  }

  return factors.length > 1 ? factors : null;
}

export function areFactorizationsEquivalent(input: string, expected: string): boolean {
  const normalizedInput = normalizeFactorizationAnswer(input);
  const normalizedExpected = normalizeFactorizationAnswer(expected);
  if (normalizedInput === normalizedExpected) return true;

  const inputFactors = splitParenthesizedFactors(normalizedInput);
  const expectedFactors = splitParenthesizedFactors(normalizedExpected);
  if (inputFactors === null || expectedFactors === null || inputFactors.length !== expectedFactors.length) return false;

  const sortedInputFactors = inputFactors.sort();
  const sortedExpectedFactors = expectedFactors.sort();
  return sortedInputFactors.every((factor, index) => factor === sortedExpectedFactors[index]);
}
