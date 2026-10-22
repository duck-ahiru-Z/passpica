export function isDataAnalysis2DAnswerCorrect(answer: string, expected: string): boolean {
  const normalized = answer.trim().replaceAll(',', '');
  if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return false;

  const actual = Number(normalized);
  const target = Number(expected);
  return Number.isFinite(actual) && Number.isFinite(target) && Math.abs(actual - target) < 1e-9;
}
