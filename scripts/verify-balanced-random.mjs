import { BalancedRandom } from '../src/lib/balancedRandom.ts';

const verifyPatternSet = (patterns, batches = 100) => {
  const picker = new BalancedRandom(patterns);
  const output = Array.from({ length: patterns.length * batches }, () => picker.next());

  for (let start = 0; start < output.length; start += patterns.length) {
    const batch = output.slice(start, start + patterns.length);
    if (new Set(batch).size !== patterns.length) {
      throw new Error(`batch ${start / patterns.length} does not contain every pattern exactly once for size ${patterns.length}`);
    }
  }

  const boundaryRepeats = output.filter((pattern, index) => index > 0 && pattern === output[index - 1]).length;
  if (boundaryRepeats !== 0) {
    throw new Error(`found ${boundaryRepeats} adjacent pattern repeats for size ${patterns.length}`);
  }
  return { output, boundaryRepeats };
};

const results = [2, 3, 4, 5, 6, 7].map(size => verifyPatternSet(Array.from({ length: size }, (_, i) => `pattern-${i}`), 1000));

let emptyRejected = false;
try {
  new BalancedRandom([]);
} catch {
  emptyRejected = true;
}
if (!emptyRejected) throw new Error('empty pattern lists must be rejected');

for (const [label, fixedRandom, expected] of [
  ['exactly 1', () => 1, ['a', 'b', 'c']],
  ['negative', () => -1, ['a', 'b', 'c']],
  ['NaN', () => Number.NaN, ['a', 'b', 'c']],
]) {
  const picker = new BalancedRandom(['a', 'b', 'c']);
  const actual = Array.from({ length: expected.length }, () => picker.next(fixedRandom));
  if (actual.some(item => !expected.includes(item)) || new Set(actual).size !== expected.length) {
    throw new Error(`invalid injected random (${label}) corrupted the balanced batch: ${actual}`);
  }
}

const total = results.reduce((sum, result) => sum + result.output.length, 0);
console.log(`BalancedRandom verified: ${total} outputs across 2/3/4/5/6/7-pattern sets, adjacent repeats 0`);
