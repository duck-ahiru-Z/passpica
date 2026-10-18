import fs from 'node:fs';
import path from 'node:path';
import { getQuadraticInequalityAnswerType, getQuadraticInequalityRegion, parseQuadraticInequalityFraction, reverseQuadraticInequalitySign } from '../src/lib/quadraticInequality.ts';
import { generateQuadraticInequalityProblem } from '../src/lib/quadraticInequalityProblems.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/math/quadratic-inequality-drill/page.tsx'), 'utf8');
if (!/role="img"\s+aria-label=\{graphDescription\}/.test(drillPage)) {
  throw new Error('quadratic-inequality graph must provide an accessible description of the curve and solution region');
}
if (!drillPage.includes('Math.abs(problem.a) === 1 ?')) {
  throw new Error('repeated-root explanation must show the positive square after normalizing a negative leading coefficient');
}
if (!drillPage.includes('const normalizedSign = problem.a < 0 ? reverseQuadraticInequalitySign(problem.ineqSign) : problem.ineqSign;') || !drillPage.includes("problem.a < 0 ? '変形後の式' : '左辺'")) {
  throw new Error('negative-leading-coefficient explanations must consistently describe the normalized quadratic and inequality');
}
for (const [sign, boundary, side] of [['<', '0未満', '下'], ['\\le', '0以下', '下'], ['>', '0より大きい（0超）', '上'], ['\\ge', '0以上', '上']]) {
  const region = getQuadraticInequalityRegion(sign);
  if (region.boundary !== boundary || region.side !== side) throw new Error(`incorrect strict/non-strict region wording for ${sign}`);
}
for (const [sign, reversed] of [['<', '>'], ['>', '<'], ['\\le', '\\ge'], ['\\ge', '\\le']]) {
  if (reverseQuadraticInequalitySign(sign) !== reversed) throw new Error(`inequality direction was not reversed correctly for ${sign}`);
}

for (const invalid of [['1.5', ''], ['1abc', ''], ['1', '2.5'], ['1', '0'], ['', '1']]) {
  if (parseQuadraticInequalityFraction(...invalid) !== null) {
    throw new Error(`invalid fraction was accepted: ${invalid.join('/')}`);
  }
}
for (const [input, expected] of [[['2', '4'], { num: 1, den: 2 }], [['-3', '-6'], { num: 1, den: 2 }], [['+5', ''], { num: 5, den: 1 }]]) {
  const parsed = parseQuadraticInequalityFraction(...input);
  if (!parsed || parsed.num !== expected.num || parsed.den !== expected.den) {
    throw new Error(`valid fraction parsed incorrectly: ${input.join('/')} -> ${JSON.stringify(parsed)}`);
  }
}

const signs = ['<', '>', '\\le', '\\ge'];
const patterns = ['pattern1', 'pattern2', 'pattern3', 'pattern4'];
const answerMatches = (type, x, first, second) => {
  switch (type) {
    case 1: return first < x && x < second;
    case 2: return x < first || second < x;
    case 3: return first <= x && x <= second;
    case 4: return x <= first || second <= x;
    case 5: return x === first;
    case 6: return x !== first;
    case 7: return true;
    case 8: return false;
  }
};
const satisfies = (value, sign) => sign === '<' ? value < 0 : sign === '>' ? value > 0 : sign === '\\le' ? value <= 0 : value >= 0;

let randomState = 0x65c12026;
const seededRandom = () => {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState / 0x100000000;
};

function verifyGeneratedProblem(problem, expectedPattern) {
  if (problem.pattern !== expectedPattern || !problem.eq.endsWith(`${problem.ineqSign} 0`) || problem.a === 0) {
    throw new Error(`invalid generated problem metadata: ${JSON.stringify(problem)}`);
  }
  const discriminant = problem.b ** 2 - 4 * problem.a * problem.c;
  if (problem.ansType !== getQuadraticInequalityAnswerType(problem.a, discriminant, problem.ineqSign)) {
    throw new Error(`generated answer classification mismatch: ${JSON.stringify(problem)}`);
  }
  if (problem.pattern === 'pattern1' && problem.a !== 1) throw new Error('pattern1 must be monic');
  if (problem.pattern === 'pattern2' && problem.a !== -1) throw new Error('pattern2 must have a negative leading coefficient');
  if (problem.pattern === 'pattern3' && problem.a <= 1) throw new Error('pattern3 must use a non-unit positive leading coefficient');
  if (problem.pattern === 'pattern4' && (discriminant !== 0 || problem.b === 0 || problem.c === 0)) throw new Error('pattern4 must be a full repeated-root quadratic');

  const rootValues = problem.roots.map(root => root.num / root.den);
  if (problem.pattern === 'pattern4') {
    if (rootValues.length !== 1) throw new Error('pattern4 must expose one repeated root');
  } else if (rootValues.length !== 2 || !(rootValues[0] < rootValues[1]) || discriminant <= 0) {
    throw new Error(`two-root pattern has invalid roots: ${JSON.stringify(problem)}`);
  }
  for (const root of rootValues) {
    const value = problem.a * root ** 2 + problem.b * root + problem.c;
    if (Math.abs(value) > 1e-9) throw new Error(`listed root does not solve polynomial: ${JSON.stringify(problem)}`);
  }

  const probes = rootValues.length === 1
    ? [rootValues[0] - 1, rootValues[0], rootValues[0] + 1]
    : [rootValues[0] - 1, rootValues[0], (rootValues[0] + rootValues[1]) / 2, rootValues[1], rootValues[1] + 1];
  for (const x of probes) {
    const polynomial = problem.a * x ** 2 + problem.b * x + problem.c;
    const actual = Math.abs(polynomial) < 1e-9
      ? problem.ineqSign === '\\le' || problem.ineqSign === '\\ge'
      : satisfies(polynomial, problem.ineqSign);
    if (answerMatches(problem.ansType, x, rootValues[0], rootValues.at(-1)) !== actual) {
      throw new Error(`generated answer does not solve polynomial at x=${x}: ${JSON.stringify(problem)}`);
    }
  }
}

for (const pattern of patterns) {
  const observedSigns = new Set();
  for (let index = 0; index < 2500; index += 1) {
    const problem = generateQuadraticInequalityProblem(pattern, seededRandom);
    verifyGeneratedProblem(problem, pattern);
    observedSigns.add(problem.ineqSign);
  }
  if (observedSigns.size !== signs.length) throw new Error(`${pattern} did not produce every inequality sign`);
}

const mixedProblems = Array.from({ length: 20000 }, () => generateQuadraticInequalityProblem('mix', seededRandom));
const mixedPatterns = mixedProblems.map(problem => problem.pattern);
for (const problem of mixedProblems) verifyGeneratedProblem(problem, problem.pattern);
for (let index = 0; index < mixedPatterns.length; index += patterns.length) {
  if (new Set(mixedPatterns.slice(index, index + patterns.length)).size !== patterns.length) {
    throw new Error(`mixed generator omitted a pattern in batch ${index / patterns.length}`);
  }
}
if (mixedPatterns.some((pattern, index) => index > 0 && pattern === mixedPatterns[index - 1])) throw new Error('mixed generator repeated adjacent patterns');

let cases = 0;
for (const a of [-7, -3, -1, 1, 2, 5, 9]) {
  for (const sign of signs) {
    for (let root = -8; root <= 8; root += 1) {
      const type = getQuadraticInequalityAnswerType(a, 0, sign);
      for (const x of [root - 2, root - 1, root, root + 1, root + 2]) {
        const actual = satisfies(a * (x - root) ** 2, sign);
        if (answerMatches(type, x, root, root) !== actual) throw new Error(`D=0 mismatch: a=${a}, root=${root}, sign=${sign}, x=${x}, type=${type}`);
        cases += 1;
      }
    }
    for (let first = -7; first <= 5; first += 1) {
      for (let second = first + 1; second <= 8; second += 1) {
        const type = getQuadraticInequalityAnswerType(a, a * a * (second - first) ** 2, sign);
        for (const x of [first - 2, first, (first + second) / 2, second, second + 2]) {
          const actual = satisfies(a * (x - first) * (x - second), sign);
          if (answerMatches(type, x, first, second) !== actual) throw new Error(`D>0 mismatch: a=${a}, roots=${first},${second}, sign=${sign}, x=${x}, type=${type}`);
          cases += 1;
        }
      }
    }
    for (const aValue of [-a, a]) {
      const type = getQuadraticInequalityAnswerType(aValue, -1, sign);
      for (const x of [-20, -3, 0, 4, 20]) {
        const actual = satisfies(aValue * (x * x + 1), sign);
        if (answerMatches(type, x, 0, 0) !== actual) throw new Error(`D<0 mismatch: a=${aValue}, sign=${sign}, x=${x}, type=${type}`);
        cases += 1;
      }
    }
  }
}

console.log(`Quadratic-inequality generation verified: 10,000 fixed-pattern and 20,000 mixed problems, plus ${cases.toLocaleString()} answer-region probes.`);
