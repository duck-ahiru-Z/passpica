export function parseStrictInteger(value: string, blankValue?: number): number | null {
  const trimmed = value.trim();
  if (trimmed === '' && blankValue !== undefined) return blankValue;
  if (!/^[+-]?\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
