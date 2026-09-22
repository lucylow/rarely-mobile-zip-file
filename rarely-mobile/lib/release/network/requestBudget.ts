export class RequestBudget {
  private used = 0;
  constructor(private readonly max = 30) {}
  consume(count = 1): boolean { if (this.used + count > this.max) return false; this.used += count; return true; }
  remaining(): number { return Math.max(0, this.max - this.used); }
  reset(): void { this.used = 0; }
}
