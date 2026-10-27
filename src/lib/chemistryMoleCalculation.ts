import { BalancedRandom } from './balancedRandom.ts';
import { isNumericAnswerCorrect } from './numericAnswer.ts';
import { calculateIdealGasAmount, calculateIdealGasVolume, idealGasConstantKPaLiters } from './idealGasLaw.ts';

export type MolePattern = 'mass' | 'composition' | 'concentration' | 'dilution' | 'gas' | 'idealGasAmount' | 'idealGasVolume' | 'stoichiometry' | 'limiting-reagent' | 'excess-reagent' | 'ph' | 'strongBasePh' | 'yield';
export type MoleMode = MolePattern | 'mix';
export type MoleProblem = { pattern: MolePattern; question: string; answer: number; unit: string; explanation: string };

export const molePatterns: readonly MolePattern[] = ['mass', 'composition', 'concentration', 'dilution', 'gas', 'idealGasAmount', 'idealGasVolume', 'stoichiometry', 'limiting-reagent', 'excess-reagent', 'ph', 'strongBasePh', 'yield'];
export const moleLabels: Record<MolePattern, string> = { mass: '質量から物質量', composition: '元素の質量百分率', concentration: 'モル濃度', dilution: '希釈', gas: '標準状態の気体体積', idealGasAmount: '気体の状態方程式で物質量', idealGasVolume: '気体の状態方程式で体積', stoichiometry: '反応量比', 'limiting-reagent': '制限試薬と生成量', 'excess-reagent': '過剰試薬の残量', ph: '強酸のpH', strongBasePh: '強塩基のpH', yield: '収率' };

const picker = new BalancedRandom(molePatterns);
const variants = {
  mass: new BalancedRandom([
    { substance: '水 H₂O', mass: 18, molarMass: 18 }, { substance: '水 H₂O', mass: 9, molarMass: 18 },
    { substance: '二酸化炭素 CO₂', mass: 22, molarMass: 44 }, { substance: 'アンモニア NH₃', mass: 8.5, molarMass: 17 },
    { substance: '塩化ナトリウム NaCl', mass: 11.7, molarMass: 58.5 },
  ]),
  composition: new BalancedRandom([
    { compound: '水 H₂O', element: '酸素 O', elementMass: 16, molarMass: 18 },
    { compound: '二酸化炭素 CO₂', element: '炭素 C', elementMass: 12, molarMass: 44 },
    { compound: 'アンモニア NH₃', element: '窒素 N', elementMass: 14, molarMass: 17 },
    { compound: '塩化ナトリウム NaCl', element: '塩素 Cl', elementMass: 35.5, molarMass: 58.5 },
    { compound: '炭酸カルシウム CaCO₃', element: 'カルシウム Ca', elementMass: 40, molarMass: 100 },
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
  idealGasAmount: new BalancedRandom([
    { pressure: 100, volume: 8.314, temperature: 200 },
    { pressure: 100, volume: 24.942, temperature: 200 },
    { pressure: 83.14, volume: 8.314, temperature: 100 },
    { pressure: 200, volume: 8.314, temperature: 200 },
    { pressure: 50, volume: 8.314, temperature: 100 },
  ]),
  idealGasVolume: new BalancedRandom([
    { amount: 1, pressure: 101.3, temperature: 273 },
    { amount: 0.5, pressure: 100, temperature: 200 },
    { amount: 2, pressure: 200, temperature: 300 },
    { amount: 0.75, pressure: 100, temperature: 400 },
    { amount: 1.5, pressure: 150, temperature: 300 },
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
    { equation: '2H₂ + O₂ → 2H₂O', reactantA: 'H₂', coefficientA: 2, amountA: 4, reactantB: 'O₂', coefficientB: 1, amountB: 2, product: 'H₂O', productCoefficient: 2 },
    { equation: 'N₂ + 3H₂ → 2NH₃', reactantA: 'N₂', coefficientA: 1, amountA: 1.5, reactantB: 'H₂', coefficientB: 3, amountB: 3, product: 'NH₃', productCoefficient: 2 },
    { equation: '4Fe + 3O₂ → 2Fe₂O₃', reactantA: 'Fe', coefficientA: 4, amountA: 3, reactantB: 'O₂', coefficientB: 3, amountB: 3, product: 'Fe₂O₃', productCoefficient: 2 },
    { equation: '2Al + 3Cl₂ → 2AlCl₃', reactantA: 'Al', coefficientA: 2, amountA: 1.2, reactantB: 'Cl₂', coefficientB: 3, amountB: 2.4, product: 'AlCl₃', productCoefficient: 2 },
    { equation: 'CaCO₃ + 2HCl → CaCl₂ + CO₂ + H₂O', reactantA: 'CaCO₃', coefficientA: 1, amountA: 0.5, reactantB: 'HCl', coefficientB: 2, amountB: 0.8, product: 'CO₂', productCoefficient: 1 },
  ]),
  excessReagent: new BalancedRandom([
    { equation: '2H₂ + O₂ → 2H₂O', reactantA: 'H₂', coefficientA: 2, amountA: 2, reactantB: 'O₂', coefficientB: 1, amountB: 1.5 },
    { equation: '2H₂ + O₂ → 2H₂O', reactantA: 'H₂', coefficientA: 2, amountA: 4, reactantB: 'O₂', coefficientB: 1, amountB: 2 },
    { equation: 'N₂ + 3H₂ → 2NH₃', reactantA: 'N₂', coefficientA: 1, amountA: 1.5, reactantB: 'H₂', coefficientB: 3, amountB: 3 },
    { equation: '4Fe + 3O₂ → 2Fe₂O₃', reactantA: 'Fe', coefficientA: 4, amountA: 3, reactantB: 'O₂', coefficientB: 3, amountB: 3 },
    { equation: '2Al + 3Cl₂ → 2AlCl₃', reactantA: 'Al', coefficientA: 2, amountA: 1.2, reactantB: 'Cl₂', coefficientB: 3, amountB: 2.4 },
    { equation: 'CaCO₃ + 2HCl → CaCl₂ + CO₂ + H₂O', reactantA: 'CaCO₃', coefficientA: 1, amountA: 0.5, reactantB: 'HCl', coefficientB: 2, amountB: 0.8 },
  ]),
  ph: new BalancedRandom([1, 2, 3, 4, 5]),
  strongBasePh: new BalancedRandom([1, 2, 3, 4, 5]),
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
    case 'composition': {
      const value = variants.composition.next(random);
      const answer = value.elementMass / value.molarMass * 100;
      return { pattern, question: `${value.compound} 1 mol のうち、${value.element} の質量 ${value.elementMass} g は全質量 ${value.molarMass} g の何％か。`, answer, unit: '%', explanation: `質量百分率=${value.element}の質量/化合物の全質量×100=${value.elementMass}/${value.molarMass}×100=${displayNumber(answer)}%。` };
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
    case 'idealGasAmount': {
      const value = variants.idealGasAmount.next(random);
      const answer = calculateIdealGasAmount(value.pressure, value.volume, value.temperature);
      return { pattern, question: `理想気体の圧力 ${value.pressure} kPa、体積 ${value.volume} L、絶対温度 ${value.temperature} K のとき、物質量 n は？`, answer, unit: 'mol', explanation: `状態方程式 PV=nRT より n=PV/(RT)=${value.pressure}×${value.volume}/(${idealGasConstantKPaLiters}×${value.temperature})=${displayNumber(answer)} mol。` };
    }
    case 'idealGasVolume': {
      const value = variants.idealGasVolume.next(random);
      const answer = calculateIdealGasVolume(value.amount, value.pressure, value.temperature);
      return { pattern, question: `理想気体 ${value.amount} mol、圧力 ${value.pressure} kPa、絶対温度 ${value.temperature} K の体積 V は？`, answer, unit: 'L', explanation: `状態方程式 PV=nRT より V=nRT/P=${value.amount}×${idealGasConstantKPaLiters}×${value.temperature}/${value.pressure}=${displayNumber(answer)} L。` };
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
      const bothLimiting = ratioA === ratioB;
      const limitingReactant = ratioA <= ratioB ? value.reactantA : value.reactantB;
      const answer = limitingAmount * value.productCoefficient;
      return {
        pattern,
        question: `${value.equation}。${value.reactantA} ${value.amountA} mol と ${value.reactantB} ${value.amountB} mol を反応させる。反応が完了したとき、${value.product} は最大何 mol 生成するか。`,
        answer,
        unit: 'mol',
        explanation: `反応式の係数で割って比較します。${value.reactantA} は ${value.amountA}/${value.coefficientA}=${displayNumber(ratioA)}、${value.reactantB} は ${value.amountB}/${value.coefficientB}=${displayNumber(ratioB)}。${bothLimiting ? `両方の比が${displayNumber(limitingAmount)} molで等しいため、両方とも過不足なく反応する共制限試薬です。` : `小さい ${limitingReactant} が制限試薬です。`}${value.product} の生成量は ${displayNumber(limitingAmount)}×${value.productCoefficient}=${displayNumber(answer)} mol。`,
      };
    }
    case 'excess-reagent': {
      const value = variants.excessReagent.next(random);
      const ratioA = value.amountA / value.coefficientA;
      const ratioB = value.amountB / value.coefficientB;
      const extent = Math.min(ratioA, ratioB);
      const excessReactant = ratioA > ratioB ? value.reactantA : ratioB > ratioA ? value.reactantB : '';
      const excessCoefficient = excessReactant === value.reactantA ? value.coefficientA : value.coefficientB;
      const excessInitial = excessReactant === value.reactantA ? value.amountA : value.amountB;
      const answer = excessReactant ? excessInitial - excessCoefficient * extent : 0;
      const explanation = excessReactant
        ? `${value.equation} の係数で割ると ${value.reactantA} は ${value.amountA}/${value.coefficientA}=${displayNumber(ratioA)}、${value.reactantB} は ${value.amountB}/${value.coefficientB}=${displayNumber(ratioB)}。小さい比の試薬が先になくなります。${excessReactant} は ${excessInitial}−${excessCoefficient}×${displayNumber(extent)}=${displayNumber(answer)} mol 残る。`
        : `${value.equation} の係数で割ると両方とも ${displayNumber(extent)} で等しいため、共制限試薬です。両方が過不足なく反応し、残量は 0 mol。`;
      return {
        pattern,
        question: `${value.equation}。${value.reactantA} ${value.amountA} mol と ${value.reactantB} ${value.amountB} mol を反応させた。反応完了後に残る過剰試薬は何 mol か。（共制限なら 0 mol）`,
        answer,
        unit: 'mol',
        explanation,
      };
    }
    case 'ph': {
      const value = variants.ph.next(random);
      const concentration = `10⁻${superscriptDigits(value)}`;
      return { pattern, question: `25℃で、水素イオン濃度が ${concentration} mol/L の強酸水溶液の pH は？`, answer: value, unit: '', explanation: `[H⁺]=${concentration} mol/L なので pH=−log₁₀[H⁺]=${value}。` };
    }
    case 'strongBasePh': {
      const value = variants.strongBasePh.next(random);
      const concentration = `10⁻${superscriptDigits(value)}`;
      const answer = 14 - value;
      return { pattern, question: `25℃で、水酸化物イオン濃度が ${concentration} mol/L の強塩基水溶液の pH は？`, answer, unit: '', explanation: `[OH⁻]=${concentration} mol/L だから pOH=−log₁₀[OH⁻]=${value}。25℃では pH+pOH=14 より pH=14−${value}=${answer}。` };
    }
    case 'yield': {
      const value = variants.yield.next(random);
      const answer = (value.actual / value.theoretical) * 100;
      return { pattern, question: `理論上 ${value.theoretical} g 得られる反応で、実際に ${value.actual} g 得た。収率は？`, answer, unit: '%', explanation: `収率=実際量/理論量×100=${displayNumber(answer)}%。` };
    }
  }
}
