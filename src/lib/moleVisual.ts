export const AVOGADRO_CONSTANT = 6.02e23;
export const STANDARD_MOLAR_VOLUME_L = 22.4;

export const moleVisualSubstances = [
  { id: 'water', formula: 'H₂O', name: '水', entity: '水分子', molarMass: 18 },
  { id: 'carbon-dioxide', formula: 'CO₂', name: '二酸化炭素', entity: '二酸化炭素分子', molarMass: 44 },
  { id: 'sodium-chloride', formula: 'NaCl', name: '塩化ナトリウム', entity: 'NaClの式単位', molarMass: 58.5 },
] as const;

export type MoleVisualSubstanceId = (typeof moleVisualSubstances)[number]['id'];

export function formatParticleCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) throw new RangeError('粒子数は0より大きい有限の値にしてください。');
  // Nudge exact decimal half cases so common values such as 0.25 mol × 6.02×10²³
  // display with ordinary half-up rounding instead of binary floating-point ties.
  const [coefficient, exponent] = (count * (1 + Number.EPSILON)).toExponential(2).split('e');
  const exponentSuperscript = exponent.replace(/^\+/, '').replace('-', '⁻').replace(/\d/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]);
  return `${coefficient}×10${exponentSuperscript}`;
}

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
