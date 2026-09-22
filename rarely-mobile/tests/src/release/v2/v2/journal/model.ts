export interface JournalEntryV2 {
  id: string;
  title: string;
  body: string;
  mood?: string;
  createdAt: number;
  updatedAt: number;
  archived: boolean;
  version: number;
}

export interface JournalDraftV2 {
  entryId: string;
  body: string;
  updatedAt: number;
  dirty: boolean;
}

export function normalizeJournalEntry(entry: JournalEntryV2): JournalEntryV2 {
  return {
    ...entry,
    title: entry.title.trim().slice(0, 160),
    body: entry.body.slice(0, 50_000),
    version: Math.max(1, entry.version),
  };
}
