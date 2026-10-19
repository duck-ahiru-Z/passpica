export function parseStrictPositiveInteger(value: string, blankMeansOne = false): number | null {
  const trimmed = value.trim();
  if (!trimmed) return blankMeansOne ? 1 : null;
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
