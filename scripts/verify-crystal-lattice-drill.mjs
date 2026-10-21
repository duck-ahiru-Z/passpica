import { readFileSync } from 'node:fs';
import {
  crystalLatticePatterns,
  formatCrystalLatticeAnswer,
  generateCrystalLatticeProblem,
  isCrystalLatticeAnswerCorrect,
} from '../src/lib/crystalLatticeDrill.ts';

const drillPage = readFileSync('src/app/learn/chemistry/crystal-lattice-drill/page.tsx', 'utf8');
const learnPortal = readFileSync('src/app/learn/page.tsx', 'utf8');
const drillPortal = readFileSync('src/app/drill/page.tsx', 'utf8');
if (!drillPage.includes('実戦練習：結晶格子 全パターンランダム') || !drillPage.includes("mode === 'mix' ?")
  || !drillPage.includes('基礎練習：{crystalLatticeLabels[mode]}に固定して繰り返します。')) {
  throw new Error('crystal lattice drills must provide both focused patterns and strategy-selection mixed mode');
}
if (!learnPortal.includes("practiceLink: '/learn/chemistry/crystal-lattice-drill'")
  || !drillPortal.includes("link: '/learn/chemistry/crystal-lattice-drill'")) {
  throw new Error('crystal-lattice visual and drill must be connected from their portals');
}

const stableRandom = (() => {
  let state = 0x12345678;
  return () => {
    state = (Math.imul(state ^ (state >>> 15), state | 1) + 0x6d2b79f5) | 0;
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };
})();

function independentAnswer(problem) {
  const bcc = problem.structure === 'bcc';
  switch (problem.pattern) {
    case 'atomCount': return bcc ? 8 / 8 + 1 : 8 / 8 + 6 / 2;
    case 'coordination': return bcc ? 8 : 12;
    case 'packing': return bcc ? 68 : 74;
    case 'latticeConstant': {
      const radius = Number(problem.question.match(/r=([\d.]+) Å/)[1]);
      return bcc ? 4 * radius / Math.sqrt(3) : 4 * radius / Math.sqrt(2);
    }
    case 'atomicRadius': {
      const latticeConstant = Number(problem.question.match(/a=([\d.]+) Å/)[1]);
      return bcc ? Math.sqrt(3) * latticeConstant / 4 : Math.sqrt(2) * latticeConstant / 4;
    }
    case 'density': {
      const [, molarMass, latticeConstant] = problem.question.match(/質量 ([\d.]+) g\/mol、格子定数 ([\d.]+) Å/);
      const atoms = bcc ? 2 : 4;
      return atoms * Number(molarMass) / (6.02214076e23 * (Number(latticeConstant) * 1e-8) ** 3);
    }
  }
}

for (const pattern of crystalLatticePatterns) {
  const structures = new Set();
  for (let i = 0; i < 700; i += 1) {
    const problem = generateCrystalLatticeProblem(pattern, stableRandom);
    structures.add(problem.structure);
    if (problem.pattern !== pattern || Math.abs(problem.answer - independentAnswer(problem)) > 1e-10
      || !problem.explanation.includes(formatCrystalLatticeAnswer(problem.answer, problem.decimals))) {
      throw new Error(`formula, answer, or explanation mismatch for ${pattern}: ${JSON.stringify(problem)}`);
    }
  }
  if (structures.size !== 2) throw new Error(`fixed pattern ${pattern} should exercise both BCC and FCC structures`);
}

const mixed = Array.from({ length: 1200 }, () => generateCrystalLatticeProblem('mix', stableRandom));
for (let start = 0; start < mixed.length; start += crystalLatticePatterns.length) {
  if (new Set(mixed.slice(start, start + crystalLatticePatterns.length).map(problem => problem.pattern)).size !== crystalLatticePatterns.length) {
    throw new Error(`mixed set omitted a crystal pattern in batch ${start / crystalLatticePatterns.length}`);
  }
}
if (mixed.some((problem, index) => index > 0 && problem.pattern === mixed[index - 1].pattern)) throw new Error('mixed crystal practice repeated adjacent patterns');
if (!isCrystalLatticeAnswerCorrect(formatCrystalLatticeAnswer(Math.sqrt(2), 3), Math.sqrt(2), 3)
  || isCrystalLatticeAnswerCorrect('1.414', 1.415, 3)
  || isCrystalLatticeAnswerCorrect('', 1)
  || isCrystalLatticeAnswerCorrect('Infinity', 1)) {
  throw new Error('crystal answer validation must match displayed precision and reject invalid values');
}

console.log('Crystal lattice drill verified: 4,200 fixed and 1,200 mixed questions; BCC/FCC atom counts, coordination, packing, radius/edge equations, densities, balanced coverage, and portal links checked.');
