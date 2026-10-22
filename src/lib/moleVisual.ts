export const AVOGADRO_CONSTANT = 6.02e23;
export const STANDARD_MOLAR_VOLUME_L = 22.4;

export const moleVisualSubstances = [
  { id: 'water', formula: 'H₂O', name: '水', molarMass: 18 },
  { id: 'carbon-dioxide', formula: 'CO₂', name: '二酸化炭素', molarMass: 44 },
  { id: 'sodium-chloride', formula: 'NaCl', name: '塩化ナトリウム', molarMass: 58.5 },
] as const;

export type MoleVisualSubstanceId = (typeof moleVisualSubstances)[number]['id'];

export function getMoleVisualState(amountMol: number, substanceId: MoleVisualSubstanceId) {
  if (!Number.isFinite(amountMol) || amountMol <= 0) {
    throw new RangeError('物質量は0より大きい有限の値にしてください。');
  }
  const substance = moleVisualSubstances.find(item => item.id === substanceId);
  if (!substance) throw new RangeError('登録されていない物質です。');

  return {
    particles: amountMol * AVOGADRO_CONSTANT,
    massGrams: amountMol * substance.molarMass,
    gasVolumeLiters: amountMol * STANDARD_MOLAR_VOLUME_L,
    // The dots are a visual aid scaled to the selected amount, not literal particles.
    diagramDots: Math.max(1, Math.round(amountMol * 6)),
  };
}
