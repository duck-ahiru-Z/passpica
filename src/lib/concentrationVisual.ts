export function calculateMolarConcentration(moles: number, volumeLiters: number): number {
  if (!Number.isFinite(moles) || moles <= 0) throw new RangeError('Moles must be a positive finite number.');
  if (!Number.isFinite(volumeLiters) || volumeLiters <= 0) throw new RangeError('Volume must be a positive finite number.');
  return moles / volumeLiters;
}
