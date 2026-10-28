import assert from 'node:assert/strict';
import { generateNumberRepresentationProblem, isNumberRepresentationAnswerCorrect, numberRepresentationPatterns } from '../src/lib/informationNumberRepresentationDrill.ts';

assert.deepEqual(numberRepresentationPatterns, ['unsigned', 'twosComplement', 'bitWeight', 'binaryDecimal', 'bitWidthRange'], 'focused choices and the balanced mixed scheduler must contain the complete pattern catalog');

const expected = {
  unsigned: [0, 1, 13, 42, 85, 127, 128, 200, 254, 255],
  twosComplement: [-128, -127, -56, -2, -1, 0, 13, 42, 85, 127],
  bitWeight: [1, 2, 4, 8, 16, 32, 64, 128],
  binaryDecimal: ['00000000', '00000001', '00001101', '00101010', '01010101', '01111111', '10000000', '11001000', '11111110', '11111111'],
  bitWidthRange: ['-8', '7', '0', '15', '5'],
};
for (const pattern of numberRepresentationPatterns) {
  const answers = new Set();
  for (let i = 0; i < 1000; i += 1) answers.add(generateNumberRepresentationProblem(pattern).answer);
  for (const answer of expected[pattern]) assert.ok(answers.has(String(answer)), `${pattern} never produced boundary/value ${answer}`);
}

const mixedPatterns = Object.fromEntries(numberRepresentationPatterns.map(pattern => [pattern, 0]));
let previousPattern = '';
for (let index = 0; index < 20_000; index += 1) {
  const problem = generateNumberRepresentationProblem('mix');
  mixedPatterns[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previousPattern, 'mixed practice must not repeat a pattern consecutively');
  previousPattern = problem.pattern;
}
for (const pattern of numberRepresentationPatterns) {
  assert.equal(mixedPatterns[pattern], 4_000, `${pattern} should appear once per five-pattern batch`);
}
const observedWeights = new Set();
for (let index = 0; index < 8; index += 1) {
  const problem = generateNumberRepresentationProblem('bitWeight', () => 0.25);
  const position = Number(problem.question.match(/右から(\d+)桁目/)?.[1]);
  assert.ok(position >= 1 && position <= 8, `invalid bit position: ${problem.question}`);
  assert.equal(problem.answer, String(2 ** (position - 1)));
  assert.equal(problem.pattern, 'bitWeight');
  observedWeights.add(problem.answer);
}
assert.deepEqual([...observedWeights].sort((a, b) => Number(a) - Number(b)), ['1', '2', '4', '8', '16', '32', '64', '128']);

const boundaryQuestions = [
  ['4 bitの符号付き2の補数で表せる整数の最小値はいくつか。', '-8'],
  ['4 bitの符号付き2の補数で表せる整数の最大値はいくつか。', '7'],
  ['4 bitの符号なしで表せる整数の最小値はいくつか。', '0'],
  ['4 bitの符号なしで表せる整数の最大値はいくつか。', '15'],
];
for (const [question, answer] of boundaryQuestions) {
  let found = false;
  for (let index = 0; index < 5000; index += 1) {
    const problem = generateNumberRepresentationProblem('bitWidthRange');
    if (problem.question === question) {
      assert.equal(problem.answer, answer);
      assert.ok(problem.explanation.includes(answer));
      assert.ok(problem.explanation.includes(question.includes('最小値') ? '最小値' : '最大値'), 'range explanation must identify the endpoint the question asks for');
      found = true;
      break;
    }
  }
  assert.ok(found, `missing bit-width boundary question: ${question}`);
}
for (let index = 0; index < 1000; index += 1) {
  const problem = generateNumberRepresentationProblem('bitWidthRange');
  if (problem.question.includes('必要な最小ビット数')) {
    const value = Number(problem.question.match(/−(\d+)〜/)?.[1]);
    const bits = Number(problem.answer);
    assert.ok(2 ** (bits - 1) >= value, `${bits} bits cannot hold ±${value}`);
    assert.ok(bits === 2 || 2 ** (bits - 2) <= value, `${bits} bits are not minimal for ±${value}`);
  } else {
    const [, width, kind, bound] = problem.question.match(/(\d+) bitの(符号付き2の補数|符号なし)で表せる整数の(最小値|最大値)/) ?? [];
    const expected = kind === '符号付き2の補数'
      ? (bound === '最小値' ? -(2 ** (Number(width) - 1)) : 2 ** (Number(width) - 1) - 1)
      : (bound === '最小値' ? 0 : 2 ** Number(width) - 1);
    assert.equal(Number(problem.answer), expected, 'bit-width range endpoint must match the encoding');
  }
}

const page = (await import('node:fs')).readFileSync('src/app/learn/information/number-representation-drill/page.tsx', 'utf8');
const packageScripts = JSON.parse((await import('node:fs')).readFileSync('package.json', 'utf8')).scripts;
assert.ok(packageScripts['test:information-number-representation-drill']?.includes('verify-information-number-representation-drill.mjs'), 'the focused/mixed number-representation verifier must have a dedicated npm script');
const minSigned = { pattern: 'twosComplement', question: '', answer: '-56', explanation: '' };
const integer42 = { pattern: 'unsigned', question: '', answer: '42', explanation: '' };
const binary = generateNumberRepresentationProblem('binaryDecimal', () => 0.1);
assert.ok(binary.question.includes('符号なし8 bit'), 'decimal-to-binary questions must state the unsigned encoding');
assert.ok(binary.explanation.includes('符号なし8 bit'), 'decimal-to-binary explanations must reinforce the selected encoding');
assert.equal(isNumberRepresentationAnswerCorrect(minSigned, '−56'), true, 'Unicode minus should be accepted for negative integers');
assert.equal(isNumberRepresentationAnswerCorrect(minSigned, '-57'), false, 'a neighboring negative integer must not pass');
assert.equal(isNumberRepresentationAnswerCorrect(binary, `0b${binary.answer}`), true, 'a conventional binary prefix should be accepted');
assert.equal(isNumberRepresentationAnswerCorrect(binary, `${binary.answer}₂`), true, 'a binary subscript should be accepted');
assert.equal(isNumberRepresentationAnswerCorrect(integer42, '42₂'), false, 'a binary subscript must not be stripped from an integer answer');
assert.equal(isNumberRepresentationAnswerCorrect(integer42, '4₂2'), false, 'a misplaced binary subscript must not turn malformed input into an integer answer');
assert.equal(isNumberRepresentationAnswerCorrect(binary, `${binary.answer.slice(0, 4)}₂${binary.answer.slice(4)}`), false, 'a binary subscript is only valid after all eight bits');
assert.equal(isNumberRepresentationAnswerCorrect(binary, `${binary.answer}₂₂`), false, 'duplicate binary subscripts must be rejected');
assert.equal(isNumberRepresentationAnswerCorrect(binary, binary.answer.slice(1)), false, 'binary answers must retain all eight bits');
assert.equal(isNumberRepresentationAnswerCorrect(binary, '00000002'), false, 'non-binary digits must be rejected');
assert.equal(isNumberRepresentationAnswerCorrect(binary, ''), false, 'empty answers must be rejected');
for (let byte = 0; byte <= 255; byte += 1) {
  const bits = byte.toString(2).padStart(8, '0');
  const unsignedProblem = { pattern: 'unsigned', answer: String(byte) };
  const signedProblem = { pattern: 'twosComplement', answer: String(byte >= 128 ? byte - 256 : byte) };
  const binaryProblem = { pattern: 'binaryDecimal', answer: bits };
  assert.equal(isNumberRepresentationAnswerCorrect(unsignedProblem, String(byte)), true, `unsigned byte ${bits} should decode`);
  assert.equal(isNumberRepresentationAnswerCorrect(signedProblem, String(byte >= 128 ? byte - 256 : byte)), true, `two's-complement byte ${bits} should decode`);
  assert.equal(isNumberRepresentationAnswerCorrect(binaryProblem, bits), true, `decimal-to-binary byte ${byte} should retain 8 bits`);
  assert.equal(isNumberRepresentationAnswerCorrect(binaryProblem, `0b${bits}`), true, `0b-prefixed byte ${byte} should be accepted`);
  assert.equal(isNumberRepresentationAnswerCorrect(binaryProblem, `${bits}₂`), true, `subscripted byte ${byte} should be accepted`);
  assert.equal(isNumberRepresentationAnswerCorrect(binaryProblem, bits.slice(1)), false, `short byte ${byte} must be rejected`);
}
assert.ok(page.includes('type="radio" name="number-representation-strategy"'), 'mixed practice must ask learners to identify the representation pattern');
assert.ok(page.includes("disabled={!answer.trim() || (mode === 'mix' && !strategy)}"), 'mixed answers must require a method choice and an answer');
assert.ok(page.includes('!strategyCorrect') && page.includes('!answerCorrect'), 'feedback must distinguish a wrong method from a wrong value');
assert.ok(page.includes('isNumberRepresentationAnswerCorrect(problem, answer)'), 'the page must use pattern-aware answer normalization');
assert.ok(page.includes("setStrategy(selectedMode === 'mix' ? '' : selectedMode)"), 'fixed practice should lock its method while mixed practice starts unselected');
assert.ok(!page.includes('符号なし2進数として読み、各桁の重みの和'), 'mixed pattern choice must not ask learners to distinguish duplicate unsigned-decoding and bit-weight questions');
assert.ok(page.includes('numberRepresentationPatterns.map(pattern => <option') && page.includes('numberRepresentationPatterns.map(pattern => <label'), 'focused and mixed mode must share the complete pattern catalog');

const counts = Object.fromEntries(numberRepresentationPatterns.map(pattern => [pattern, 0]));
for (let i = 0; i < 20_000; i += 1) {
  const problem = generateNumberRepresentationProblem('mix');
  counts[problem.pattern] += 1;
  assert.ok(problem.answer.length > 0);
}
for (const pattern of numberRepresentationPatterns) {
  assert.equal(counts[pattern], 4_000, `${pattern} should appear once per five-pattern batch`);
}

console.log('Number representation drill passed: all focused patterns and encoding boundaries generated; 20,000 mixed problems balanced with no adjacent pattern repeats.', counts);
