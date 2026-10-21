import { BalancedRandom } from './balancedRandom.ts';

export type CrystalStructure = 'bcc' | 'fcc';
export type CrystalLatticePattern = 'atomCount' | 'coordination' | 'packing' | 'latticeConstant' | 'atomicRadius' | 'density';
export type CrystalLatticeMode = CrystalLatticePattern | 'mix';
export type CrystalLatticeProblem = {
  pattern: CrystalLatticePattern;
  structure: CrystalStructure;
  question: string;
  answer: number;
  unit: string;
  explanation: string;
  decimals: number;
};

export const crystalLatticePatterns: readonly CrystalLatticePattern[] = [
  'atomCount', 'coordination', 'packing', 'latticeConstant', 'atomicRadius', 'density',
];

export const crystalLatticeLabels: Record<CrystalLatticePattern, string> = {
  atomCount: '単位格子中の原子数',
  coordination: '配位数',
  packing: '空間充填率',
  latticeConstant: '原子半径から格子定数',
  atomicRadius: '格子定数から原子半径',
  density: '単位格子から結晶の密度',
};

const patternPicker = new BalancedRandom(crystalLatticePatterns);
const structurePicker = new BalancedRandom<CrystalStructure>(['bcc', 'fcc']);
const structureNames: Record<CrystalStructure, string> = { bcc: '体心立方格子 (BCC)', fcc: '面心立方格子 (FCC)' };
const structureData = {
  bcc: { atomCount: 2, coordination: 8, packing: 68, relation: 4 / Math.sqrt(3) },
  fcc: { atomCount: 4, coordination: 12, packing: 74, relation: 2 * Math.sqrt(2) },
} as const;
type CrystalMetal = { name: string; molarMass: number; latticeConstant: number };
const metals: Record<CrystalStructure, readonly CrystalMetal[]> = {
  bcc: [
    { name: 'ナトリウム (Na)', molarMass: 22.99, latticeConstant: 4.29 },
    { name: 'カリウム (K)', molarMass: 39.10, latticeConstant: 5.23 },
    { name: '鉄 (Fe)', molarMass: 55.85, latticeConstant: 2.87 },
  ],
  fcc: [
    { name: 'アルミニウム (Al)', molarMass: 26.98, latticeConstant: 4.05 },
    { name: '銅 (Cu)', molarMass: 63.55, latticeConstant: 3.61 },
    { name: '銀 (Ag)', molarMass: 107.87, latticeConstant: 4.09 },
  ],
} as const;

const pick = <T,>(items: readonly T[], random: () => number): T => {
  const sample = random();
  const index = Number.isFinite(sample)
    ? Math.min(items.length - 1, Math.max(0, Math.floor(sample * items.length)))
    : 0;
  return items[index];
};

export function formatCrystalLatticeAnswer(answer: number, decimals = 3): string {
  return answer.toFixed(decimals);
}

export function isCrystalLatticeAnswerCorrect(raw: string, answer: number, decimals = 3): boolean {
  if (raw.trim() === '') return false;
  const value = Number(raw);
  const scale = 10 ** decimals;
  return Number.isFinite(value) && Math.round(value * scale) === Math.round(answer * scale);
}

export function generateCrystalLatticeProblem(mode: CrystalLatticeMode, random = Math.random): CrystalLatticeProblem {
  const pattern = mode === 'mix' ? patternPicker.next(random) : mode;
  const structure = structurePicker.next(random);
  const data = structureData[structure];
  const name = structureNames[structure];
  const decimals = pattern === 'latticeConstant' || pattern === 'atomicRadius' || pattern === 'density' ? 3 : 0;

  switch (pattern) {
    case 'atomCount':
      return { pattern, structure, decimals, question: `${name}の単位格子に含まれる原子は合計何個か。`, answer: data.atomCount, unit: '個', explanation: structure === 'bcc' ? 'BCCは頂点8個×1/8個分に体心1個を加えて、8×1/8+1=2個。' : 'FCCは頂点8個×1/8個分に面心6個×1/2個分を加えて、8×1/8+6×1/2=4個。' };
    case 'coordination':
      return { pattern, structure, decimals, question: `${name}で、1個の原子に最も近接して接する原子はいくつか。`, answer: data.coordination, unit: '個', explanation: structure === 'bcc' ? 'BCCでは体心原子の周囲に8個の頂点原子が接するため、配位数は8。' : 'FCCでは各原子に最も近い原子が12個あるため、配位数は12。' };
    case 'packing':
      return { pattern, structure, decimals, question: `${name}の空間充填率は約何%か。`, answer: data.packing, unit: '%', explanation: structure === 'bcc' ? 'BCCの充填率は約68%。単位格子内の原子体積を格子体積で割ります。' : 'FCCの充填率は約74%。単位格子内の原子体積を格子体積で割ります。' };
    case 'latticeConstant': {
      const radius = pick([1.10, 1.20, 1.25, 1.35, 1.40, 1.50, 1.60], random);
      const answer = data.relation * radius;
      return { pattern, structure, decimals, question: `${name}で原子半径 r=${radius} Å のとき、格子定数 a は何Åか。（小数第3位まで）`, answer, unit: 'Å', explanation: structure === 'bcc' ? `体対角線で原子が接するので √3a=4r。a=4×${radius}/√3=${formatCrystalLatticeAnswer(answer)} Å。` : `面対角線で原子が接するので √2a=4r。a=4×${radius}/√2=${formatCrystalLatticeAnswer(answer)} Å。` };
    }
    case 'atomicRadius': {
      const latticeConstant = pick([3.00, 3.40, 3.60, 4.00, 4.20, 4.50, 5.00], random);
      const answer = latticeConstant / data.relation;
      return { pattern, structure, decimals, question: `${name}で格子定数 a=${latticeConstant} Å のとき、原子半径 r は何Åか。（小数第3位まで）`, answer, unit: 'Å', explanation: structure === 'bcc' ? `√3a=4r より r=√3×${latticeConstant}/4=${formatCrystalLatticeAnswer(answer)} Å。` : `√2a=4r より r=√2×${latticeConstant}/4=${formatCrystalLatticeAnswer(answer)} Å。` };
    }
    case 'density': {
      const metal = pick(metals[structure], random);
      const answer = data.atomCount * metal.molarMass / (6.02214076e23 * (metal.latticeConstant * 1e-8) ** 3);
      return { pattern, structure, decimals, question: `${name}の${metal.name}について、モル質量 ${metal.molarMass} g/mol、格子定数 ${metal.latticeConstant} Å とする。結晶の密度は何 g/cm³か。（小数第3位まで）`, answer, unit: 'g/cm³', explanation: `格子定数をcmに直し、ρ=単位格子中の原子数×モル質量/(Nₐa³)。${data.atomCount}×${metal.molarMass}/(6.022×10²³×(${metal.latticeConstant}×10⁻⁸)³)=${formatCrystalLatticeAnswer(answer)} g/cm³。` };
    }
  }
}
