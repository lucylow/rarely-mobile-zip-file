export async function safeRemove(store: { remove(key: string): Promise<void> }, key: string): Promise<boolean> { try { await store.remove(key); return true; } catch { return false; } }
