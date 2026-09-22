export interface RateLimitDecision { allowed: boolean; retryAfterMs: number; remaining: number; }

export class FixedWindowLimiter {
  private windows = new Map<string, { startedAt: number; count: number }>();
  constructor(private readonly limit: number, private readonly windowMs: number) {}
  check(key: string, now = Date.now()): RateLimitDecision {
    const current = this.windows.get(key);
    if (!current || now - current.startedAt >= this.windowMs) {
      this.windows.set(key, { startedAt: now, count: 1 });
      return { allowed: true, retryAfterMs: this.windowMs, remaining: this.limit - 1 };
    }
    if (current.count >= this.limit) return { allowed: false, retryAfterMs: this.windowMs - (now - current.startedAt), remaining: 0 };
    current.count += 1;
    return { allowed: true, retryAfterMs: this.windowMs - (now - current.startedAt), remaining: this.limit - current.count };
  }
}
