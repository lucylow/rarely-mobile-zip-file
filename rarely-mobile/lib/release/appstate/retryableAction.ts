export type ActionResult<T> = { ok: true; value: T } | { ok: false; error: string; retryable: boolean };

export async function runAction<T>(operation: () => Promise<T>): Promise<ActionResult<T>> { try { return { ok: true, value: await operation() }; } catch (error) { return { ok: false, error: error instanceof Error ? error.message : String(error), retryable: true }; } }
