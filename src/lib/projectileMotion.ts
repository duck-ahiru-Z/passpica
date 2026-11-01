export const projectileGravity = 9.8;
export const projectileInitialSpeed = 14;
export const projectileInitialHeight = 12;

export type ProjectileState = {
  angleDeg: number;
  vx0: number;
  vy0: number;
  flightTime: number;
  maxHeight: number;
  range: number;
  time: number;
  x: number;
  y: number;
  displayedY: number;
  vy: number;
};

export function calculateProjectileState(
  angleInput: number,
  timeFractionInput: number,
  initialSpeedInput = projectileInitialSpeed,
  initialHeightInput = projectileInitialHeight,
): ProjectileState {
  const angleDeg = Math.max(0, Math.min(75, angleInput));
  const timeFraction = Math.max(0, Math.min(1, timeFractionInput));
  const initialSpeed = Math.max(5, Math.min(30, initialSpeedInput));
  const initialHeight = Math.max(2, Math.min(30, initialHeightInput));
  const angle = (angleDeg * Math.PI) / 180;
  const vx0 = initialSpeed * Math.cos(angle);
  const vy0 = initialSpeed * Math.sin(angle);
  const flightTime = (vy0 + Math.sqrt(vy0 * vy0 + 2 * projectileGravity * initialHeight)) / projectileGravity;
  const maxHeight = initialHeight + (vy0 * vy0) / (2 * projectileGravity);
  const range = vx0 * flightTime;
  const time = flightTime * timeFraction;
  const x = vx0 * time;
  const y = initialHeight + vy0 * time - 0.5 * projectileGravity * time * time;

  return {
    angleDeg,
    vx0,
    vy0,
    flightTime,
    maxHeight,
    range,
    time,
    x,
    y,
    displayedY: Math.max(0, y),
    vy: vy0 - projectileGravity * time,
  };
}
