export type AbsoluteValueEquationPattern = 'pattern1' | 'pattern2' | 'pattern3' | 'pattern4';
export type AbsoluteValueEquationStrategy = 'split-sign' | 'check-sign-case' | 'split-number-line';

export function getAbsoluteValueEquationStrategy(pattern: AbsoluteValueEquationPattern): AbsoluteValueEquationStrategy {
  if (pattern === 'pattern1' || pattern === 'pattern2') return 'split-sign';
  return pattern === 'pattern3' ? 'check-sign-case' : 'split-number-line';
}
