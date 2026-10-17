/**
 * Tiny in-memory cache for one value with a time-to-live.
 * Good enough for a single API instance; swap for Redis when running several.
 */
export class TtlCache<T> {
  private value: T | undefined;
  private expiresAt = 0;
  private pending: Promise<T> | null = null;

  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Returns the cached value, or loads it once even if many callers ask at the same time. */
  async get(load: () => Promise<T>): Promise<T> {
    if (this.value !== undefined && this.now() < this.expiresAt) return this.value;
    if (!this.pending) {
      this.pending = load()
        .then((value) => {
          this.value = value;
          this.expiresAt = this.now() + this.ttlMs;
          return value;
        })
        .finally(() => {
          this.pending = null;
        });
    }
    return this.pending;
  }

  invalidate(): void {
    this.value = undefined;
    this.expiresAt = 0;
  }
}
