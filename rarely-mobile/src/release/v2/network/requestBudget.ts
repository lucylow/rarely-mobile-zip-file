export interface Budget {
  maxAttempts: number;
  maxTotalMs: number;
  maxBodyBytes: number;
}

export const DEFAULT_BUDGET: Budget = {
  maxAttempts: 3,
  maxTotalMs: 12_000,
  maxBodyBytes: 1_000_000,
};

export function enforceBudget(input: { attempts: number; startedAt: number; bodyBytes: number }, budget = DEFAULT_BUDGET): void {
  if (input.attempts > budget.maxAttempts) throw new Error('network-attempt-budget-exceeded');
  if (Date.now() - input.startedAt > budget.maxTotalMs) throw new Error('network-time-budget-exceeded');
  if (input.bodyBytes > budget.maxBodyBytes) throw new Error('network-body-budget-exceeded');
}
