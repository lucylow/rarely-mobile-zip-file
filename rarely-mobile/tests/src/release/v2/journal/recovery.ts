import type { JournalDraftV2 } from './model';

export type RecoveryState = 'empty' | 'available' | 'malformed' | 'stale';

export function parseRecovery(raw: string | null, now = Date.now(), staleAfterMs = 14 * 24 * 60 * 60_000): { state: RecoveryState; draft?: JournalDraftV2 } {
  if (!raw) return { state: 'empty' };
  try {
    const parsed = JSON.parse(raw) as JournalDraftV2;
    if (!parsed.entryId || typeof parsed.body !== 'string' || !Number.isFinite(parsed.updatedAt)) return { state: 'malformed' };
    if (now - parsed.updatedAt > staleAfterMs) return { state: 'stale', draft: parsed };
    return { state: 'available', draft: parsed };
  } catch {
    return { state: 'malformed' };
  }
}
