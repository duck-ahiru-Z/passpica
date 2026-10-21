/**
 * Return items in shuffled batches so every pattern appears once before any
 * pattern is repeated. This keeps mixed practice varied without pretending
 * that Math.random() is a fair short-run scheduler.
 */
export class BalancedRandom<T> {
  private remaining: T[] = [];
  private last: T | undefined;
  private readonly items: readonly T[];

  constructor(items: readonly T[]) {
    this.items = items;
    if (items.length === 0) throw new Error('BalancedRandom needs at least one item');
  }

  next(random = Math.random): T {
    if (this.remaining.length === 0) {
      this.remaining = [...this.items];
      for (let i = this.remaining.length - 1; i > 0; i -= 1) {
        // Clamp injected random sources too; a value of exactly 1 must not
        // create an undefined slot in the shuffled batch.
        const sample = random();
        const j = Number.isFinite(sample)
          ? Math.min(i, Math.max(0, Math.floor(sample * (i + 1))))
          : 0;
        [this.remaining[i], this.remaining[j]] = [this.remaining[j], this.remaining[i]];
      }
      // Avoid an avoidable boundary repeat when a new batch starts.
      if (this.remaining.length > 1 && this.remaining[0] === this.last) {
        [this.remaining[0], this.remaining[1]] = [this.remaining[1], this.remaining[0]];
      }
    }
    const value = this.remaining.shift()!;
    this.last = value;
    return value;
  }
}

export function balancedPick<T>(items: readonly T[], random = Math.random): T {
  return new BalancedRandom(items).next(random);
}
