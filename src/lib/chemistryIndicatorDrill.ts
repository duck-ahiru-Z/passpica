import { BalancedRandom } from './balancedRandom.ts';
import { getIndicatorDisplay, type IndicatorKey } from './chemistryIndicator.ts';

export type IndicatorDrillMode = IndicatorKey | 'mix';
export type IndicatorProblem = {
  pattern: IndicatorKey;
  pH: number;
  question: string;
  answer: string;
  explanation: string;
};

export const indicatorDrillPatterns: readonly IndicatorKey[] = ['pp', 'litmus', 'mo'];
export const indicatorDrillLabels: Record<IndicatorKey, string> = {
  pp: 'フェノールフタレイン',
  litmus: 'リトマス液',
  mo: 'メチルオレンジ',
};

const patternPicker = new BalancedRandom(indicatorDrillPatterns);
const phPickers: Record<IndicatorKey, BalancedRandom<number>> = {
  pp: new BalancedRandom([1, 7, 8.2, 8.3, 8.8, 9.5, 10, 12]),
  litmus: new BalancedRandom([1, 5, 5.5, 6.5, 7, 7.5, 8, 14]),
  mo: new BalancedRandom([1, 3.1, 3.4, 3.75, 4.1, 4.4, 7, 14]),
};

function getColorRule(pattern: IndicatorKey, pH: number): string {
  switch (pattern) {
    case 'pp':
      return pH < 8.3
        ? 'pH 8.3 未満では無色で、pH 8.3〜10.0 の変色域から赤紫色になります。'
        : 'pH 8.3 以上で赤紫色に変わり、pH 10.0 以上では色がはっきりします。';
    case 'litmus':
      return pH <= 5
        ? 'pH 5.0 以下では赤色です。'
        : pH < 7
          ? 'pH 5.0〜7.0 の範囲では赤紫色から紫色へ変化します。'
          : pH === 7
            ? '中性付近の pH 7.0 では紫色です。'
            : pH < 8
              ? 'pH 7.0〜8.0 の範囲では紫色から青色へ変化します。'
              : 'pH 8.0 以上では青色です。';
    case 'mo':
      return pH <= 3.1
        ? 'pH 3.1 以下では赤色です。'
        : pH < 3.75
          ? 'pH 3.1〜3.75 の範囲では赤色から橙色へ変化します。'
          : pH === 3.75
            ? '変色域の中間 pH 3.75 付近では橙色です。'
            : pH < 4.4
              ? 'pH 3.75〜4.4 の範囲では橙色から黄色へ変化します。'
              : 'pH 4.4 以上では黄色です。';
  }
}

function formatPH(pH: number): string {
  return Number(pH.toFixed(2)).toString();
}

export function generateIndicatorProblem(
  mode: IndicatorDrillMode,
  random = Math.random,
): IndicatorProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const pH = phPickers[pattern].next(random);
  const display = getIndicatorDisplay(pattern, pH);

  return {
    pattern,
    pH,
    question: `pH ${formatPH(pH)} の水溶液に${display.indicatorName}を加えると、何色を示すか。`,
    answer: display.colorName,
    explanation: `${getColorRule(pattern, pH)} この条件では${display.colorName}を示します。`,
  };
}

export function isIndicatorColorAnswerCorrect(input: string, expected: string): boolean {
  return input.trim() === expected;
}
