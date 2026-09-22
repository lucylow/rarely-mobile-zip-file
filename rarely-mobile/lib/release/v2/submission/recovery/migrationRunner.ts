export type Migration = { id: string; run: () => Promise<void>; rollback?: () => Promise<void> };
export type MigrationState = { completed: string[]; failed?: string; attempt: number };
export async function runMigrations(state: MigrationState, migrations: Migration[]): Promise<MigrationState> {
  const completed = new Set(state.completed);
  for (const migration of migrations) {
    if (completed.has(migration.id)) continue;
    try { await migration.run(); completed.add(migration.id); }
    catch { return { completed: [...completed], failed: migration.id, attempt: state.attempt + 1 }; }
  }
  return { completed: [...completed], attempt: state.attempt + 1 };
}
export async function rollbackFailedMigration(migration: Migration): Promise<void> { if (migration.rollback) await migration.rollback(); }
