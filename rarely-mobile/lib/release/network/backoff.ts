export interface BackoffOptions {
  baseMs: number;
  maxMs: number;
  jitterRatio: number;
}

export const DEFAULT_BACKOFF: BackoffOptions = { baseMs: 350, maxMs: 15_000, jitterRatio: 0.2 };

export function backoffDelay(attempt: number, options: BackoffOptions = DEFAULT_BACKOFF, random = Math.random): number {
  const safeAttempt = Math.max(0, attempt);
  const exponential = Math.min(options.maxMs, options.baseMs * 2 ** safeAttempt);
  const jitter = exponential * options.jitterRatio * (random() * 2 - 1);
  return Math.max(0, Math.round(exponential + jitter));
}

export function retryAfterFromHeader(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, Math.round(seconds * 1000));
  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - Date.now());
}
