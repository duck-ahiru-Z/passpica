export function hasUniqueMode(data: number[], expectedMode: number): boolean {
  const counts = new Map<number, number>();
  for (const value of data) counts.set(value, (counts.get(value) ?? 0) + 1);
  const expectedCount = counts.get(expectedMode);
  return expectedCount !== undefined
    && expectedCount === Math.max(...counts.values())
    && [...counts.values()].filter(count => count === expectedCount).length === 1;
}

export function parseDataAnalysisAnswer(value: string): number | null {
  const normalized = value.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isDataAnalysisAnswerCorrect(answers: string[], expected: Array<string | undefined>): boolean {
  if (answers.length !== expected.length || expected.some(value => value === undefined)) return false;
  return expected.every((value, index) => {
    const actual = parseDataAnalysisAnswer(answers[index]);
    return actual !== null && Math.abs(actual - Number(value)) < 0.01;
  });
}
