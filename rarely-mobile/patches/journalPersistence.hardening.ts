import { readAndHeal, type KeyValueStorage } from "../lib/release/storage/healer";
import { safeJsonStringify } from "../lib/release/storage/safeJson";

export const JOURNAL_SCHEMA_VERSION = 3;
export const JOURNAL_KEY = "rarely.journal.entries";

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  prompt?: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export async function loadJournalSafe(storage: KeyValueStorage): Promise<{ entries: JournalEntry[]; repaired: boolean }> {
  const fallback: JournalEntry[] = [];
  const result = await readAndHeal<{ version: number; entries: JournalEntry[] }>(storage, JOURNAL_KEY, { version: JOURNAL_SCHEMA_VERSION, entries: fallback }, JOURNAL_SCHEMA_VERSION);
  const value = result.value;
  if (!value || !Array.isArray(value.entries)) return { entries: [], repaired: true };
  return { entries: value.entries.filter(isValidJournalEntry), repaired: result.status !== "valid" };
}

export async function saveJournalSafe(storage: KeyValueStorage, entries: JournalEntry[]): Promise<{ ok: true } | { ok: false; error: string }> {
  const sanitized = entries.filter(isValidJournalEntry).slice(0, 5_000);
  const payload = { version: JOURNAL_SCHEMA_VERSION, entries: sanitized };
  const serialized = safeJsonStringify(payload);
  if (!serialized.ok || !serialized.value) return { ok: false, error: "serialize-failed" };
  try { await storage.set(JOURNAL_KEY, serialized.value); return { ok: true }; }
  catch (error) { return { ok: false, error: error instanceof Error ? error.message : "storage-failed" }; }
}

function isValidJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.title === "string" && typeof row.text === "string" && typeof row.createdAt === "string" && typeof row.updatedAt === "string";
}
