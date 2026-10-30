export type CircularMotionState = {
  angularSpeed: number;
  period: number;
  centripetalAcceleration: number;
  centripetalForce: number;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
};

export function calculateCircularMotion(mass: number, radius: number, speed: number, angleDegrees: number): CircularMotionState {
  if (![mass, radius, speed, angleDegrees].every(Number.isFinite) || mass <= 0 || radius <= 0 || speed <= 0) {
    throw new RangeError('mass, radius, and speed must be finite positive numbers, and angle must be finite');
  }
  const angle = angleDegrees * Math.PI / 180;
  const angularSpeed = speed / radius;
  const centripetalAcceleration = speed ** 2 / radius;
  return {
    angularSpeed,
    period: 2 * Math.PI * radius / speed,
    centripetalAcceleration,
    centripetalForce: mass * centripetalAcceleration,
    position: { x: radius * Math.cos(angle), y: radius * Math.sin(angle) },
    velocity: { x: -speed * Math.sin(angle), y: speed * Math.cos(angle) },
    acceleration: { x: -(speed ** 2 / radius) * Math.cos(angle), y: -(speed ** 2 / radius) * Math.sin(angle) },
  };
}
