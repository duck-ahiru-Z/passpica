import { BalancedRandom } from './balancedRandom.ts';

export type InformationPattern = 'binary' | 'data' | 'transfer' | 'logic' | 'sampling' | 'compression' | 'complement';
export type InformationMode = InformationPattern | 'mix';
export type InformationProblem = { pattern: InformationPattern; question: string; answer: string; explanation: string; unit: string };

export const informationPatterns: readonly InformationPattern[] = ['binary', 'data', 'transfer', 'logic', 'sampling', 'compression', 'complement'];
export const informationLabels: Record<InformationPattern, string> = { binary: '2進数変換', data: 'データ量', transfer: '通信時間', logic: '論理演算', sampling: '標本化', compression: '圧縮率', complement: '補数表現' };

function binaryAddends(value: number): string {
  const addends: number[] = [];
  for (let power = Math.floor(Math.log2(value)); power >= 0; power -= 1) {
    const placeValue = 2 ** power;
    if (value & placeValue) addends.push(placeValue);
  }
  return addends.join('+');
}

const picker = new BalancedRandom(informationPatterns);
const variants = {
  binary: new BalancedRandom([13, 19, 23, 42, 58]),
  data: new BalancedRandom([
    { width: 640, height: 480, bits: 24 }, { width: 1280, height: 720, bits: 24 },
    { width: 1920, height: 1080, bits: 24 }, { width: 800, height: 600, bits: 16 }, { width: 1024, height: 768, bits: 8 },
  ]),
  transfer: new BalancedRandom([
    { size: 80, rate: 20 }, { size: 12, rate: 24 }, { size: 150, rate: 100 },
    { size: 64, rate: 16 }, { size: 45, rate: 30 },
  ]),
  logic: new BalancedRandom([
    { a: 1, b: 0, operation: 'A AND (NOT B)', result: 1 }, { a: 0, b: 1, operation: 'A AND (NOT B)', result: 0 },
    { a: 1, b: 1, operation: 'A OR (NOT B)', result: 1 }, { a: 0, b: 0, operation: 'A OR (NOT B)', result: 1 },
    { a: 1, b: 1, operation: 'A XOR B', result: 0 },
  ]),
  sampling: new BalancedRandom([
    { frequency: 44100, bits: 16, channels: 2 }, { frequency: 48000, bits: 24, channels: 2 },
    { frequency: 32000, bits: 16, channels: 1 }, { frequency: 22050, bits: 8, channels: 1 },
    { frequency: 96000, bits: 16, channels: 2 },
  ]),
  compression: new BalancedRandom([
    { original: 12, compressed: 3 }, { original: 10, compressed: 4 }, { original: 25, compressed: 10 },
    { original: 16, compressed: 12 }, { original: 64, compressed: 48 },
  ]),
  complement: new BalancedRandom(['11111101', '11111011', '00001101', '10000000', '01111111']),
};

export function generateInformationProblem(mode: InformationMode, random = Math.random): InformationProblem {
  const pattern = mode === 'mix' ? picker.next(random) : mode;
  switch (pattern) {
    case 'binary': {
      const decimal = variants.binary.next(random);
      const answer = decimal.toString(2);
      return { pattern, question: `10進数の ${decimal} を2進数で表せ。`, answer, explanation: `${decimal}=${binaryAddends(decimal)} と2のべき乗の和に分解する。各位に対応するビットを並べると ${answer}₂。`, unit: '2進数' };
    }
    case 'data': {
      const value = variants.data.next(random);
      const bytes = (value.width * value.height * value.bits) / 8;
      return { pattern, question: `${value.width}×${value.height}画素、${value.bits} bit/画素の画像データ量は何 byte か。（圧縮なし）`, answer: String(bytes), explanation: `${value.width}×${value.height}×${value.bits}÷8=${bytes.toLocaleString('en-US')} byte。`, unit: 'byte' };
    }
    case 'transfer': {
      const value = variants.transfer.next(random);
      const seconds = (value.size * 8) / value.rate;
      const megabits = value.size * 8;
      return { pattern, question: `${value.size} MB のファイルを ${value.rate} Mbps で送る。何秒か。（1 MB=10⁶ byte、1 Mbps=10⁶ bit/s）`, answer: String(seconds), explanation: `${value.size} MB×8=${megabits} Mbit。${megabits} Mbit÷${value.rate} Mbps=${seconds} s。`, unit: '秒' };
    }
    case 'logic': {
      const value = variants.logic.next(random);
      const explanation = value.operation === 'A XOR B'
        ? `A と B はどちらも${value.a}なので、XOR（排他的論理和）は ${value.result}。`
        : `NOT B=${1 - value.b}。${value.operation} を順に計算すると ${value.result}。`;
      return { pattern, question: `A=${value.a}、B=${value.b} のとき、${value.operation} の値は？`, answer: String(value.result), explanation, unit: '' };
    }
    case 'sampling': {
      const value = variants.sampling.next(random);
      const bytes = (value.frequency * value.bits * value.channels) / 8;
      return { pattern, question: `標本化周波数 ${value.frequency / 1000} kHz、量子化ビット数 ${value.bits} bit、${value.channels === 2 ? 'ステレオ2 ch' : 'モノラル1 ch'}の非圧縮PCM音声を1秒記録する。データ量は何 byte か。（1 byte=8 bit）`, answer: String(bytes), explanation: `${value.frequency.toLocaleString('en-US')}×${value.bits}×${value.channels}÷8=${bytes.toLocaleString('en-US')} byte。非圧縮PCMなので標本数×量子化ビット数×チャンネル数をそのまま数える。`, unit: 'byte' };
    }
    case 'compression': {
      const value = variants.compression.next(random);
      const ratio = (value.compressed / value.original) * 100;
      return { pattern, question: `元データ ${value.original} MB を ${value.compressed} MB にした。圧縮率は何 % か。（圧縮後/圧縮前×100）`, answer: String(ratio), explanation: `圧縮率=${value.compressed}/${value.original}×100=${ratio}%。`, unit: '%' };
    }
    case 'complement': {
      const bits = variants.complement.next(random);
      const unsigned = Number.parseInt(bits, 2);
      const answer = bits[0] === '1' ? unsigned - 256 : unsigned;
      const explanation = answer < 0
        ? `${bits[0]} が1なので負の数。まず符号なしで読むと ${bits}₂=${unsigned}。8 bitの2の補数なので 2⁸=256 を引き、${unsigned}−256=${answer}。`
        : `最上位ビットが0なので正の数。各位の重みを足すと ${bits}₂=${binaryAddends(unsigned)}=${answer}。`;
      return { pattern, question: `8 bitの2の補数表現で、${bits}₂が表す整数は？`, answer: String(answer), explanation, unit: '' };
    }
  }
}
