import assert from 'node:assert/strict';
import { generateNumberRepresentationProblem, isNumberRepresentationAnswerCorrect, numberRepresentationPatterns } from '../src/lib/informationNumberRepresentationDrill.ts';

const expected = {
  unsigned: [0, 1, 13, 42, 85, 127, 128, 200, 254, 255],
  twosComplement: [-128, -127, -56, -2, -1, 0, 13, 42, 85, 127],
  bitWeight: [-128, -127, -56, -2, -1, 0, 13, 42, 85, 127],
  binaryDecimal: ['00000000', '00000001', '00001101', '00101010', '01010101', '01111111', '10000000', '11001000', '11111110', '11111111'],
};
for (const pattern of numberRepresentationPatterns) {
  const answers = new Set();
  for (let i = 0; i < 1000; i += 1) answers.add(generateNumberRepresentationProblem(pattern).answer);
  for (const answer of expected[pattern]) assert.ok(answers.has(String(answer)), `${pattern} never produced boundary/value ${answer}`);
}

const page = (await import('node:fs')).readFileSync('src/app/learn/information/number-representation-drill/page.tsx', 'utf8');
const minSigned = { pattern: 'twosComplement', question: '', answer: '-56', explanation: '' };
const binary = generateNumberRepresentationProblem('binaryDecimal', () => 0.1);
assert.equal(isNumberRepresentationAnswerCorrect(minSigned, '−56'), true, 'Unicode minus should be accepted for negative integers');
assert.equal(isNumberRepresentationAnswerCorrect(minSigned, '-57'), false, 'a neighboring negative integer must not pass');
assert.equal(isNumberRepresentationAnswerCorrect(binary, `0b${binary.answer}`), true, 'a conventional binary prefix should be accepted');
assert.equal(isNumberRepresentationAnswerCorrect(binary, `${binary.answer}₂`), true, 'a binary subscript should be accepted');
assert.equal(isNumberRepresentationAnswerCorrect(binary, binary.answer.slice(1)), false, 'binary answers must retain all eight bits');
assert.equal(isNumberRepresentationAnswerCorrect(binary, '00000002'), false, 'non-binary digits must be rejected');
assert.equal(isNumberRepresentationAnswerCorrect(binary, ''), false, 'empty answers must be rejected');
assert.ok(page.includes('type="radio" name="number-representation-strategy"'), 'mixed practice must ask learners to identify the representation pattern');
assert.ok(page.includes("disabled={!answer.trim() || (mode === 'mix' && !strategy)}"), 'mixed answers must require a method choice and an answer');
assert.ok(page.includes('!strategyCorrect') && page.includes('!answerCorrect'), 'feedback must distinguish a wrong method from a wrong value');
assert.ok(page.includes('isNumberRepresentationAnswerCorrect(problem, answer)'), 'the page must use pattern-aware answer normalization');
assert.ok(page.includes("setStrategy(selectedMode === 'mix' ? '' : selectedMode)"), 'fixed practice should lock its method while mixed practice starts unselected');

const counts = Object.fromEntries(numberRepresentationPatterns.map(pattern => [pattern, 0]));
let previous = '';
for (let i = 0; i < 20_000; i += 1) {
  const problem = generateNumberRepresentationProblem('mix');
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'mixed mode repeated the same pattern consecutively');
  assert.ok(problem.answer.length > 0);
  previous = problem.pattern;
}
for (const pattern of numberRepresentationPatterns) {
  assert.ok(counts[pattern] >= 4_500, `${pattern} was underrepresented: ${counts[pattern]}`);
}

console.log('Number representation drill passed: all focused patterns and signed/unsigned boundaries generated; 20,000 mixed problems balanced with no adjacent pattern repeats.', counts);
