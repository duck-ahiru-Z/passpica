import { getQuadraticInequalityAnswerType } from '../src/lib/quadraticInequality.ts';

const signs = ['<', '>', '\\le', '\\ge'];
const answerMatches = (type, x, first, second) => {
  switch (type) {
    case 1: return first < x && x < second;
    case 2: return x < first || second < x;
    case 3: return first <= x && x <= second;
    case 4: return x <= first || second <= x;
    case 5: return x === first;
    case 6: return x !== first;
    case 7: return true;
    case 8: return false;
  }
};
const satisfies = (value, sign) => sign === '<' ? value < 0 : sign === '>' ? value > 0 : sign === '\\le' ? value <= 0 : value >= 0;

let cases = 0;
for (const a of [-7, -3, -1, 1, 2, 5, 9]) {
  for (const sign of signs) {
    for (let root = -8; root <= 8; root += 1) {
      const type = getQuadraticInequalityAnswerType(a, 0, sign);
      for (const x of [root - 2, root - 1, root, root + 1, root + 2]) {
        const actual = satisfies(a * (x - root) ** 2, sign);
        if (answerMatches(type, x, root, root) !== actual) throw new Error(`D=0 mismatch: a=${a}, root=${root}, sign=${sign}, x=${x}, type=${type}`);
        cases += 1;
      }
    }
    for (let first = -7; first <= 5; first += 1) {
      for (let second = first + 1; second <= 8; second += 1) {
        const type = getQuadraticInequalityAnswerType(a, a * a * (second - first) ** 2, sign);
        for (const x of [first - 2, first, (first + second) / 2, second, second + 2]) {
          const actual = satisfies(a * (x - first) * (x - second), sign);
          if (answerMatches(type, x, first, second) !== actual) throw new Error(`D>0 mismatch: a=${a}, roots=${first},${second}, sign=${sign}, x=${x}, type=${type}`);
          cases += 1;
        }
      }
    }
    for (const aValue of [-a, a]) {
      const type = getQuadraticInequalityAnswerType(aValue, -1, sign);
      for (const x of [-20, -3, 0, 4, 20]) {
        const actual = satisfies(aValue * (x * x + 1), sign);
        if (answerMatches(type, x, 0, 0) !== actual) throw new Error(`D<0 mismatch: a=${aValue}, sign=${sign}, x=${x}, type=${type}`);
        cases += 1;
      }
    }
  }
}

console.log(`Quadratic-inequality answer regions verified against the polynomial: ${cases.toLocaleString()} boundary, interval, and exterior probes.`);
