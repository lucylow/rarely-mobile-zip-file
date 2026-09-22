export interface JournalSafetyState { lastSavedAt?: number; dirty: boolean; characters: number; }

export function journalSafety(text: string, lastSavedAt?: number, now = Date.now()): JournalSafetyState {
  return { lastSavedAt, dirty: lastSavedAt === undefined || now - lastSavedAt > 0, characters: text.length };
}

export function shouldAutosave(state: JournalSafetyState, now = Date.now(), intervalMs = 2_000): boolean {
  return state.dirty && (state.lastSavedAt === undefined || now - state.lastSavedAt >= intervalMs);
}
