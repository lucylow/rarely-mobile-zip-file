export type SubmitGuard = { submitting: boolean; lastSubmittedAt: number; minIntervalMs: number };
export function canSubmit(guard: SubmitGuard, now = Date.now()): boolean { return !guard.submitting && now - guard.lastSubmittedAt >= guard.minIntervalMs; }
export function beginSubmit(guard: SubmitGuard): SubmitGuard { if (guard.submitting) throw new Error('duplicate-submit'); return { ...guard, submitting: true }; }
export function finishSubmit(guard: SubmitGuard, now = Date.now()): SubmitGuard { return { ...guard, submitting: false, lastSubmittedAt: now }; }
