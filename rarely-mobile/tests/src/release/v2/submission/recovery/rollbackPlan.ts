export type RollbackAction = { id: string; reason: string; safe: boolean; run: () => Promise<void> };
export function chooseRollback(actions: RollbackAction[]): RollbackAction[] { return actions.filter((x) => x.safe).sort((a,b) => a.id.localeCompare(b.id)); }
export async function executeRollback(actions: RollbackAction[]): Promise<{ completed: string[]; failed: string[] }> {
  const completed: string[] = []; const failed: string[] = [];
  for (const action of actions) { try { await action.run(); completed.push(action.id); } catch { failed.push(action.id); } }
  return { completed, failed };
}
