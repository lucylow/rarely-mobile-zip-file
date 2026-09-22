export class MockClock {
  private nowValue: number;
  constructor(start = Date.parse("2026-09-22T12:00:00.000Z")) { this.nowValue = start; }
  now(): number { return this.nowValue; }
  iso(): string { return new Date(this.nowValue).toISOString(); }
  advance(ms: number): void { this.nowValue += ms; }
  set(value: number): void { this.nowValue = value; }
}
