import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allowedStandingWaveHarmonics, standingWaveAntinodes, standingWaveDisplacement, standingWaveFrequency, standingWaveNodes, standingWaveWavelength } from '../src/lib/physicsStandingWave.ts';
import { formatStandingWaveAnswer, generateStandingWaveProblem, isStandingWaveAnswerCorrect, standingWavePatterns } from '../src/lib/physicsStandingWaveDrill.ts';

let seed = 0x28102026;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
const counts = Object.fromEntries(standingWavePatterns.map(pattern => [pattern, 0]));
let previous = '';
for (let index = 0; index < 25_000; index += 1) {
  const problem = generateStandingWaveProblem('mix', random);
  counts[problem.pattern] += 1;
  assert.notEqual(problem.pattern, previous, 'balanced mixed practice must avoid adjacent pattern repeats');
  assert.ok(problem.question.length > 15 && problem.explanation.length > 20);
  assert.ok(Number.isFinite(problem.answer) && problem.answer > 0);
  assert.ok(isStandingWaveAnswerCorrect(formatStandingWaveAnswer(problem.answer), problem.answer));
  assert.ok(!isStandingWaveAnswerCorrect(String(problem.answer + 1), problem.answer));

  let expected;
  let match;
  if (problem.pattern === 'stringFrequency') {
    match = problem.question.match(/長さ ([\d.]+) m、波の速さ ([\d.]+) m\/s）の第(\d+)倍振動/);
    assert.ok(match, problem.question);
    expected = Number(match[3]) * Number(match[2]) / (2 * Number(match[1]));
  } else if (problem.pattern === 'stringWaveSpeed') {
    match = problem.question.match(/長さ ([\d.]+) m）の第(\d+)倍振動で、振動数が ([\d.]+) Hz/);
    assert.ok(match, problem.question);
    expected = Number(match[3]) * 2 * Number(match[1]) / Number(match[2]);
  } else if (problem.pattern === 'stringWavelength') {
    match = problem.question.match(/長さ ([\d.]+) m の両端固定弦が第(\d+)倍振動/);
    assert.ok(match, problem.question);
    expected = 2 * Number(match[1]) / Number(match[2]);
  } else if (problem.pattern === 'openPipeFrequency') {
    match = problem.question.match(/長さ ([\d.]+) m、音速 ([\d.]+) m\/s）の第(\d+)次固有振動数/);
    assert.ok(match, problem.question);
    expected = Number(match[3]) * Number(match[2]) / (2 * Number(match[1]));
  } else {
    match = problem.question.match(/長さ ([\d.]+) m、音速 ([\d.]+) m\/s）の第(\d+)次（奇数次）固有振動数/);
    assert.ok(match, problem.question);
    assert.ok(Number(match[3]) % 2 === 1, `closed pipe must use odd harmonic: ${problem.question}`);
    expected = Number(match[3]) * Number(match[2]) / (4 * Number(match[1]));
  }
  assert.ok(Math.abs(problem.answer - expected) < 1e-10, `${problem.pattern}: ${problem.answer} !== ${expected}`);
  previous = problem.pattern;
}
for (const pattern of standingWavePatterns) assert.equal(counts[pattern], 5_000);

assert.deepEqual(allowedStandingWaveHarmonics('string'), [1, 2, 3, 4]);
assert.deepEqual(allowedStandingWaveHarmonics('openPipe'), [1, 2, 3, 4]);
assert.deepEqual(allowedStandingWaveHarmonics('closedPipe'), [1, 3, 5]);
assert.equal(standingWaveWavelength(1, 3, 'string'), 2 / 3);
assert.equal(standingWaveFrequency(300, 1, 3, 'string'), 450);
assert.equal(standingWaveFrequency(300, 1, 2, 'openPipe'), 300);
assert.equal(standingWaveFrequency(300, 1, 3, 'closedPipe'), 225);
for (const boundary of ['string', 'openPipe', 'closedPipe']) {
  for (const harmonic of allowedStandingWaveHarmonics(boundary)) {
    const nodes = standingWaveNodes(boundary, harmonic);
    const antinodes = standingWaveAntinodes(boundary, harmonic);
    assert.ok(nodes.length > 0 && antinodes.length > 0);
    for (const position of nodes) for (const phase of [0, 60, 135, 270]) {
      assert.ok(Math.abs(standingWaveDisplacement(position, 1, harmonic, boundary, phase)) < 1e-10, `${boundary} node moved at ${phase}°`);
    }
    for (const position of antinodes) assert.ok(Math.abs(Math.abs(standingWaveDisplacement(position, 1, harmonic, boundary, 0)) - 1) < 1e-10);
  }
}
assert.deepEqual(standingWaveNodes('string', 2), [0, 0.5, 1]);
assert.deepEqual(standingWaveAntinodes('string', 2), [0.25, 0.75]);
assert.deepEqual(standingWaveNodes('openPipe', 2), [0.25, 0.75]);
assert.deepEqual(standingWaveAntinodes('openPipe', 2), [0, 0.5, 1]);
assert.deepEqual(standingWaveNodes('closedPipe', 3), [0, 2 / 3]);
assert.deepEqual(standingWaveAntinodes('closedPipe', 3), [1 / 3, 1]);

const visual = fs.readFileSync('src/app/learn/physics/standing-wave-visual/page.tsx', 'utf8');
const drill = fs.readFileSync('src/app/learn/physics/standing-wave-drill/page.tsx', 'utf8');
assert.ok(visual.includes('aria-label="定常波の境界条件"') && visual.includes('aria-label="定常波の時間位相"'));
assert.ok(visual.includes('href="/learn/physics/standing-wave-drill"') && visual.includes('href="/learn/physics/wave-superposition-visual"'));
assert.ok(drill.includes('href="/learn/physics/standing-wave-visual"') && drill.includes('条件に合う計算方法を選んでください'));
console.log(`Standing waves verified: 25,000 balanced mixed questions, independent formula checks, string/open/closed boundary conditions, stationary nodes and antinodes; ${JSON.stringify(counts)}.`);
