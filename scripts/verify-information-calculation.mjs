import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { generateInformationProblem, informationPatterns, informationStrategies, isInformationAnswerCorrect, logicOperations } from '../src/lib/informationCalculation.ts';

const drillPage = fs.readFileSync(path.join(process.cwd(), 'src/app/learn/information/calculation-drill/page.tsx'), 'utf8');
if (!/type="radio"\s+name="information-method"/.test(drillPage) || drillPage.includes('aria-pressed={method === pattern}')) {
  throw new Error('information method selection must be a single-choice radio group');
}
if (!drillPage.includes('onChange={() => { setMethod(strategy); setChecked(false); }}')
  || !drillPage.includes('setAnswer(event.target.value); setChecked(false);')
  || !drillPage.includes('role="status" aria-live="polite"')) {
  throw new Error('changing an information answer must clear stale feedback and announce new feedback');
}
if (!drillPage.includes("selectedMode.startsWith('logic:')") || !drillPage.includes("mode === 'mix' ? <fieldset") || !drillPage.includes('基礎練習：{informationModeLabels[mode]}に固定して繰り返します。')) {
  throw new Error('fixed information practice must lock its method while mixed practice asks learners to identify it');
}
if (!drillPage.includes('(mode !== \'mix\' || method === problem.strategy)')) {
  throw new Error('focused category practice must grade the answer without forcing a redundant method selection');
}

const stableRandom = () => 0.37;
assert.equal(isInformationAnswerCorrect('data', '2,764,800', '2764800'), true, 'valid thousands separators should be accepted');
assert.equal(isInformationAnswerCorrect('data', '2764800', '2764800'), true, 'unformatted exact numeric answers should be accepted');
for (const malformed of ['2,,764,800', '27,64800', '2,76,4800', '2 764 800', '2,764,800x']) {
  assert.equal(isInformationAnswerCorrect('data', malformed, '2764800'), false, `malformed numeric input should be rejected: ${malformed}`);
}
assert.equal(isInformationAnswerCorrect('binary', '101010', '101010'), true, 'exact binary answers should be accepted');
assert.equal(isInformationAnswerCorrect('binary', '10,1010', '101010'), false, 'binary answers should not silently discard separators');
assert.equal(isInformationAnswerCorrect('complement', '-5', '-5'), true, 'signed complement answers should remain accepted');
assert.equal(isInformationAnswerCorrect('complement', '-,5', '-5'), false, 'malformed signed answers should be rejected');
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
  storage: problem => {
    const [, amount, from, to] = problem.question.match(/^([\d.]+) (Mbit|MB|kB|GiB|MiB|KiB|GB|byte) を (Mbit|MB|kB|MiB|byte) に換算/);
    const multipliers = { 'Mbit:MB': 1 / 8, 'MB:kB': 1000, 'GiB:MiB': 1024, 'KiB:byte': 1024, 'GB:MB': 1000 };
    const relation = problem.question.match(/\。（(.+)\）$/)?.[1];
    const expected = Number(amount) * multipliers[`${from}:${to}`];
    return Number(problem.answer) === expected && problem.unit === to
      && relation !== undefined && problem.explanation.includes(relation)
      && problem.explanation.includes('SI接頭語') && problem.explanation.includes('2進接頭語');
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
    const expected = operation === 'A AND B' ? Number(Boolean(left && right))
      : operation === 'A OR B' ? Number(Boolean(left || right))
        : operation === 'A AND (NOT B)' ? Number(Boolean(left && !right))
          : operation === 'A OR (NOT B)' ? Number(Boolean(left || !right))
            : Number(Boolean(left !== right));
    const explanationMatches = operation === 'A XOR B'
      ? problem.explanation.includes(`A と B は${left === right ? '等しい' : '異なる'}ので、XOR（排他的論理和）は ${expected}。`)
      : operation.includes('NOT B')
        ? problem.explanation.includes(`NOT B=${1 - right}`) && problem.explanation.includes(`計算すると ${expected}`)
        : problem.explanation.includes(`${operation} を計算すると ${expected}。`);
    return Number(problem.answer) === expected && problem.unit === '' && explanationMatches;
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
  const expectedVariants = pattern === 'compression' ? 7 : pattern === 'logic' ? 20 : 5;
  if (questions.size !== expectedVariants) throw new Error(`${pattern} generated ${questions.size}/${expectedVariants} expected variants`);
}

for (const operation of logicOperations) {
  const seen = new Set();
  for (let index = 0; index < 160; index += 1) {
    const problem = generateInformationProblem(`logic:${operation}`, stableRandom);
    if (problem.pattern !== 'logic' || problem.strategy !== operation || !checks.logic(problem)) {
      throw new Error(`focused logic operation mismatch for ${operation}: ${JSON.stringify(problem)}`);
    }
    seen.add(problem.question);
  }
  if (seen.size !== 4) throw new Error(`${operation} focused practice generated ${seen.size}/4 truth-table cases`);
}

const compressionCases = new Map();
for (let index = 0; index < 140; index += 1) {
  const problem = generateInformationProblem('compression', stableRandom);
  const [, original, compressed] = problem.question.match(/元データ ([\d.]+) MB を ([\d.]+) MB/);
  compressionCases.set(`${original}:${compressed}`, Number(problem.answer));
}
if (compressionCases.get('10:10') !== 100) throw new Error('unchanged data must have a 100% compression ratio');
if (compressionCases.get('10:12') !== 120) throw new Error('expanded data must exceed 100% compression ratio');
if (compressionCases.get('12:3') !== 25) throw new Error('compressed data must use compressed/original × 100');

const mixed = Array.from({ length: 800 }, () => generateInformationProblem('mix', stableRandom).pattern);
for (let start = 0; start <= mixed.length - informationPatterns.length; start += informationPatterns.length) {
  if (new Set(mixed.slice(start, start + informationPatterns.length)).size !== informationPatterns.length) throw new Error(`mixed set omitted a calculation pattern in batch ${start / informationPatterns.length}`);
}
if (mixed.some((pattern, index) => index > 0 && pattern === mixed[index - 1])) throw new Error('mixed information practice repeated adjacent patterns');
const mixedLogic = Array.from({ length: 1200 }, () => generateInformationProblem('mix', stableRandom)).filter(problem => problem.pattern === 'logic');
for (const operation of logicOperations) {
  const count = mixedLogic.filter(problem => problem.strategy === operation).length;
  if (count < 20 || count > 40) throw new Error(`mixed logic operator ${operation} appeared ${count}/${mixedLogic.length} times`);
}
if (informationStrategies.filter(strategy => logicOperations.includes(strategy)).length !== 5) throw new Error('mixed strategy UI must expose each logic operator separately');
console.log('Information calculations verified: 4,000 category-focused, 800 mixed, 800 operator-focused questions, and 1,200 mixed questions for logic-operator balance; conversions, formulas, answer parsing, variants, and no-repeat scheduling checked.');
