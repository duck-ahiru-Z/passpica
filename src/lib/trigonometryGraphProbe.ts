export type TrigonometricFunction = 'sin' | 'cos' | 'tan';
export type TrigonometryProbeStatus = 'visible' | 'out-of-range' | 'undefined';

export function getTrigonometryProbeStatus(
  func: TrigonometricFunction,
  inputDegrees: number,
  y: number,
  visibleYLimit: number,
): TrigonometryProbeStatus {
  if (!Number.isFinite(y)) return 'undefined';

  const inputRadians = (inputDegrees * Math.PI) / 180;
  if (func === 'tan' && Math.abs(Math.cos(inputRadians)) < 1e-10) return 'undefined';
  if (Math.abs(y) > visibleYLimit) return 'out-of-range';
  return 'visible';
}
