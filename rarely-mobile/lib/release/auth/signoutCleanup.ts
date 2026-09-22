export async function signoutCleanup(actions: Array<() => Promise<void>>): Promise<void> { for (const action of actions) { try { await action(); } catch { /* best-effort cleanup */ } } }
