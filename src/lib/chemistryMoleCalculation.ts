import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';

export type MolePattern = 'mass' | 'concentration' | 'dilution' | 'gas' | 'stoichiometry' | 'limiting-reagent' | 'ph' | 'yield';
export type MoleMode = MolePattern | 'mix';
export type MoleProblem = { pattern: MolePattern; question: string; answer: number; unit: string; explanation: string };

export const molePatterns: readonly MolePattern[] = ['mass', 'concentration', 'dilution', 'gas', 'stoichiometry', 'limiting-reagent', 'ph', 'yield'];
export const moleLabels: Record<MolePattern, string> = { mass: '質量から物質量', concentration: 'モル濃度', dilution: '希釈', gas: '気体の物質量', stoichiometry: '反応量比', 'limiting-reagent': '制限試薬と生成量', ph: 'pH計算', yield: '収率' };

const picker = new BalancedRandom(molePatterns);
const variants = {
  mass: new BalancedRandom([
    { substance: '水 H₂O', mass: 18, molarMass: 18 }, { substance: '水 H₂O', mass: 9, molarMass: 18 },
    { substance: '二酸化炭素 CO₂', mass: 22, molarMass: 44 }, { substance: 'アンモニア NH₃', mass: 8.5, molarMass: 17 },
    { substance: '塩化ナトリウム NaCl', mass: 11.7, molarMass: 58.5 },
  ]),
  concentration: new BalancedRandom([
    { amount: 0.2, volume: 0.5 }, { amount: 0.3, volume: 0.75 }, { amount: 0.25, volume: 0.5 },
    { amount: 0.15, volume: 0.3 }, { amount: 0.4, volume: 0.8 },
  ]),
  dilution: new BalancedRandom([
    { initial: 2, initialVolume: 50, target: 0.5 }, { initial: 1.5, initialVolume: 40, target: 0.3 },
    { initial: 0.8, initialVolume: 100, target: 0.2 }, { initial: 0.5, initialVolume: 80, target: 0.2 },
    { initial: 3, initialVolume: 25, target: 0.75 },
  ]),
  gas: new BalancedRandom([
    { gas: '酸素 O₂', volume: 5.6 }, { gas: '窒素 N₂', volume: 11.2 }, { gas: '水素 H₂', volume: 16.8 },
    { gas: '酸素 O₂', volume: 22.4 }, { gas: '窒素 N₂', volume: 44.8 },
  ]),
  stoichiometry: new BalancedRandom([
    { equation: '2H₂ + O₂ → 2H₂O', source: 'H₂', sourceCoefficient: 2, amount: 3, target: 'O₂', targetCoefficient: 1 },
    { equation: 'N₂ + 3H₂ → 2NH₃', source: 'H₂', sourceCoefficient: 3, amount: 1.5, target: 'N₂', targetCoefficient: 1 },
    { equation: '4Fe + 3O₂ → 2Fe₂O₃', source: 'Fe', sourceCoefficient: 4, amount: 2, target: 'O₂', targetCoefficient: 3 },
    { equation: '2Na + Cl₂ → 2NaCl', source: 'Cl₂', sourceCoefficient: 1, amount: 0.4, target: 'Na', targetCoefficient: 2 },
    { equation: 'CaCO₃ → CaO + CO₂', source: 'CaCO₃', sourceCoefficient: 1, amount: 0.75, target: 'CO₂', targetCoefficient: 1 },
  ]),
  limitingReagent: new BalancedRandom([
    { equation: '2H₂ + O₂ → 2H₂O', reactantA: 'H₂', coefficientA: 2, amountA: 2, reactantB: 'O₂', coefficientB: 1, amountB: 1.5, product: 'H₂O', productCoefficient: 2 },
    { equation: 'N₂ + 3H₂ → 2NH₃', reactantA: 'N₂', coefficientA: 1, amountA: 1.5, reactantB: 'H₂', coefficientB: 3, amountB: 3, product: 'NH₃', productCoefficient: 2 },
    { equation: '4Fe + 3O₂ → 2Fe₂O₃', reactantA: 'Fe', coefficientA: 4, amountA: 3, reactantB: 'O₂', coefficientB: 3, amountB: 3, product: 'Fe₂O₃', productCoefficient: 2 },
    { equation: '2Al + 3Cl₂ → 2AlCl₃', reactantA: 'Al', coefficientA: 2, amountA: 1.2, reactantB: 'Cl₂', coefficientB: 3, amountB: 2.4, product: 'AlCl₃', productCoefficient: 2 },
    { equation: 'CaCO₃ + 2HCl → CaCl₂ + CO₂ + H₂O', reactantA: 'CaCO₃', coefficientA: 1, amountA: 0.5, reactantB: 'HCl', coefficientB: 2, amountB: 0.8, product: 'CO₂', productCoefficient: 1 },
  ]),
  ph: new BalancedRandom([1, 2, 3, 4, 5]),
  yield: new BalancedRandom([
    { actual: 8, theoretical: 10 }, { actual: 9, theoretical: 12 }, { actual: 14, theoretical: 20 },
    { actual: 18, theoretical: 30 }, { actual: 10, theoretical: 16 },
  ]),
};

const displayNumber = (value: number) => Number(value.toFixed(6)).toString();
const superscriptDigits = (value: number) => String(value).replace(/\d/g, digit => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(digit)]);
export const formatMoleAnswer = displayNumber;

export function isMoleAnswerCorrect(input: string, expected: number): boolean {
  return isNumericAnswerCorrect(input, expected, 6);
}

export function generateMoleProblem(mode: MoleMode, random = Math.random): MoleProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  switch (pattern) {
    case 'mass': {
      const value = variants.mass.next(random);
      const answer = value.mass / value.molarMass;
      return { pattern, question: `${value.substance} ${value.mass} g は何 mol か。（モル質量 ${value.molarMass} g/mol）`, answer, unit: 'mol', explanation: `n=m/M=${value.mass}/${value.molarMass}=${displayNumber(answer)} mol。` };
    }
    case 'concentration': {
      const value = variants.concentration.next(random);
      const answer = value.amount / value.volume;
      return { pattern, question: `溶質 ${value.amount} mol を水に溶かして ${value.volume} L とした。モル濃度は？`, answer, unit: 'mol/L', explanation: `c=n/V=${value.amount}/${value.volume}=${displayNumber(answer)} mol/L。` };
    }
    case 'dilution': {
      const value = variants.dilution.next(random);
      const answer = (value.initial * value.initialVolume) / value.target;
      return { pattern, question: `${value.initial} mol/L の溶液 ${value.initialVolume} mL を ${value.target} mol/L に薄める。全体を何 mL にするか。`, answer, unit: 'mL', explanation: `溶質の物質量一定より c₁V₁=c₂V₂。V₂=${value.initial}×${value.initialVolume}/${value.target}=${displayNumber(answer)} mL。` };
    }
    case 'gas': {
      const value = variants.gas.next(random);
      const answer = value.volume / 22.4;
      return { pattern, question: `0℃、1.013×10⁵ Pa の標準状態で ${value.gas} ${value.volume} L は何 mol か。（モル体積 22.4 L/mol）`, answer, unit: 'mol', explanation: `この標準状態ではモル体積が22.4 L/molなので、n=V/22.4=${value.volume}/22.4=${displayNumber(answer)} mol。` };
    }
    case 'stoichiometry': {
      const value = variants.stoichiometry.next(random);
      const answer = (value.amount * value.targetCoefficient) / value.sourceCoefficient;
      return { pattern, question: `${value.equation}。${value.source} ${value.amount} mol と完全反応する ${value.target} は何 mol か。`, answer, unit: 'mol', explanation: `反応式の係数比 ${value.source}:${value.target}=${value.sourceCoefficient}:${value.targetCoefficient} より、${value.amount}×${value.targetCoefficient}/${value.sourceCoefficient}=${displayNumber(answer)} mol。` };
    }
    case 'limiting-reagent': {
      const value = variants.limitingReagent.next(random);
      const ratioA = value.amountA / value.coefficientA;
      const ratioB = value.amountB / value.coefficientB;
      const limitingAmount = Math.min(ratioA, ratioB);
      const limitingReactant = ratioA <= ratioB ? value.reactantA : value.reactantB;
      const answer = limitingAmount * value.productCoefficient;
      return {
        pattern,
        question: `${value.equation}。${value.reactantA} ${value.amountA} mol と ${value.reactantB} ${value.amountB} mol を反応させる。反応が完了したとき、${value.product} は最大何 mol 生成するか。`,
        answer,
        unit: 'mol',
        explanation: `反応式の係数で割って比較します。${value.reactantA} は ${value.amountA}/${value.coefficientA}=${displayNumber(ratioA)}、${value.reactantB} は ${value.amountB}/${value.coefficientB}=${displayNumber(ratioB)}。小さい ${limitingReactant} が制限試薬です。${value.product} の生成量は ${displayNumber(limitingAmount)}×${value.productCoefficient}=${displayNumber(answer)} mol。`,
      };
    }
    case 'ph': {
      const value = variants.ph.next(random);
      const concentration = `10⁻${superscriptDigits(value)}`;
      return { pattern, question: `水素イオン濃度が ${concentration} mol/L の強酸水溶液の pH は？`, answer: value, unit: '', explanation: `[H⁺]=${concentration} mol/L なので pH=−log₁₀[H⁺]=${value}。` };
    }
    case 'yield': {
      const value = variants.yield.next(random);
      const answer = (value.actual / value.theoretical) * 100;
      return { pattern, question: `理論上 ${value.theoretical} g 得られる反応で、実際に ${value.actual} g 得た。収率は？`, answer, unit: '%', explanation: `収率=実際量/理論量×100=${displayNumber(answer)}%。` };
    }
  }
}
