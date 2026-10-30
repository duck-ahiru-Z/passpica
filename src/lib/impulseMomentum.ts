export type ImpulseMomentumState = {
  initialMomentum: number;
  impulse: number;
  finalMomentum: number;
  finalVelocity: number;
};

export function calculateImpulseMomentum(
  mass: number,
  initialVelocity: number,
  force: number,
  duration: number,
): ImpulseMomentumState {
  if (!Number.isFinite(mass) || mass <= 0) {
    throw new RangeError('質量は0より大きい有限の値にしてください。');
  }
  if (![initialVelocity, force, duration].every(Number.isFinite) || duration < 0) {
    throw new RangeError('速度・力・時間は有限の値で、時間は0以上にしてください。');
  }

  const initialMomentum = mass * initialVelocity;
  const impulse = force * duration;
  const finalMomentum = initialMomentum + impulse;

  return {
    initialMomentum,
    impulse,
    finalMomentum,
    finalVelocity: finalMomentum / mass,
  };
}
