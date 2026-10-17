import { formatMotionAnswer, generateMotionProblem, motionPatterns } from '../src/lib/physicsMotionCalculation.ts';

const stableRandom = () => 0.37;
const checks = {
  speed: problem => {
    const [, distance, time] = problem.question.match(/([\d.]+) m を ([\d.]+) s/);
    return Math.abs(problem.answer - Number(distance) / Number(time)) < 1e-12 && problem.unit === 'm/s'
      && problem.question.includes('平均の速さ') && problem.explanation.startsWith('平均の速さ=');
  },
  acceleration: problem => {
    const [, initial, final, time] = problem.question.match(/([\d.]+) m\/s から ([\d.]+) m\/s に ([\d.]+) s/);
    return Math.abs(problem.answer - (Number(final) - Number(initial)) / Number(time)) < 1e-12 && problem.unit === 'm/s²';
  },
  freefall: problem => {
    const [, time, gravity] = problem.question.match(/の (\d+(?:\.\d+)?) s 後.*g=([\d.]+)/);
    return Math.abs(problem.answer - Number(time) * Number(gravity)) < 1e-12 && problem.unit === 'm/s';
  },
  work: problem => {
    const [, force, angle, distance] = problem.question.match(/([\d.]+) N の力を、移動方向に対して (\d+)° の向きに加え、物体が ([\d.]+) m/);
    const exactCosine = { 0: 1, 60: 0.5, 90: 0, 180: -1 }[Number(angle)];
    const expected = Number(force) * Number(distance) * exactCosine;
    return problem.answer === expected && problem.unit === 'J' && problem.explanation.includes(`${expected} J`);
  },
  momentum: problem => {
    const [, mass, velocity] = problem.question.match(/質量 ([\d.]+) kg .*? ([\d.]+) m\/s/);
    return Math.abs(problem.answer - Number(mass) * Number(velocity)) < 1e-12 && problem.unit === 'kg·m/s';
  },
  kineticEnergy: problem => {
    const [, mass, velocity] = problem.question.match(/質量 ([\d.]+) kg .*? ([\d.]+) m\/s/);
    return Math.abs(problem.answer - 0.5 * Number(mass) * Number(velocity) ** 2) < 1e-12 && problem.unit === 'J';
  },
  spring: problem => {
    const [, constant, extension] = problem.question.match(/ばね定数 ([\d.]+) N\/m のばねを ([\d.]+) m/);
    return Math.abs(problem.answer - Number(constant) * Number(extension)) < 1e-12 && problem.unit === 'N';
  },
};

if (formatMotionAnswer(30.000000000000007) !== '30' || formatMotionAnswer(2.4492935982947064e-15) !== '0') {
  throw new Error('answer display should hide floating-point noise');
}

for (const pattern of motionPatterns) {
  const questions = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateMotionProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem) || !problem.explanation.trim()) throw new Error(`formula, unit, or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    questions.add(problem.question);
  }
  if (questions.size !== 5) throw new Error(`${pattern} generated ${questions.size}/5 expected variants`);
}

const mixed = Array.from({ length: 700 }, () => generateMotionProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += motionPatterns.length) {
  if (new Set(mixed.slice(start, start + motionPatterns.length)).size !== motionPatterns.length) throw new Error(`mixed set omitted a mechanics pattern in batch ${start / motionPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed mechanics practice repeated adjacent patterns');
console.log('Physics mechanics verified: 3,500 fixed-pattern questions and 700 mixed questions; formulas, units, answer keys, variants, balance, and adjacency checked.');
