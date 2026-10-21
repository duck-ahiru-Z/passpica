import { BalancedRandom } from './balancedRandom.ts';
import { byteToBinary, decodeByte, getByteContributions, type ByteMode } from './informationNumberRepresentation.ts';

export type NumberRepresentationPattern = 'unsigned' | 'twosComplement' | 'bitWeight' | 'binaryDecimal';
export type NumberRepresentationMode = NumberRepresentationPattern | 'mix';
export type NumberRepresentationProblem = {
  pattern: NumberRepresentationPattern;
  question: string;
  answer: string;
  explanation: string;
};

export const numberRepresentationPatterns: readonly NumberRepresentationPattern[] = [
  'unsigned', 'twosComplement', 'bitWeight', 'binaryDecimal',
];
export const numberRepresentationLabels: Record<NumberRepresentationPattern, string> = {
  unsigned: '符号なし2進数の読み取り',
  twosComplement: '2の補数の読み取り',
  bitWeight: 'ビットの重みから計算',
  binaryDecimal: '10進数から8ビット表現',
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
      question: `10進数 ${value} を8 bitの2進数で表せ。`,
      answer: bits,
      explanation: `${value} を2のべき乗の和に分けると ${bits}₂。8 bitになるよう左側を0で埋めます。`,
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

  const modeForWeights: ByteMode = value >= 128 ? 'twos-complement' : 'unsigned';
  const answer = decodeByte(value, modeForWeights);
  const contributions = getByteContributions(value, modeForWeights).filter(part => part !== 0);
  return {
    pattern,
    question: `ビット列 ${byteToBinary(value)}₂ を${modeForWeights === 'twos-complement' ? '2の補数' : '符号なし'}として読み、各桁の重みの和を答えよ。`,
    answer: String(answer),
    explanation: `各ビットの重みを足すと ${contributions.join(' + ')} = ${answer}。`,
  };
}
