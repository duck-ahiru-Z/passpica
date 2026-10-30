export const idealGasConstantKPaLiters = 8.314;

function requirePositiveFinite(values: number[]): void {
  if (values.some(value => !Number.isFinite(value) || value <= 0)) {
    throw new RangeError('ideal-gas inputs must be finite positive numbers');
  }
}

export function calculateIdealGasAmount(pressureKPa: number, volumeLiters: number, temperatureKelvin: number): number {
  requirePositiveFinite([pressureKPa, volumeLiters, temperatureKelvin]);
  return pressureKPa * volumeLiters / (idealGasConstantKPaLiters * temperatureKelvin);
}

export function calculateIdealGasVolume(amountMol: number, pressureKPa: number, temperatureKelvin: number): number {
  requirePositiveFinite([amountMol, pressureKPa, temperatureKelvin]);
  return amountMol * idealGasConstantKPaLiters * temperatureKelvin / pressureKPa;
}
