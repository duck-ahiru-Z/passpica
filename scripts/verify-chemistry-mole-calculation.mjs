import fs from 'node:fs';
import path from 'node:path';
import { formatMoleAnswer, generateMoleProblem, isMoleAnswerCorrect, molePatterns } from '../src/lib/chemistryMoleCalculation.ts';

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
const expectedUnits = { mass: 'mol', concentration: 'mol/L', dilution: 'mL', gas: 'mol', stoichiometry: 'mol', 'limiting-reagent': 'mol', ph: '', yield: '%' };
const checks = {
  mass: problem => {
    const [, mass, molarMass] = problem.question.match(/([\d.]+) g.*?([\d.]+) g\/mol/);
    return Math.abs(problem.answer - Number(mass) / Number(molarMass)) < 1e-12;
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
  ph: problem => {
    const [, superscript] = problem.question.match(/10⁻([¹²³⁴⁵]) mol\/L/);
    const power = { '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5 }[superscript];
    return problem.answer === Number(power);
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
    variants.add(problem.question);
  }
  const expectedVariants = pattern === 'limiting-reagent' ? 6 : 5;
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

const mixed = Array.from({ length: 800 }, () => generateMoleProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += molePatterns.length) {
  if (new Set(mixed.slice(start, start + molePatterns.length)).size !== molePatterns.length) throw new Error(`mixed set omitted a chemistry pattern in batch ${start / molePatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed chemistry practice repeated adjacent patterns');
console.log('Chemistry mole calculations verified: 4,000 fixed-pattern questions and 800 mixed questions; formulas, units, answer keys, variant coverage, balance, and adjacency checked.');
