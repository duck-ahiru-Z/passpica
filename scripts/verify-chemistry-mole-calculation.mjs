import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { formatMoleAnswer, generateMoleProblem, isMoleAnswerCorrect, molePatterns } from '../src/lib/chemistryMoleCalculation.ts';
import { calculateIdealGasAmount, calculateIdealGasVolume, idealGasConstantKPaLiters } from '../src/lib/idealGasLaw.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/mole-calculation-drill/page.tsx'), 'utf8');
if (!/type="radio"\s+name="mole-method"/.test(drillPage) || drillPage.includes('aria-pressed={method === pattern}')) {
  throw new Error('chemistry method selection must be a single-choice radio group');
}
if (!drillPage.includes('setMethod(pattern); setChecked(false);') || !drillPage.includes('setAnswer(event.target.value); setChecked(false);')) {
  throw new Error('changing a chemistry method or answer must clear old feedback');
}
if (!drillPage.includes("setMethod(selectedMode === 'mix' ? '' : selectedMode)") || !drillPage.includes("mode === 'mix' ? <fieldset") || !drillPage.includes('基礎練習：{moleLabels[mode]}に固定して繰り返します。')) {
  throw new Error('fixed chemistry practice must lock its method while mixed practice asks learners to identify it');
}

const stableRandom = () => 0.37;
const expectedUnits = { mass: 'mol', composition: '%', concentration: 'mol/L', dilution: 'mL', gas: 'mol', idealGasAmount: 'mol', idealGasVolume: 'L', stoichiometry: 'mol', 'limiting-reagent': 'mol', 'excess-reagent': 'mol', ph: '', strongBasePh: '', yield: '%' };
const toPlainSubscripts = value => value.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, digit => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(digit)));
function formulaAtoms(formula) {
  const plain = toPlainSubscripts(formula);
  const tokens = plain.match(/[A-Z][a-z]?|\(|\)|\d+/g) ?? [];
  if (tokens.join('') !== plain) throw new Error(`unparsed chemical formula: ${formula}`);
  let cursor = 0;
  const readGroup = (nested = false) => {
    const atoms = {};
    while (cursor < tokens.length) {
      const token = tokens[cursor++];
      if (token === ')') {
        if (!nested) throw new Error(`unexpected closing parenthesis in ${formula}`);
        return atoms;
      }
      if (token === '(') {
        const group = readGroup(true);
        const multiplier = /^\d+$/.test(tokens[cursor] ?? '') ? Number(tokens[cursor++]) : 1;
        for (const [element, count] of Object.entries(group)) atoms[element] = (atoms[element] ?? 0) + count * multiplier;
        continue;
      }
      if (!/^[A-Z][a-z]?$/.test(token)) throw new Error(`unexpected token ${token} in ${formula}`);
      const multiplier = /^\d+$/.test(tokens[cursor] ?? '') ? Number(tokens[cursor++]) : 1;
      atoms[token] = (atoms[token] ?? 0) + multiplier;
    }
    if (nested) throw new Error(`unclosed parenthesis in ${formula}`);
    return atoms;
  };
  const result = readGroup();
  if (cursor !== tokens.length) throw new Error(`unconsumed tokens in ${formula}`);
  return result;
}
function reactionCoefficients(equation) {
  const [left, right] = equation.split(' → ');
  if (!left || !right) throw new Error(`invalid reaction arrow: ${equation}`);
  const readSide = side => Object.fromEntries(side.split(' + ').map(term => {
    const match = term.match(/^(\d+)?(.+)$/);
    return [match[2], Number(match[1] ?? 1)];
  }));
  const reactants = readSide(left); const products = readSide(right);
  const sumSide = terms => Object.entries(terms).reduce((sum, [formula, coefficient]) => {
    for (const [element, count] of Object.entries(formulaAtoms(formula))) sum[element] = (sum[element] ?? 0) + count * coefficient;
    return sum;
  }, {});
  assert.deepEqual(sumSide(reactants), sumSide(products), `reaction must be atom-balanced: ${equation}`);
  return { reactants, products };
}
function verifyDisplayedReactionMatchesCalculation(problem) {
  if (!['stoichiometry', 'limiting-reagent', 'excess-reagent'].includes(problem.pattern)) return;
  const equation = problem.question.split('。')[0];
  const { reactants, products } = reactionCoefficients(equation);
  if (problem.pattern === 'stoichiometry') {
    const [, source, target] = problem.question.match(/^.+?。(.+?) [\d.]+ mol と完全反応する (.+?) は/);
    const [, sourceCoefficient, targetCoefficient] = problem.explanation.match(/係数比 .+=(\d+):(\d+) より、/);
    assert.equal(Number(sourceCoefficient), reactants[source], `source coefficient mismatch for ${equation}`);
    assert.equal(Number(targetCoefficient), reactants[target] ?? products[target], `target coefficient mismatch for ${equation}`);
    return;
  }
  if (problem.pattern === 'limiting-reagent' || problem.pattern === 'excess-reagent') {
    const [, reactantA, reactantB] = problem.question.match(/^.+?。(.+?) [\d.]+ mol と (.+?) [\d.]+ mol/);
    const [, amountA, amountB] = problem.question.match(/^.+?。.+? ([\d.]+) mol と .+? ([\d.]+) mol/);
    const coefficientA = reactants[reactantA]; const coefficientB = reactants[reactantB];
    if (problem.pattern === 'excess-reagent' && problem.explanation.includes('共制限試薬')) {
      assert.equal(Number(amountA) / coefficientA, Number(amountB) / coefficientB, `co-limiting amounts must match reaction ratio for ${equation}`);
      assert.equal(problem.answer, 0, `co-limiting reactants leave nothing in excess for ${equation}`);
      return;
    }
    assert.ok(problem.explanation.includes(`${amountA}/${coefficientA}=`), `first displayed ratio must use the equation coefficient for ${equation}`);
    assert.ok(problem.explanation.includes(`${amountB}/${coefficientB}=`), `second displayed ratio must use the equation coefficient for ${equation}`);
    if (problem.pattern === 'limiting-reagent') {
      const [, product] = problem.question.match(/。.+?を反応させる。反応が完了したとき、(.+?) は最大/);
      const [, usedProductCoefficient] = problem.explanation.match(/生成量は [\d.]+×(\d+)=/);
      const productCoefficient = products[product];
      assert.ok(productCoefficient, `product must appear in the balanced equation for ${equation}`);
      assert.equal(Number(usedProductCoefficient), products[product], `calculated product coefficient mismatch for ${equation}`);
    }
  }
}
const checks = {
  mass: problem => {
    const [, mass, molarMass] = problem.question.match(/([\d.]+) g.*?([\d.]+) g\/mol/);
    return Math.abs(problem.answer - Number(mass) / Number(molarMass)) < 1e-12;
  },
  composition: problem => {
    const [, compound, element, elementMass, totalMass] = problem.question.match(/^(.+?) 1 mol のうち、(.+?) の質量 ([\d.]+) g は全質量 ([\d.]+) g の何％か。$/);
    const known = {
      '水 H₂O|酸素 O': [16, 18],
      '二酸化炭素 CO₂|炭素 C': [12, 44],
      'アンモニア NH₃|窒素 N': [14, 17],
      '塩化ナトリウム NaCl|塩素 Cl': [35.5, 58.5],
      '炭酸カルシウム CaCO₃|カルシウム Ca': [40, 100],
    };
    const expectedParts = known[`${compound}|${element}`];
    const expected = Number(elementMass) / Number(totalMass) * 100;
    return expectedParts !== undefined
      && Number(elementMass) === expectedParts[0]
      && Number(totalMass) === expectedParts[1]
      && Math.abs(problem.answer - expected) < 1e-12
      && problem.explanation.includes(`${elementMass}/${totalMass}×100=${formatMoleAnswer(expected)}%`);
  },
  concentration: problem => {
    const [, amount, volume] = problem.question.match(/溶質 ([\d.]+) mol .*? ([\d.]+) L/);
    return Math.abs(problem.answer - Number(amount) / Number(volume)) < 1e-12;
  },
  dilution: problem => {
    const [, initial, initialVolume, target] = problem.question.match(/^([\d.]+) mol\/L の溶液 ([\d.]+) mL を ([\d.]+) mol\/L/);
    return Math.abs(problem.answer - (Number(initial) * Number(initialVolume)) / Number(target)) < 1e-12;
  },
  gas: problem => {
    const [, volume] = problem.question.match(/([\d.]+) L は何 mol/);
    return Math.abs(problem.answer - Number(volume) / 22.4) < 1e-12;
  },
  idealGasAmount: problem => {
    const [, pressure, volume, temperature] = problem.question.match(/圧力 ([\d.]+) kPa、体積 ([\d.]+) L、絶対温度 ([\d.]+) K/);
    const expected = calculateIdealGasAmount(Number(pressure), Number(volume), Number(temperature));
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'mol'
      && problem.explanation.includes(`n=PV/(RT)=${pressure}×${volume}/(${idealGasConstantKPaLiters}×${temperature})=${formatMoleAnswer(expected)} mol`);
  },
  idealGasVolume: problem => {
    const [, amount, pressure, temperature] = problem.question.match(/理想気体 ([\d.]+) mol、圧力 ([\d.]+) kPa、絶対温度 ([\d.]+) K/);
    const expected = calculateIdealGasVolume(Number(amount), Number(pressure), Number(temperature));
    return Math.abs(problem.answer - expected) < 1e-12 && problem.unit === 'L'
      && problem.explanation.includes(`V=nRT/P=${amount}×${idealGasConstantKPaLiters}×${temperature}/${pressure}=${formatMoleAnswer(expected)} L`);
  },
  stoichiometry: problem => {
    const [, sourceCoefficient, targetCoefficient, amount] = problem.explanation.match(/係数比 .+=(\d+):(\d+) より、([\d.]+)×/);
    return Math.abs(problem.answer - (Number(amount) * Number(targetCoefficient)) / Number(sourceCoefficient)) < 1e-12;
  },
  'limiting-reagent': problem => {
    const match = problem.explanation.match(/([\d.]+)\/(\d+)=([\d.]+)、.*?([\d.]+)\/(\d+)=([\d.]+)。([\s\S]*?)生成量は ([\d.]+)×(\d+)=([\d.]+) mol。/);
    if (!match) return false;
    const [, amountA, coefficientA, ratioA, amountB, coefficientB, ratioB, limitingExplanation, limitingAmount, productCoefficient, answer] = match;
    const expectedRatioA = Number(amountA) / Number(coefficientA);
    const expectedRatioB = Number(amountB) / Number(coefficientB);
    const minimum = Math.min(expectedRatioA, expectedRatioB);
    const equalRatios = Math.abs(expectedRatioA - expectedRatioB) < 1e-12;
    const expectedLimitingReactant = expectedRatioA < expectedRatioB
      ? problem.question.match(/。(.+?) [\d.]+ mol と/)?.[1]
      : problem.question.match(/と (.+?) [\d.]+ mol を/)?.[1];
    return Math.abs(Number(ratioA) - expectedRatioA) < 1e-12
      && Math.abs(Number(ratioB) - expectedRatioB) < 1e-12
      && Math.abs(Number(limitingAmount) - minimum) < 1e-12
      && (equalRatios
        ? limitingExplanation.includes('両方とも過不足なく反応する共制限試薬です。')
        : limitingExplanation.includes(`小さい ${expectedLimitingReactant} が制限試薬です。`))
      && Math.abs(problem.answer - minimum * Number(productCoefficient)) < 1e-12
      && Math.abs(Number(answer) - problem.answer) < 1e-12;
  },
  'excess-reagent': problem => {
    const expectedByReaction = {
      '2H₂ + O₂ → 2H₂O': [0.5, 0],
      'N₂ + 3H₂ → 2NH₃': 0.5,
      '4Fe + 3O₂ → 2Fe₂O₃': 0.75,
      '2Al + 3Cl₂ → 2AlCl₃': 0.6,
      'CaCO₃ + 2HCl → CaCl₂ + CO₂ + H₂O': 0.1,
    };
    const equation = problem.question.split('。')[0];
    const expected = expectedByReaction[equation];
    return expected !== undefined
      && (Array.isArray(expected) ? expected.some(value => Math.abs(value - problem.answer) < 1e-12) : Math.abs(expected - problem.answer) < 1e-12)
      && problem.unit === 'mol'
      && (Math.abs(problem.answer) < 1e-12 ? problem.explanation.includes('共制限試薬') && problem.explanation.includes('残量は 0 mol')
        : problem.explanation.includes(`${formatMoleAnswer(problem.answer)} mol 残る`));
  },
  ph: problem => {
    const [, superscript] = problem.question.match(/10⁻([¹²³⁴⁵]) mol\/L/);
    const power = { '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5 }[superscript];
    return problem.answer === Number(power) && problem.question.includes('水素イオン濃度')
      && problem.question.includes('強酸水溶液')
      && problem.explanation.includes(`pH=−log₁₀[H⁺]=${power}`);
  },
  strongBasePh: problem => {
    const [, superscript] = problem.question.match(/10⁻([¹²³⁴⁵]) mol\/L/);
    const pOH = { '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5 }[superscript];
    const expected = 14 - Number(pOH);
    return problem.answer === expected && problem.question.includes('水酸化物イオン濃度')
      && problem.question.includes('強塩基水溶液')
      && problem.explanation.includes(`pOH=−log₁₀[OH⁻]=${pOH}`)
      && problem.explanation.includes(`pH=14−${pOH}=${expected}`);
  },
  yield: problem => {
    const [, theoretical, actual] = problem.question.match(/理論上 ([\d.]+) g .*? ([\d.]+) g 得た/);
    return Math.abs(problem.answer - (Number(actual) / Number(theoretical)) * 100) < 1e-12;
  },
};

for (const pattern of molePatterns) {
  const variants = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateMoleProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || problem.unit !== expectedUnits[pattern] || !checks[pattern](problem)) throw new Error(`formula, unit, or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    verifyDisplayedReactionMatchesCalculation(problem);
    variants.add(problem.question);
  }
  const expectedVariants = ['limiting-reagent', 'excess-reagent'].includes(pattern) ? 6 : 5;
  if (variants.size !== expectedVariants) throw new Error(`${pattern} generated ${variants.size}/${expectedVariants} expected variants`);
}

if (formatMoleAnswer(0.30000000000000004) !== '0.3') throw new Error('answer feedback should show a readable rounded value');
if (!isMoleAnswerCorrect('0.666667', 2 / 3)) throw new Error('answers rounded to the displayed six-decimal precision should be accepted');
if (!isMoleAnswerCorrect(String(2 / 3), 2 / 3)) throw new Error('full-precision mole answers should be accepted');
if (!isMoleAnswerCorrect('0.6666666667', 2 / 3)) throw new Error('more precise mole answers should be accepted');
if (isMoleAnswerCorrect('0.666', 2 / 3)) throw new Error('answers rounded too coarsely should not be accepted');
if (isMoleAnswerCorrect('', 1) || isMoleAnswerCorrect('Infinity', 1)) throw new Error('empty and non-finite answers should be rejected');

const learningPortal = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/page.tsx'), 'utf8');
if (!/slug: 'concentration-visual'[\s\S]*?practiceLink: '\/learn\/chemistry\/mole-calculation-drill'/.test(learningPortal)) {
  throw new Error('molar concentration visual should link to its related calculation drill');
}
if (!drillPage.includes('href="/learn/chemistry/concentration-visual"')
  || !drillPage.includes('モル濃度・希釈をビジュアルで確認')) {
  throw new Error('mole calculation practice should link back to its molar concentration visual');
}
const acidBasePage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/acid-base/page.tsx'), 'utf8');
if (!drillPage.includes('href="/learn/chemistry/acid-base"')
  || !acidBasePage.includes('href="/learn/chemistry/mole-calculation-drill"')
  || !acidBasePage.includes('pOH=−log[OH⁻] と pH+pOH=14（25℃）')) {
  throw new Error('strong-acid/base pH calculation practice and the indicator visual must cross-link and explain the pOH relation');
}
const idealGasVisual = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/ideal-gas-visual/page.tsx'), 'utf8');
const moleConceptVisual = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/chemistry/mole-concept-visual/page.tsx'), 'utf8');
if (!drillPage.includes('href="/learn/chemistry/ideal-gas-visual"')
  || !idealGasVisual.includes('href="/learn/chemistry/mole-calculation-drill"')
  || !idealGasVisual.includes('href="/learn/chemistry/mole-concept-visual"')
  || !moleConceptVisual.includes('href="/learn/chemistry/ideal-gas-visual"')
  || !idealGasVisual.includes('aria-label="気体の圧力"')
  || !idealGasVisual.includes('aria-label="気体の絶対温度"')
  || !idealGasVisual.includes('PV=nRT')) {
  throw new Error('ideal-gas visual must link to related calculations and mole visual, and expose named P/T controls and PV=nRT');
}

for (const amount of [0.5, 1, 1.5]) {
  for (const pressure of [80, 101.3, 120]) {
    for (const temperature of [250, 273, 350]) {
      const volume = calculateIdealGasVolume(amount, pressure, temperature);
      const recoveredAmount = calculateIdealGasAmount(pressure, volume, temperature);
      if (Math.abs(recoveredAmount - amount) > 1e-12) {
        throw new Error(`PV=nRT round-trip mismatch at n=${amount}, P=${pressure}, T=${temperature}`);
      }
    }
  }
}
if (Math.abs(calculateIdealGasVolume(1, 101.3, 273) - 22.4) > 0.02) {
  throw new Error('ideal-gas equation at 0°C and 101.3 kPa should agree with the 22.4 L/mol standard-state approximation');
}
for (const invalid of [[0, 101, 273], [1, 0, 273], [1, 101, -1]]) {
  let rejected = false;
  try { calculateIdealGasVolume(...invalid); } catch (error) { rejected = error instanceof RangeError; }
  if (!rejected) throw new Error(`invalid ideal-gas input was not rejected: ${invalid}`);
}

const mixedProblems = Array.from({ length: molePatterns.length * 100 }, () => generateMoleProblem('mix', stableRandom));
for (const problem of mixedProblems) {
  if (!checks[problem.pattern](problem) || problem.unit !== expectedUnits[problem.pattern]) {
    throw new Error(`mixed chemistry question failed its pattern-specific formula check: ${JSON.stringify(problem)}`);
  }
  verifyDisplayedReactionMatchesCalculation(problem);
}
const mixed = mixedProblems.map(problem => problem.pattern);
for (let start = 0; start + molePatterns.length <= mixed.length; start += molePatterns.length) {
  if (new Set(mixed.slice(start, start + molePatterns.length)).size !== molePatterns.length) throw new Error(`mixed set omitted a chemistry pattern in batch ${start / molePatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed chemistry practice repeated adjacent patterns');
console.log(`Chemistry mole calculations verified: ${molePatterns.length * 500} fixed-pattern and ${mixedProblems.length} mixed questions across ${molePatterns.length} patterns; formula, unit, answer, reaction-balance, gas-law round-trip, variant, batch-balance and adjacency checks passed.`);
