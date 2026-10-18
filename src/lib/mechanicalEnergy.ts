export const mechanicalEnergyGravity = 9.8;
export const fallingObjectMass = 1;
export const fallingObjectInitialHeight = 20;

export type MechanicalEnergyState = {
  height: number;
  dropDistance: number;
  potential: number;
  kinetic: number;
  total: number;
  potentialFraction: number;
  kineticFraction: number;
};

export function calculateFallingEnergy(heightInput: number): MechanicalEnergyState {
  const height = Math.max(0, Math.min(fallingObjectInitialHeight, heightInput));
  const total = fallingObjectMass * mechanicalEnergyGravity * fallingObjectInitialHeight;
  const potential = fallingObjectMass * mechanicalEnergyGravity * height;
  const kinetic = total - potential;

  return {
    height,
    dropDistance: fallingObjectInitialHeight - height,
    potential,
    kinetic,
    total,
    potentialFraction: potential / total,
    kineticFraction: kinetic / total,
  };
}
