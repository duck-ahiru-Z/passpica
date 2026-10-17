import { BalancedRandom } from './balancedRandom.ts';

export const factorizationPatterns = ['common', 'identity', 'cross', 'substitution', 'higher'] as const;
export type FactorizationPattern = (typeof factorizationPatterns)[number];
export type FactorizationMode = FactorizationPattern | 'mix';
export type FactorizationQuestion = {
  pattern: FactorizationPattern;
  expression: string;
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

export function generateFactorizationQuestion(mode: FactorizationMode, random = Math.random): FactorizationQuestion {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const n = integer(random, 2, 9);
  let expression: string;
  const answer = factorizationLabels[pattern];
  let explanation: string;

  switch (pattern) {
    case 'common': {
      const a = integer(random, 2, 6);
      const b = integer(random, 2, 6);
      const c = integer(random, 2, 6);
      expression = `${a * n}x^2 ${b * n >= 0 ? '+' : '-'} ${b * n}x ${c * n >= 0 ? '+' : '-'} ${c * n}`;
      explanation = `全ての項に ${n} が含まれるので、まず共通因数 ${n} をくくり出します。残った式の因数分解を続けます。`;
      break;
    }
    case 'identity': {
      const forms = [
        { expression: `x^2-${n ** 2}`, explanation: `平方の差 x²−${n ** 2}=(x−${n})(x+${n}) を使います。` },
        { expression: `x^2+${2 * n}x+${n ** 2}`, explanation: `x²+2·${n}·x+${n}² の形なので、(${`x+${n}`})² です。` },
        { expression: `x^2-${2 * n}x+${n ** 2}`, explanation: `x²−2·${n}·x+${n}² の形なので、(${`x-${n}`})² です。` },
      ];
      const form = forms[integer(random, 0, forms.length - 1)];
      expression = form.expression;
      explanation = form.explanation;
      break;
    }
    case 'cross': {
      const a = integer(random, 1, 5);
      const b = integer(random, 1, 5);
      const sum = a + b;
      const product = a * b;
      expression = `x^2+${sum}x+${product}`;
      explanation = `積が ${product}、和が ${sum} になる2数 ${a} と ${b} を探すと、(x+${a})(x+${b}) です。係数が1でない場合はたすき掛けで探します。`;
      break;
    }
    case 'substitution': {
      const a = integer(random, 2, 5);
      const b = integer(random, 1, 5);
      expression = `x^4+${a + b}x^2+${a * b}`;
      explanation = `X=x² と置くと X²+${a + b}X+${a * b}=(X+${a})(X+${b})。最後に X を x² に戻します。`;
      break;
    }
    case 'higher': {
      const a = integer(random, 2, 6);
      expression = `x^3+${a}x^2+x+${a}`;
      explanation = `前2項・後2項でまとめると x²(x+${a})+(x+${a})。共通な (x+${a}) をくくります。`;
      break;
    }
  }

  const options = [...factorizationPatterns.map(item => factorizationLabels[item])];
  return { pattern, expression, answer, options, explanation };
}
