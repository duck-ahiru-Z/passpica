export function randomOrderedDistinctPair(
  min: number,
  max: number,
  random: () => number = Math.random,
): [number, number] {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min >= max) {
    throw new RangeError('Expected an integer range containing at least two values.');
  }

  const draw = () => min + Math.floor(random() * (max - min + 1));
  const first = draw();
  let second = draw();
  while (second === first) second = draw();

  return first < second ? [first, second] : [second, first];
}
