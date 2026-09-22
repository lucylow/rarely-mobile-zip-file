export interface AiBudget { dailyLimit: number; used: number; resetAt: number; }
export function availableBudget(budget: AiBudget, now = Date.now()): number { if (now >= budget.resetAt) return budget.dailyLimit; return Math.max(0, budget.dailyLimit - budget.used); }
export function consumeBudget(budget: AiBudget, units: number, now = Date.now()): AiBudget { if (now >= budget.resetAt) return { ...budget, used: units, resetAt: now + 86_400_000 }; if (availableBudget(budget, now) < units) throw new Error('ai-budget-exhausted'); return { ...budget, used: budget.used + units }; }
