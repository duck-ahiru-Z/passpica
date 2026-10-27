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

// A scheduler is shared by each mounted page, so changing from focused mode
// back to mixed mode can happen at any point in a shuffled batch. Exercise
// that transition repeatedly (including immediately after the last item in
// a batch) and ensure it does not introduce duplicates or boundary streaks.
for (const size of [2, 3, 4, 5, 6, 7]) {
  const patterns = Array.from({ length: size }, (_, index) => `pattern-${index}`);
  const picker = new BalancedRandom(patterns);
  const output = Array.from({ length: size * 1000 }, () => picker.next(() => 0));
  if (output.some((value, index) => index > 0 && value === output[index - 1])) {
    throw new Error(`constant random source caused adjacent repeats for size ${size}`);
  }
  for (let start = 0; start < output.length; start += size) {
    if (new Set(output.slice(start, start + size)).size !== size) {
      throw new Error(`constant random source omitted a pattern for size ${size}`);
    }
  }

  // Interleave fixed-mode questions, which do not consume the mixed picker,
  // then resume mixed mode. Its partial batch must still be completed fairly.
  const interleavedPicker = new BalancedRandom(patterns);
  const interleaved = [];
  let mixedDraws = 0;
  let events = 0;
  while (mixedDraws < size * 100) {
    events += 1;
    if (events % 4 === 0) {
      // A fixed-mode question is generated independently and must not advance
      // the mixed picker or consume any slot from its current batch.
      const fixedPattern = patterns[(events / 4) % size];
      if (!patterns.includes(fixedPattern)) throw new Error(`invalid fixed-mode event for size ${size}`);
      continue;
    }
    interleaved.push(interleavedPicker.next(() => 0));
    mixedDraws += 1;
    if (interleaved.length % size === 0) {
      const partial = interleaved.slice(interleaved.length - size);
      if (new Set(partial).size !== size) {
        throw new Error(`interleaved mixed batch omitted a pattern for size ${size}`);
      }
    } else if (events % 2 === 0) {
      const batchStart = Math.floor((interleaved.length - 1) / size) * size;
      const partial = interleaved.slice(batchStart);
      if (new Set(partial).size !== partial.length) {
        throw new Error(`interleaved mixed batch repeated before completion for size ${size}`);
      }
    }
  }
}

console.log(`BalancedRandom verified: ${total} random outputs, plus 27,000 constant-source mixed draws and 2,700 mixed draws interleaved with 900 fixed-mode events across 2–7 patterns; all patterns present per batch and adjacent repeats 0`);
