export const titrationVisualAcidVolumeMl = 25;
export const titrationVisualAcidConcentration = 0.1;
export const titrationVisualBaseConcentration = 0.1;
export const titrationVisualMaxBaseVolumeMl = 50;

export type TitrationVisualState = {
  baseVolumeMl: number;
  ph: number;
  acidMoles: number;
  baseMoles: number;
  equivalenceVolumeMl: number;
  phase: 'acidic' | 'equivalence' | 'basic';
  indicator: 'colorless' | 'pink';
};

export function getTitrationVisualState(baseVolumeMl: number): TitrationVisualState {
  if (!Number.isFinite(baseVolumeMl)) {
    throw new RangeError('base volume must be finite');
  }

  const boundedVolume = Math.min(titrationVisualMaxBaseVolumeMl, Math.max(0, baseVolumeMl));
  const acidMoles = titrationVisualAcidVolumeMl / 1000 * titrationVisualAcidConcentration;
  const baseMoles = boundedVolume / 1000 * titrationVisualBaseConcentration;
  const totalVolumeLiters = (titrationVisualAcidVolumeMl + boundedVolume) / 1000;
  const difference = acidMoles - baseMoles;
  const equivalenceVolumeMl = acidMoles / titrationVisualBaseConcentration * 1000;

  let ph: number;
  let phase: TitrationVisualState['phase'];
  if (Math.abs(difference) < 1e-12) {
    ph = 7;
    phase = 'equivalence';
  } else if (difference > 0) {
    ph = -Math.log10(difference / totalVolumeLiters);
    phase = 'acidic';
  } else {
    const hydroxideConcentration = -difference / totalVolumeLiters;
    ph = 14 + Math.log10(hydroxideConcentration);
    phase = 'basic';
  }

  return {
    baseVolumeMl: boundedVolume,
    ph,
    acidMoles,
    baseMoles,
    equivalenceVolumeMl,
    phase,
    indicator: ph >= 8.3 ? 'pink' : 'colorless',
  };
}

export function getTitrationCurvePoints(sampleCount = 100): Array<{ volumeMl: number; ph: number }> {
  if (!Number.isInteger(sampleCount) || sampleCount < 2) {
    throw new RangeError('sample count must be an integer of at least 2');
  }
  return Array.from({ length: sampleCount + 1 }, (_, index) => {
    const volumeMl = titrationVisualMaxBaseVolumeMl * index / sampleCount;
    return { volumeMl, ph: getTitrationVisualState(volumeMl).ph };
  });
}
