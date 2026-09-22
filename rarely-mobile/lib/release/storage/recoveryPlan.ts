export interface RecoveryAction { id: string; label: string; destructive: boolean; run: () => Promise<void>; }

export async function runRecovery(actions: RecoveryAction[]): Promise<{ completed: string[]; failed?: string }> {
  const completed: string[] = [];
  for (const action of actions) {
    try { await action.run(); completed.push(action.id); }
    catch { return { completed, failed: action.id }; }
  }
  return { completed };
}
