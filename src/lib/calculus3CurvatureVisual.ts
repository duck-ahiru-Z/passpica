export const curvatureFunction = (x: number) => x ** 4 - 2 * x ** 2;
export const curvatureFirstDerivative = (x: number) => 4 * x ** 3 - 4 * x;
export const curvatureSecondDerivative = (x: number) => {
  const value = 12 * x ** 2 - 4;
  return Math.abs(value) < 1e-10 ? 0 : value;
};
export const curvatureInflectionX = 1 / Math.sqrt(3);

export const curvatureExtrema = [
  { x: -1, y: -1, label: '極小' },
  { x: 0, y: 0, label: '極大' },
  { x: 1, y: -1, label: '極小' },
] as const;

export const curvatureInflectionPoints = [-curvatureInflectionX, curvatureInflectionX] as const;

export function snapCurvatureXToInflection(x: number): number {
  return curvatureInflectionPoints.find(point => Math.abs(x - point) <= 0.0005) ?? x;
}
