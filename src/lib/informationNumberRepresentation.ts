export type ByteMode = 'unsigned' | 'twos-complement';

export function assertByte(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new RangeError('A byte must be an integer from 0 to 255.');
  }
}

export function byteToBinary(value: number): string {
  assertByte(value);
  return value.toString(2).padStart(8, '0');
}

export function decodeByte(value: number, mode: ByteMode): number {
  assertByte(value);
  return mode === 'twos-complement' && value >= 128 ? value - 256 : value;
}

export function getBitWeights(mode: ByteMode): number[] {
  return mode === 'twos-complement'
    ? [-128, 64, 32, 16, 8, 4, 2, 1]
    : [128, 64, 32, 16, 8, 4, 2, 1];
}

export function getByteContributions(value: number, mode: ByteMode): number[] {
  const bits = byteToBinary(value);
  return [...bits].map((bit, index) => bit === '1' ? getBitWeights(mode)[index] : 0);
}
