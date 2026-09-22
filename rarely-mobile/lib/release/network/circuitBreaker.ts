export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitSnapshot {
  state: CircuitState;
  failures: number;
  openedAt?: number;
}

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt?: number;

  constructor(private readonly threshold = 3, private readonly cooldownMs = 30_000) {}

  snapshot(now = Date.now()): CircuitSnapshot {
    if (this.state === "open" && this.openedAt !== undefined && now - this.openedAt >= this.cooldownMs) {
      this.state = "half-open";
    }
    return { state: this.state, failures: this.failures, openedAt: this.openedAt };
  }

  allow(now = Date.now()): boolean {
    return this.snapshot(now).state !== "open";
  }

  success(): void {
    this.state = "closed";
    this.failures = 0;
    this.openedAt = undefined;
  }

  failure(now = Date.now()): void {
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.state = "open";
      this.openedAt = now;
    }
  }
}
