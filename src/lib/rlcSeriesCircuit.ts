export type RlcSeriesInput = {
  resistance: number;
  inductance: number;
  capacitanceMicrofarads: number;
  frequency: number;
  voltagePeak: number;
};

export type RlcSeriesState = RlcSeriesInput & {
  angularFrequency: number;
  inductiveReactance: number;
  capacitiveReactance: number;
  netReactance: number;
  impedance: number;
  currentPeak: number;
  voltageLeadAngleRadians: number;
  voltageLeadAngleDegrees: number;
  resonanceFrequency: number;
};

export function calculateRlcSeriesState(input: RlcSeriesInput): RlcSeriesState {
  for (const [name, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be a finite positive number`);
    }
  }

  const angularFrequency = 2 * Math.PI * input.frequency;
  const capacitanceFarads = input.capacitanceMicrofarads * 1e-6;
  const inductiveReactance = angularFrequency * input.inductance;
  const capacitiveReactance = 1 / (angularFrequency * capacitanceFarads);
  const netReactance = inductiveReactance - capacitiveReactance;
  const impedance = Math.hypot(input.resistance, netReactance);
  const currentPeak = input.voltagePeak / impedance;
  const voltageLeadAngleRadians = Math.atan2(netReactance, input.resistance);

  return {
    ...input,
    angularFrequency,
    inductiveReactance,
    capacitiveReactance,
    netReactance,
    impedance,
    currentPeak,
    voltageLeadAngleRadians,
    voltageLeadAngleDegrees: voltageLeadAngleRadians * 180 / Math.PI,
    resonanceFrequency: 1 / (2 * Math.PI * Math.sqrt(input.inductance * capacitanceFarads)),
  };
}
