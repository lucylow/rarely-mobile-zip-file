import type { JournalEntryV2 } from './model';

export interface JournalSearchRecord {
  id: string;
  title: string;
  preview: string;
  tokens: string[];
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 200);
}

export function indexJournal(entry: JournalEntryV2): JournalSearchRecord {
  const text = `${entry.title} ${entry.body}`;
  return {
    id: entry.id,
    title: entry.title,
    preview: entry.body.slice(0, 180),
    tokens: [...new Set(tokenize(text))],
  };
}

export function searchJournal(records: JournalSearchRecord[], query: string): JournalSearchRecord[] {
  const q = tokenize(query);
  if (!q.length) return records;
  return records.map((record) => ({ record, score: q.reduce((score, token) => score + (record.tokens.includes(token) ? 1 : 0), 0) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.record);
}
