import type { AiMode } from "./types";
import type { UpgradeStorage } from "./storage";
import { safeStorageRead, safeStorageWrite } from "./storage";

const KEY = "rarely.upgrade.ai.history";

export interface AiHistoryEntry {
  id: string;
  mode: AiMode;
  title: string;
  body: string;
  nextStep?: string;
  createdAt: string;
  source: "ai" | "fallback";
}

export class AiHistoryStore {
  private entries: AiHistoryEntry[] = [];

  constructor(private readonly storage: UpgradeStorage, private readonly limit = 60) {}

  async hydrate(): Promise<AiHistoryEntry[]> {
    const result = await safeStorageRead<unknown>(this.storage, KEY);
    this.entries = result.ok && Array.isArray(result.value) ? result.value.filter(isEntry).slice(-this.limit) : [];
    return this.list();
  }

  async add(entry: AiHistoryEntry): Promise<void> {
    this.entries = [...this.entries.filter((item) => item.id !== entry.id), entry].slice(-this.limit);
    await safeStorageWrite(this.storage, KEY, this.entries);
  }

  async remove(id: string): Promise<boolean> {
    const before = this.entries.length;
    this.entries = this.entries.filter((entry) => entry.id !== id);
    if (before === this.entries.length) return false;
    await safeStorageWrite(this.storage, KEY, this.entries);
    return true;
  }

  async clear(): Promise<void> {
    this.entries = [];
    await this.storage.remove(KEY);
  }

  list(): AiHistoryEntry[] { return [...this.entries]; }
}

function isEntry(value: unknown): value is AiHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && (item.mode === "Spark" || item.mode === "Reflect" || item.mode === "Play") && typeof item.title === "string" && typeof item.body === "string" && typeof item.createdAt === "string" && (item.source === "ai" || item.source === "fallback");
}
