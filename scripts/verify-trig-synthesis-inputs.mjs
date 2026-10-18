import { parseStrictPositiveInteger } from '../src/lib/strictPositiveInteger.ts';
import { generateTrigSynthesisProblem } from '../src/lib/trigSynthesis.ts';

const cases = [
  ['2', false, 2],
  [' 13 ', false, 13],
  ['0007', false, 7],
  ['', true, 1],
  ['', false, null],
  ['2.5', false, null],
  ['1.0', false, null],
  ['1e0', false, null],
  ['+2', false, null],
  ['-2', false, null],
  ['0', false, null],
  ['1e100', false, null],
  ['abc', false, null],
];

for (const [value, blankMeansOne, expected] of cases) {
  const actual = parseStrictPositiveInteger(value, blankMeansOne);
  if (actual !== expected) {
    throw new Error(`parseStrictPositiveInteger(${JSON.stringify(value)}, ${blankMeansOne}) returned ${actual}; expected ${expected}`);
  }
}

console.log(`Trigonometric synthesis input validation verified: ${cases.length} cases`);

const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
for (const pattern of patterns) {
  for (let i = 0; i < 500; i += 1) {
    const randomValues = [(i % 4) / 4, (i % 5) / 5, (i % 2) / 2, (i % 3) / 3];
    let randomIndex = 0;
    const problem = generateTrigSynthesisProblem(pattern, () => randomValues[randomIndex++ % randomValues.length]);
    const x = problem.a.sign * problem.a.c * Math.sqrt(problem.a.d);
    const y = problem.b.sign * problem.b.c * Math.sqrt(problem.b.d);
    const radius = Math.hypot(x, y);
    const expectedRadius = problem.rOuter * Math.sqrt(problem.rInner);
    if (Math.abs(radius - expectedRadius) > 1e-10) throw new Error(`${pattern}: displayed radius does not match coefficients`);
    if (pattern === 'pattern4') {
      if (Math.abs(x / radius - Number(problem.ansCos.split('/')[0]) / Number(problem.ansCos.split('/')[1])) > 1e-10) throw new Error(`${pattern}: cos alpha is inconsistent`);
      if (Math.abs(y / radius - Number(problem.ansSin.split('/')[0]) / Number(problem.ansSin.split('/')[1])) > 1e-10) throw new Error(`${pattern}: sin alpha is inconsistent`);
    } else {
      const alphaMatch = problem.ansAlpha.match(/^(-?)(\d*)pi\/(\d+)$/);
      if (!alphaMatch) throw new Error(`${pattern}: unsupported generated angle ${problem.ansAlpha}`);
      const angleValue = (alphaMatch[1] === '-' ? -1 : 1) * Number(alphaMatch[2] || 1) * Math.PI / Number(alphaMatch[3]);
      if (Math.abs(x / radius - Math.cos(angleValue)) > 1e-10 || Math.abs(y / radius - Math.sin(angleValue)) > 1e-10) {
        throw new Error(`${pattern}: answer angle does not match coefficients (${problem.qStr}, ${problem.ansAlpha})`);
      }
    }
    const coefficientText = (term) => `${term.sign === -1 ? '-' : ''}${term.c === 1 && term.d === 1 ? '1' : term.c === 1 ? '' : term.c}${term.d === 1 ? '' : `\\sqrt{${term.d}}`}`;
    const aCoefficient = coefficientText(problem.a);
    const expectedA = `${aCoefficient === '1' ? '' : aCoefficient}\\sin\\theta`;
    const bCoefficient = coefficientText({ ...problem.b, sign: 1 });
    const expectedB = `${problem.b.sign === -1 ? '-' : '+'}${bCoefficient === '1' ? '' : bCoefficient}\\cos\\theta`;
    const expectedExpression = `${expectedA} ${expectedB}`;
    const normalizedExpression = problem.qStr.replaceAll(' ', '');
    if (normalizedExpression !== expectedExpression.replaceAll(' ', '')) throw new Error(`${pattern}: displayed expression lost/misplaced a coefficient (${problem.qStr})`);
  }
}
console.log('Trigonometric synthesis generation verified: 2,000 consistent problems across all patterns');
