export const curvatureFunction = (x: number) => x ** 4 - 2 * x ** 2;
export const curvatureFirstDerivative = (x: number) => 4 * x ** 3 - 4 * x;
export const curvatureSecondDerivative = (x: number) => 12 * x ** 2 - 4;
export const curvatureInflectionX = 1 / Math.sqrt(3);

export const curvatureExtrema = [
  { x: -1, y: -1, label: '極小' },
  { x: 0, y: 0, label: '極大' },
  { x: 1, y: -1, label: '極小' },
] as const;

export const curvatureInflectionPoints = [-curvatureInflectionX, curvatureInflectionX] as const;
