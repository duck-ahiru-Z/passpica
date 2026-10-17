import { generateInformationProblem, informationPatterns } from '../src/lib/informationCalculation.ts';

const stableRandom = () => 0.37;
const checks = {
  binary: problem => {
    const [, decimal] = problem.question.match(/10進数の (\d+)/);
    return problem.answer === Number(decimal).toString(2) && problem.unit === '2進数'
      && problem.explanation.includes(`${decimal}=`) && problem.explanation.includes(`${problem.answer}₂`);
  },
  data: problem => {
    const [, width, height, bits] = problem.question.match(/(\d+)×(\d+)画素、(\d+) bit/);
    return Number(problem.answer) === (Number(width) * Number(height) * Number(bits)) / 8 && problem.unit === 'byte';
  },
  transfer: problem => {
    const [, size, rate] = problem.question.match(/([\d.]+) MB .*? ([\d.]+) Mbps/);
    const seconds = (Number(size) * 8) / Number(rate);
    return Number(problem.answer) === seconds && problem.unit === '秒' && problem.question.includes('1 Mbps=10⁶ bit/s')
      && problem.explanation.includes(`${Number(size) * 8} Mbit`) && problem.explanation.includes(`${Number(rate)} Mbps=${seconds} s`);
  },
  logic: problem => {
    const [, a, b, operation] = problem.question.match(/A=(\d)、B=(\d) のとき、(.+) の値/);
    const left = Number(a); const right = Number(b);
    const expected = operation === 'A AND (NOT B)' ? Number(Boolean(left && !right))
      : operation === 'A OR (NOT B)' ? Number(Boolean(left || !right))
        : Number(Boolean(left !== right));
    return Number(problem.answer) === expected && problem.unit === '';
  },
  sampling: problem => {
    const [, khz, bits, channels] = problem.question.match(/(\d+(?:\.\d+)?) kHz、量子化ビット数 (\d+) bit、(ステレオ2 ch|モノラル1 ch)/);
    const channelCount = channels === 'ステレオ2 ch' ? 2 : 1;
    return Number(problem.answer) === (Number(khz) * 1000 * Number(bits) * channelCount) / 8 && problem.unit === 'byte'
      && problem.question.includes('非圧縮PCM') && problem.question.includes('1 byte=8 bit')
      && problem.explanation.includes('標本数×量子化ビット数×チャンネル数');
  },
  compression: problem => {
    const [, original, compressed] = problem.question.match(/元データ ([\d.]+) MB を ([\d.]+) MB/);
    return Number(problem.answer) === (Number(compressed) / Number(original)) * 100 && problem.unit === '%';
  },
  complement: problem => {
    const [, bits] = problem.question.match(/で、([01]{8})₂/);
    const unsigned = Number.parseInt(bits, 2);
    const expected = bits[0] === '1' ? unsigned - 256 : unsigned;
    return Number(problem.answer) === expected && problem.unit === ''
      && (expected < 0
        ? problem.explanation.includes(`${bits}₂=${unsigned}`) && problem.explanation.includes(`${unsigned}−256=${expected}`)
        : problem.explanation.includes(`${bits}₂=`) && problem.explanation.includes(`=${expected}。`));
  },
};

for (const pattern of informationPatterns) {
  const questions = new Set();
  for (let index = 0; index < 500; index += 1) {
    const problem = generateInformationProblem(pattern, stableRandom);
    if (problem.pattern !== pattern || !checks[pattern](problem)) throw new Error(`formula or answer mismatch in ${pattern}: ${JSON.stringify(problem)}`);
    questions.add(problem.question);
  }
  if (questions.size !== 5) throw new Error(`${pattern} generated ${questions.size}/5 expected variants`);
}

const mixed = Array.from({ length: 700 }, () => generateInformationProblem('mix', stableRandom).pattern);
for (let start = 0; start < mixed.length; start += informationPatterns.length) {
  if (new Set(mixed.slice(start, start + informationPatterns.length)).size !== informationPatterns.length) throw new Error(`mixed set omitted a calculation pattern in batch ${start / informationPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed information practice repeated adjacent patterns');
console.log('Information calculations verified: 3,500 fixed-pattern questions and 700 mixed questions; conversions, formulas, logic, signed values, variants, balance, and adjacency checked.');
