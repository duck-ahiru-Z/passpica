export type CalculusAreaProblemType = '1/6_line' | '1/6_para' | '1/12' | '1/20' | '1/30';
export type CalculusAreaStrategy = 'one-sixth' | 'one-twelfth' | 'one-twentieth' | 'one-thirtieth';

export function getCalculusAreaStrategy(type: CalculusAreaProblemType): CalculusAreaStrategy {
  if (type === '1/6_line' || type === '1/6_para') return 'one-sixth';
  if (type === '1/12') return 'one-twelfth';
  if (type === '1/20') return 'one-twentieth';
  return 'one-thirtieth';
}
