export type StandingWaveBoundary = 'string' | 'openPipe' | 'closedPipe';

export function allowedStandingWaveHarmonics(boundary: StandingWaveBoundary): number[] {
  return boundary === 'closedPipe' ? [1, 3, 5] : [1, 2, 3, 4];
}

export function standingWaveWavelength(length: number, harmonic: number, boundary: StandingWaveBoundary): number {
  return boundary === 'closedPipe' ? 4 * length / harmonic : 2 * length / harmonic;
}

export function standingWaveFrequency(speed: number, length: number, harmonic: number, boundary: StandingWaveBoundary): number {
  return speed / standingWaveWavelength(length, harmonic, boundary);
}

export function standingWaveDisplacement(
  x: number,
  length: number,
  harmonic: number,
  boundary: StandingWaveBoundary,
  timePhaseDegrees: number,
): number {
  const position = x / length;
  const standingFactor = boundary === 'string'
    ? Math.sin(harmonic * Math.PI * position)
    : boundary === 'openPipe'
      ? Math.cos(harmonic * Math.PI * position)
      : Math.sin(harmonic * Math.PI * position / 2);
  return standingFactor * Math.cos(timePhaseDegrees * Math.PI / 180);
}

export function standingWaveNodes(boundary: StandingWaveBoundary, harmonic: number): number[] {
  if (boundary === 'string') return Array.from({ length: harmonic + 1 }, (_, index) => index / harmonic);
  if (boundary === 'openPipe') return Array.from({ length: harmonic }, (_, index) => (index + 0.5) / harmonic);
  return Array.from({ length: (harmonic + 1) / 2 }, (_, index) => (2 * index) / harmonic);
}

export function standingWaveAntinodes(boundary: StandingWaveBoundary, harmonic: number): number[] {
  if (boundary === 'string') return Array.from({ length: harmonic }, (_, index) => (index + 0.5) / harmonic);
  if (boundary === 'openPipe') return Array.from({ length: harmonic + 1 }, (_, index) => index / harmonic);
  return Array.from({ length: (harmonic + 1) / 2 }, (_, index) => (2 * index + 1) / harmonic);
}
