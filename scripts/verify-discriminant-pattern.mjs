import { randomOrderedDistinctPair } from '../src/lib/math/randomOrderedDistinctPair.ts';

let state = 0x5eed1234;
const coveredPairs = new Set();
const random = () => {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 0x100000000;
};

for (let index = 0; index < 10000; index += 1) {
  const [r1, r2] = randomOrderedDistinctPair(-4, 4, random);
  if (!(r1 >= -4 && r1 < r2 && r2 <= 4)) {
    throw new Error(`invalid roots: ${r1}, ${r2}`);
  }
  coveredPairs.add(`${r1},${r2}`);

  const discriminantOverFour = (k) => k * k - (r1 + r2) * k + r1 * r2;
  const between = (r1 + r2) / 2;
  if (!(discriminantOverFour(between) < 0)) {
    throw new Error(`expected no real roots between ${r1} and ${r2}`);
  }
  if (!(discriminantOverFour(r1 - 1) > 0 && discriminantOverFour(r2 + 1) > 0)) {
    throw new Error(`expected real roots outside ${r1} and ${r2}`);
  }
}

if (coveredPairs.size !== 36) {
  throw new Error(`expected all 36 possible boundary pairs, observed ${coveredPairs.size}`);
}

console.log(`Discriminant pattern verified: 10,000 valid outputs covering all ${coveredPairs.size} boundary pairs, with matching no-root intervals.`);
