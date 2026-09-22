import { ReleaseError } from "../errors/ReleaseError";
import type { ErrorDetails } from "../errors/types";
import { backoffDelay, DEFAULT_BACKOFF } from "./backoff";

export interface RetryPolicy {
  maxAttempts: number;
  baseMs?: number;
  maxMs?: number;
  shouldRetry?: (error: ErrorDetails, attempt: number) => boolean;
}

const defaultShouldRetry = (error: ErrorDetails, attempt: number) => error.retryable && attempt < 3;

export async function retry<T>(operation: (attempt: number) => Promise<T>, policy: RetryPolicy = { maxAttempts: 3 }): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt < policy.maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      last = error;
      const details = error instanceof ReleaseError
        ? { code: error.code, retryable: error.retryable, safeMessage: error.safeMessage, recovery: error.recovery, message: error.message }
        : ({ code: "UNKNOWN", retryable: true, safeMessage: "Retry", recovery: "RETRY", message: String(error) } as ErrorDetails);
      const should = (policy.shouldRetry ?? defaultShouldRetry)(details, attempt + 1);
      if (!should || attempt + 1 >= policy.maxAttempts) break;
      const delay = backoffDelay(attempt, { ...DEFAULT_BACKOFF, baseMs: policy.baseMs ?? DEFAULT_BACKOFF.baseMs, maxMs: policy.maxMs ?? DEFAULT_BACKOFF.maxMs });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw last;
}
