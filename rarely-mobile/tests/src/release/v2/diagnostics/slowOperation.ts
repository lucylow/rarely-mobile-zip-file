export interface SlowThreshold { name: string; thresholdMs: number; }
export function reportSlowOperation(threshold: SlowThreshold, durationMs: number, report: (name: string, durationMs: number) => void): void { if (durationMs > threshold.thresholdMs) report(threshold.name, durationMs); }
