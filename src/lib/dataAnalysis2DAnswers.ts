export function isDataAnalysis2DAnswerCorrect(answer: string, expected: string): boolean {
  const normalized = answer.trim().replaceAll(',', '');
  if (!normalized || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return false;

  const actual = Number(normalized);
  const target = Number(expected);
  return Number.isFinite(actual) && Number.isFinite(target) && Math.abs(actual - target) < 1e-9;
}

type CrossTable = {
  a: number;
  b: number;
  c: number;
  d: number;
  totA: number;
  totB: number;
  totC: number;
  totD: number;
  targetCell: 'a' | 'b' | 'c' | 'd';
};

export function buildCrossTableExplanation(table: CrossTable): string[] {
  switch (table.targetCell) {
    case 'a':
      return ['\\text{属性1の行合計から求めます。}', `[A] = ${table.totA} - ${table.b} = ${table.a}`];
    case 'b':
      return ['\\text{属性1の行合計から求めます。}', `[A] = ${table.totA} - ${table.a} = ${table.b}`];
    case 'c':
      return ['\\text{グループXの列合計から求めます。}', `[A] = ${table.totC} - ${table.a} = ${table.c}`];
    case 'd':
      return ['\\text{グループYの列合計から求めます。}', `[A] = ${table.totD} - ${table.b} = ${table.d}`];
  }
}
