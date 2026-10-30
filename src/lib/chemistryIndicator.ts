export type IndicatorKey = 'pp' | 'litmus' | 'mo';

export type IndicatorDisplay = {
  indicatorName: string;
  colorName: string;
  backgroundColor: string;
};

type Rgb = readonly [number, number, number];

function blend(from: Rgb, to: Rgb, fraction: number): Rgb {
  const t = Math.max(0, Math.min(1, fraction));
  return from.map((channel, index) => Math.round(channel + (to[index] - channel) * t)) as unknown as Rgb;
}

function rgba([red, green, blue]: Rgb, alpha = 0.75): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const RED: Rgb = [239, 68, 68];
const PURPLE: Rgb = [139, 92, 246];
const BLUE: Rgb = [59, 130, 246];
const ORANGE: Rgb = [249, 115, 22];
const YELLOW: Rgb = [234, 179, 8];

export function getIndicatorDisplay(indicator: IndicatorKey, phInput: number): IndicatorDisplay {
  // Keep malformed values from producing NaN RGB channels in the visual.
  // Neutral pH is a safe fallback; finite out-of-range values remain clamped.
  const pH = Number.isNaN(phInput) ? 7 : Math.max(1, Math.min(14, phInput));

  if (indicator === 'pp') {
    if (pH < 8.3) {
      return { indicatorName: 'フェノールフタレイン', colorName: '無色', backgroundColor: 'rgba(219, 234, 254, 0.72)' };
    }
    const intensity = Math.min((pH - 8.3) / (10 - 8.3), 1);
    const alpha = 0.15 + 0.8 * intensity;
    return { indicatorName: 'フェノールフタレイン', colorName: '赤紫色', backgroundColor: `rgba(244, 114, 182, ${alpha})` };
  }

  if (indicator === 'litmus') {
    const color = pH <= 6.5
      ? blend(RED, PURPLE, (pH - 5) / 2)
      : blend(PURPLE, BLUE, (pH - 6.5) / 1.5);
    const colorName = pH <= 5 ? '赤色' : pH >= 8 ? '青色' : pH < 7 ? '赤紫色' : pH === 7 ? '紫色' : '青紫色';
    return { indicatorName: 'リトマス液', colorName, backgroundColor: rgba(color, 0.7) };
  }

  const color = pH <= 3.75
    ? blend(RED, ORANGE, (pH - 3.1) / (3.75 - 3.1))
    : blend(ORANGE, YELLOW, (pH - 3.75) / (4.4 - 3.75));
  const colorName = pH <= 3.1 ? '赤色' : pH >= 4.4 ? '黄色' : pH < 3.75 ? '赤橙色' : pH === 3.75 ? '橙色' : '黄橙色';
  return { indicatorName: 'メチルオレンジ', colorName, backgroundColor: rgba(color, 0.8) };
}
