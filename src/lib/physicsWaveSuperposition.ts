export function calculateResultantAmplitude(amplitude: number, phaseDegrees: number): number {
  return 2 * amplitude * Math.abs(Math.cos(phaseDegrees * Math.PI / 360));
}
