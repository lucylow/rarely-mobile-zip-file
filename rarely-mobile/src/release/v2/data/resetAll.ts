export interface ResetAdapters { local: () => Promise<void>; remote: () => Promise<void>; purchase: () => Promise<void>; }
export async function resetAll(adapters: ResetAdapters): Promise<{ remote: boolean; local: boolean; purchase: boolean }> {
  const result = { remote: false, local: false, purchase: false };
  try { await adapters.local(); result.local = true; } catch {}
  try { await adapters.purchase(); result.purchase = true; } catch {}
  try { await adapters.remote(); result.remote = true; } catch {}
  return result;
}
