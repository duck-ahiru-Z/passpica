export type SimpleHarmonicState = {
  period: number;
  frequency: number;
  angularFrequency: number;
  phase: number;
  displacement: number;
  velocity: number;
  acceleration: number;
  potentialEnergy: number;
  kineticEnergy: number;
  totalEnergy: number;
};

export function calculateSimpleHarmonicState({
  mass,
  springConstant,
  amplitude,
  phase,
}: {
  mass: number;
  springConstant: number;
  amplitude: number;
  phase: number;
}): SimpleHarmonicState {
  const safeMass = Math.max(Number.EPSILON, mass);
  const safeSpringConstant = Math.max(Number.EPSILON, springConstant);
  const safeAmplitude = Math.max(0, amplitude);
  const normalizedPhase = ((phase % 1) + 1) % 1;
  const angularFrequency = Math.sqrt(safeSpringConstant / safeMass);
  const angle = 2 * Math.PI * normalizedPhase;
  const displacement = safeAmplitude * Math.cos(angle);
  const velocity = -safeAmplitude * angularFrequency * Math.sin(angle);
  const acceleration = -(angularFrequency ** 2) * displacement;
  const potentialEnergy = 0.5 * safeSpringConstant * displacement ** 2;
  const kineticEnergy = 0.5 * safeMass * velocity ** 2;

  return {
    period: (2 * Math.PI) / angularFrequency,
    frequency: angularFrequency / (2 * Math.PI),
    angularFrequency,
    phase: normalizedPhase,
    displacement,
    velocity,
    acceleration,
    potentialEnergy,
    kineticEnergy,
    totalEnergy: potentialEnergy + kineticEnergy,
  };
}
