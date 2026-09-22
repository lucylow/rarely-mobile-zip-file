export class WebhookDedupe {
  private readonly seen = new Map<string, number>();
  constructor(private readonly ttlMs = 24 * 60 * 60_000) {}
  checkAndMark(id: string, now = Date.now()): boolean {
    const existing = this.seen.get(id);
    if (existing != null && now - existing <= this.ttlMs) return false;
    this.seen.set(id, now);
    return true;
  }
  purge(now = Date.now()): void { for (const [id, at] of this.seen) if (now - at > this.ttlMs) this.seen.delete(id); }
}
