export function formatGeometricSequenceSumPrompt(initial: number, ratio: string, termCount: number): string {
  return `初項 ${initial} 、公比 ${ratio} の等比数列の初項から第 ${termCount} 項までの和 S_{${termCount}} を求めよ。`;
}
