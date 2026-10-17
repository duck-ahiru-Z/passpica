import { generateMoleProblem, molePatterns } from '../src/lib/chemistryMoleCalculation.ts';

const stableRandom = () => 0.37;
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
  ph: problem => {
    const [, power] = problem.question.match(/10⁻(\d+) mol\/L/);
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
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    variants.add(problem.question);
  }
  if (variants.size !== 5) throw new Error(`${pattern} generated ${variants.size}/5 expected variants`);
}

const mixed = Array.from({ length: 700 }, () => generateMoleProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += molePatterns.length) {
  if (new Set(mixed.slice(start, start + molePatterns.length)).size !== molePatterns.length) throw new Error(`mixed set omitted a chemistry pattern in batch ${start / molePatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed chemistry practice repeated adjacent patterns');
console.log('Chemistry mole calculations verified: 3,500 fixed-pattern questions and 700 mixed questions; formulas, answer keys, variant coverage, balance, and adjacency checked.');
