export interface IdempotencyRecord {
  key: string;
  createdAt: number;
  resultHash: string;
}

export class IdempotencySet {
  private readonly records = new Map<string, IdempotencyRecord>();
  constructor(private readonly maxAgeMs = 24 * 60 * 60 * 1000) {}

  remember(key: string, resultHash: string, now = Date.now()): void {
    this.prune(now);
    this.records.set(key, { key, createdAt: now, resultHash });
  }

  get(key: string, now = Date.now()): IdempotencyRecord | undefined {
    this.prune(now);
    return this.records.get(key);
  }

  has(key: string, now = Date.now()): boolean {
    return Boolean(this.get(key, now));
  }

  private prune(now: number): void {
    for (const [key, value] of this.records) {
      if (now - value.createdAt > this.maxAgeMs) this.records.delete(key);
    }
  }
}
