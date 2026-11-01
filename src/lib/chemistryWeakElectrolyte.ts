/** Solve x² + Kx − KC = 0 for the positive equilibrium ion concentration. */
export function solveWeakElectrolyteIonConcentration(concentration: number, equilibriumConstant: number): number {
  if (!Number.isFinite(concentration) || concentration <= 0 || !Number.isFinite(equilibriumConstant) || equilibriumConstant <= 0) {
    throw new RangeError('Concentration and equilibrium constant must be finite positive values.');
  }
  // This equivalent form avoids cancellation when K is much smaller than C.
  return (2 * equilibriumConstant * concentration)
    / (equilibriumConstant + Math.sqrt(equilibriumConstant ** 2 + 4 * equilibriumConstant * concentration));
}

export function calculateWeakAcidPh(concentration: number, ka: number): number {
  return -Math.log10(solveWeakElectrolyteIonConcentration(concentration, ka));
}

export function calculateWeakBasePh(concentration: number, kb: number): number {
  return 14 + Math.log10(solveWeakElectrolyteIonConcentration(concentration, kb));
}
