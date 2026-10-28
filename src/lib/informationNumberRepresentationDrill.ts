import { BalancedRandom } from './balancedRandom.ts';
import { byteToBinary, decodeByte, getBitWeights } from './informationNumberRepresentation.ts';

export type NumberRepresentationPattern = 'unsigned' | 'twosComplement' | 'bitWeight' | 'binaryDecimal' | 'bitWidthRange';
export type NumberRepresentationMode = NumberRepresentationPattern | 'mix';
export type NumberRepresentationProblem = {
  pattern: NumberRepresentationPattern;
  question: string;
  answer: string;
  explanation: string;
};

export const numberRepresentationPatterns: readonly NumberRepresentationPattern[] = [
  'unsigned', 'twosComplement', 'bitWeight', 'binaryDecimal', 'bitWidthRange',
];
export const numberRepresentationLabels: Record<NumberRepresentationPattern, string> = {
  unsigned: '符号なし2進数の読み取り',
  twosComplement: '2の補数の読み取り',
  bitWeight: 'ビットの重みから計算',
  binaryDecimal: '10進数から8ビット表現',
  bitWidthRange: 'ビット幅と表現範囲',
};

export function isNumberRepresentationAnswerCorrect(problem: NumberRepresentationProblem, input: string): boolean {
  const compact = input.trim().toLowerCase().replace(/\s/g, '');
  if (!compact) return false;
  if (problem.pattern === 'binaryDecimal') {
    const withoutPrefix = compact.startsWith('0b') ? compact.slice(2) : compact;
    const bits = withoutPrefix.endsWith('₂') ? withoutPrefix.slice(0, -1) : withoutPrefix;
    return /^[01]{8}$/.test(bits) && bits === problem.answer;
  }
  const integer = compact.replaceAll('−', '-');
  if (!/^[+-]?\d+$/.test(integer)) return false;
  return Number(integer) === Number(problem.answer);
}

const picker = new BalancedRandom(numberRepresentationPatterns);
const byteValues = {
  unsigned: new BalancedRandom([0, 1, 13, 42, 85, 127, 128, 200, 254, 255]),
  signed: new BalancedRandom([0, 1, 13, 42, 85, 127, 128, 129, 200, 254, 255]),
};
const decimalValues = new BalancedRandom([0, 1, 13, 42, 85, 127, 128, 200, 254, 255]);
const bitPositions = new BalancedRandom([0, 1, 2, 3, 4, 5, 6, 7]);
const widths = new BalancedRandom([4, 5, 6, 7, 8, 12, 16]);
const rangeQuestions = new BalancedRandom(['minSigned', 'maxSigned', 'minUnsigned', 'maxUnsigned', 'signedWidth']);

export function generateNumberRepresentationProblem(
  mode: NumberRepresentationMode,
  random = Math.random,
): NumberRepresentationProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  if (pattern === 'binaryDecimal') {
    const value = decimalValues.next(random);
    const bits = byteToBinary(value);
    return {
      pattern,
      question: `10進数 ${value} を符号なし8 bitの2進数で表せ。`,
      answer: bits,
      explanation: `符号なし8 bitでは ${value} を2のべき乗の和に分けると ${bits}₂。8 bitになるよう左側を0で埋めます。`,
    };
  }

  if (pattern === 'bitWeight') {
    const positionFromRight = bitPositions.next(random);
    const answer = getBitWeights('unsigned')[7 - positionFromRight];
    return {
      pattern,
      question: `符号なし8 bitで、右から${positionFromRight + 1}桁目の重みはいくつか。`,
      answer: String(answer),
      explanation: `右から${positionFromRight + 1}桁目の重みは 2^${positionFromRight} = ${answer}。`,
    };
  }

  if (pattern === 'bitWidthRange') {
    const width = widths.next(random);
    const questionType = rangeQuestions.next(random);
    const signed = questionType === 'minSigned' || questionType === 'maxSigned' || questionType === 'signedWidth';
    if (questionType === 'signedWidth') {
      const value = Math.max(1, Math.floor(random() * 31) + 1);
      const required = Math.ceil(Math.log2(value + 1)) + 1;
      return {
        pattern,
        question: `符号付き2の補数で −${value}〜${value} を表す。必要な最小ビット数はいくつか。`,
        answer: String(required),
        explanation: `n bitの2の補数の範囲は −2^(n−1)〜2^(n−1)−1。${value}以上の2のべき乗を探すと、最小は2^${required - 1}=${2 ** (required - 1)}なので ${required} bit必要。`,
      };
    }
    const maximum = signed ? 2 ** (width - 1) - 1 : 2 ** width - 1;
    const minimum = signed ? -(2 ** (width - 1)) : 0;
    const isMinimum = questionType === 'minSigned' || questionType === 'minUnsigned';
    const expected = isMinimum ? minimum : maximum;
    const label = signed ? '符号付き2の補数' : '符号なし';
    const endpoint = isMinimum ? '最小値' : '最大値';
    return {
      pattern,
      question: `${width} bitの${label}で表せる整数の${isMinimum ? '最小値' : '最大値'}はいくつか。`,
      answer: String(expected),
      explanation: signed
        ? `${width} bitの2の補数の範囲は −2^(${width}−1)〜2^(${width}−1)−1。したがって ${minimum}〜${maximum}、${endpoint}は ${expected}。`
        : `${width} bitの符号なし整数は0〜2^${width}−1。したがって${endpoint}は ${expected}。`,
    };
  }

  const value = byteValues[pattern === 'unsigned' ? 'unsigned' : 'signed'].next(random);
  if (pattern === 'unsigned') {
    const bits = byteToBinary(value);
    return {
      pattern,
      question: `8 bitの符号なし2進数 ${bits}₂ を10進数で表せ。`,
      answer: String(value),
      explanation: `${bits}₂ の各桁の正の重みを足すと ${value}。`,
    };
  }
  if (pattern === 'twosComplement') {
    const bits = byteToBinary(value);
    const answer = decodeByte(value, 'twos-complement');
    return {
      pattern,
      question: `8 bitの2の補数表現 ${bits}₂ が表す整数は？`,
      answer: String(answer),
      explanation: answer < 0
        ? `符号なしでは ${value}。2の補数では ${value}−256=${answer}。`
        : `最上位ビットが0なので正の数。値は ${answer}。`,
    };
  }
  throw new Error(`Unsupported number representation pattern: ${pattern}`);
}
