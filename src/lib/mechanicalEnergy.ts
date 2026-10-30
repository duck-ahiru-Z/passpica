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

export function calculateFallingEnergy(
  heightInput: number,
  mass = fallingObjectMass,
  initialHeight = fallingObjectInitialHeight,
): MechanicalEnergyState {
  const safeInitialHeight = Math.max(0, initialHeight);
  const safeMass = Math.max(0, mass);
  const height = Math.max(0, Math.min(safeInitialHeight, heightInput));
  const total = safeMass * mechanicalEnergyGravity * safeInitialHeight;
  const potential = safeMass * mechanicalEnergyGravity * height;
  const kinetic = total - potential;

  return {
    height,
    dropDistance: safeInitialHeight - height,
    potential,
    kinetic,
    total,
    potentialFraction: safeInitialHeight === 0 ? 1 : height / safeInitialHeight,
    kineticFraction: safeInitialHeight === 0 ? 0 : 1 - height / safeInitialHeight,
  };
}
