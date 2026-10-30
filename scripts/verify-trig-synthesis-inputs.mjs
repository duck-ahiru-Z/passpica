import fs from 'node:fs';
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

const page = fs.readFileSync('src/app/learn/math/trig-synthesis-drill/page.tsx', 'utf8');
assertIncludes(page, 'role="img" aria-label={graphDescription}', 'coordinate graph must expose a dynamic text description');
for (const label of ['振幅の平方根の外側の係数', '振幅の平方根の内側の数', '偏角 alpha', 'cos alpha の値', 'sin alpha の値']) {
  assertIncludes(page, `aria-label="${label}"`, `answer controls must be named: ${label}`);
}

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) throw new Error(message);
}

let mixedSeed = 0x243f6a88;
const mixedRandom = () => {
  mixedSeed = (Math.imul(mixedSeed, 1664525) + 1013904223) >>> 0;
  return mixedSeed / 4294967296;
};
const mixedQuestions = Array.from({ length: 20_000 }, () => generateTrigSynthesisProblem('mix', mixedRandom));
const mixedCounts = new Map(['pattern1', 'pattern2', 'pattern3', 'pattern4'].map(pattern => [pattern, mixedQuestions.filter(question => question.pattern === pattern).length]));
if ([...mixedCounts.values()].some(count => count !== 5_000)) throw new Error(`Mixed pattern frequency is uneven: ${JSON.stringify(Object.fromEntries(mixedCounts))}`);
if (mixedQuestions.some((question, index) => index > 0 && question.pattern === mixedQuestions[index - 1].pattern)) throw new Error('Mixed trigonometric synthesis questions repeat adjacent patterns');
console.log('Trigonometric synthesis mixed mode verified: 20,000 generated questions, exactly 5,000 per pattern, no adjacent repeats.');
