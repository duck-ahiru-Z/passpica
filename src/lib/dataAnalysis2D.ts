export function getCorrelationDirectionLabel(correlation: number): string {
  const boundaryTolerance = 1e-12;
  if (correlation >= 0.4 - boundaryTolerance) return '右上がり（正の相関）';
  if (correlation <= -0.4 + boundaryTolerance) return '右下がり（負の相関）';
  return 'バラバラ（無相関）';
}

export interface CorrelationScatterPoint {
  x: number;
  y: number;
}

export function generateCorrelationScatterPoints(
  targetCorrelation: number,
  random: () => number = Math.random,
  count = 30,
): CorrelationScatterPoint[] {
  if (!Number.isFinite(targetCorrelation) || targetCorrelation < -1 || targetCorrelation > 1) {
    throw new RangeError('Correlation must be between -1 and 1.');
  }
  if (!Number.isInteger(count) || count < 3) {
    throw new RangeError('At least three points are required.');
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    const xValues = Array.from({ length: count }, () => 2 + random() * 6);
    const meanX = xValues.reduce((sum, value) => sum + value, 0) / count;
    const centeredX = xValues.map(value => value - meanX);
    const sumSqX = centeredX.reduce((sum, value) => sum + value * value, 0);
    if (sumSqX === 0) continue;

    let noise = Array.from({ length: count }, () => random() - 0.5);
    const meanNoise = noise.reduce((sum, value) => sum + value, 0) / count;
    noise = noise.map(value => value - meanNoise);
    const projection = noise.reduce((sum, value, index) => sum + value * centeredX[index], 0) / sumSqX;
    noise = noise.map((value, index) => value - projection * centeredX[index]);
    const sumSqNoise = noise.reduce((sum, value) => sum + value * value, 0);
    if (sumSqNoise === 0) continue;

    const noiseScale = Math.sqrt(sumSqX / sumSqNoise);
    const independentScale = Math.sqrt(1 - targetCorrelation * targetCorrelation);
    return xValues.map((x, index) => ({
      x,
      y: 5 + targetCorrelation * centeredX[index] + independentScale * noise[index] * noiseScale,
    }));
  }

  throw new Error('Could not generate varied, uncorrelated scatter noise.');
}
