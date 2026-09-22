export type RetryBudget = { maxAttempts: number; attempts: number; maxElapsedMs: number; startedAt: number };
export function canRetry(budget: RetryBudget, now = Date.now()): boolean { return budget.attempts < budget.maxAttempts && now - budget.startedAt < budget.maxElapsedMs; }
export function nextAttempt(budget: RetryBudget): RetryBudget { return { ...budget, attempts: budget.attempts + 1 }; }
export function backoff(attempt: number, base = 250, cap = 8_000): number { return Math.min(cap, base * 2 ** Math.max(0, attempt - 1)); }
