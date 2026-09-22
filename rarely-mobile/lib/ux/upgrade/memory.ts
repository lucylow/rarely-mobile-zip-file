import { clamp01, createMemoryId, daysBetween, topN } from "./ids";
import { generateMemoryCandidates } from "./memorySignals";
import { safeStorageRead, safeStorageWrite, type UpgradeStorage } from "./storage";
import type { ActivityEvent, MemoryCandidate, MemoryItem } from "./types";

const MEMORY_KEY = "rarely.upgrade.memories";
const MEMORY_VERSION = 1;

export interface MemoryPreferences {
  autoAcceptExplicit: boolean;
  minimumConfidence: number;
  maximumItems: number;
}

export const DEFAULT_MEMORY_PREFERENCES: MemoryPreferences = {
  autoAcceptExplicit: true,
  minimumConfidence: 0.45,
  maximumItems: 24,
};

export interface MemorySnapshot {
  state: "empty" | "loaded" | "malformed" | "unavailable";
  memories: MemoryItem[];
  version: number;
}

export class MemoryEngine {
  private memories: MemoryItem[] = [];
  private state: MemorySnapshot["state"] = "empty";

  constructor(
    private readonly storage: UpgradeStorage,
    private readonly preferences: MemoryPreferences = DEFAULT_MEMORY_PREFERENCES,
  ) {}

  async hydrate(): Promise<MemorySnapshot> {
    const result = await safeStorageRead<unknown>(this.storage, MEMORY_KEY);
    if (!result.ok) {
      this.state = "unavailable";
      return this.snapshot();
    }
    if (result.value === null) {
      this.state = "empty";
      this.memories = [];
      return this.snapshot();
    }
    if (!Array.isArray(result.value)) {
      this.state = "malformed";
      this.memories = [];
      return this.snapshot();
    }
    this.memories = result.value.filter(isMemoryItem).slice(0, this.preferences.maximumItems);
    this.state = this.memories.length ? "loaded" : "empty";
    return this.snapshot();
  }

  async refresh(events: ActivityEvent[], preferences: Record<string, unknown> = {}, now = new Date()): Promise<MemorySnapshot> {
    const candidates = generateMemoryCandidates(events, preferences, now);
    const next = new Map(this.memories.map((memory) => [memory.key, memory]));
    for (const candidate of candidates) {
      const confidence = calculateConfidence(candidate);
      const previous = next.get(candidate.key);
      if (previous) {
        next.set(candidate.key, mergeMemory(previous, candidate, confidence));
        continue;
      }
      if (confidence < this.preferences.minimumConfidence) continue;
      if (candidate.kind === "preference" && !this.preferences.autoAcceptExplicit) continue;
      next.set(candidate.key, candidateToMemory(candidate, confidence, now));
    }
    this.memories = selectMemories([...next.values()], this.preferences.maximumItems);
    this.state = this.memories.length ? "loaded" : "empty";
    await safeStorageWrite(this.storage, MEMORY_KEY, this.memories);
    return this.snapshot();
  }

  async accept(candidate: MemoryCandidate, now = new Date()): Promise<MemoryItem> {
    const item = candidateToMemory(candidate, Math.max(0.8, calculateConfidence(candidate)), now);
    this.memories = selectMemories([item, ...this.memories.filter((memory) => memory.id !== item.id)], this.preferences.maximumItems);
    await this.storage.set(MEMORY_KEY, this.memories);
    this.state = "loaded";
    return item;
  }

  async remove(memoryId: string): Promise<boolean> {
    const before = this.memories.length;
    this.memories = this.memories.filter((memory) => memory.id !== memoryId);
    if (before === this.memories.length) return false;
    await this.storage.set(MEMORY_KEY, this.memories);
    if (!this.memories.length) this.state = "empty";
    return true;
  }

  async clear(): Promise<void> {
    this.memories = [];
    this.state = "empty";
    await this.storage.remove(MEMORY_KEY);
  }

  getMemories(kind?: MemoryItem["kind"]): MemoryItem[] {
    return kind ? this.memories.filter((memory) => memory.kind === kind) : [...this.memories];
  }

  find(key: string): MemoryItem | null {
    return this.memories.find((memory) => memory.key === key) ?? null;
  }

  snapshot(): MemorySnapshot {
    return { state: this.state, memories: [...this.memories], version: MEMORY_VERSION };
  }

  explain(memory: MemoryItem): string {
    if (memory.source === "explicit") return `You told RARELY this about yourself: ${memory.value}.`;
    if (!memory.evidence.length) return memory.explanation;
    const recent = topN(memory.evidence, (entry) => entry.weight, 2);
    return `${memory.explanation} It is based on ${recent.length} recent interaction${recent.length === 1 ? "" : "s"}.`;
  }

  staleMemories(now = new Date(), staleAfterDays = 90): MemoryItem[] {
    return this.memories.filter((memory) => daysBetween(memory.lastSeenAt, now.toISOString()) >= staleAfterDays);
  }
}

function calculateConfidence(candidate: MemoryCandidate): number {
  const evidenceBoost = Math.min(0.25, candidate.evidence.reduce((sum, item) => sum + item.weight, 0) / 12);
  return clamp01(candidate.weight * 0.8 + evidenceBoost);
}

function candidateToMemory(candidate: MemoryCandidate, confidence: number, now: Date): MemoryItem {
  return {
    id: createMemoryId(candidate.key),
    key: candidate.key,
    kind: candidate.kind,
    label: candidate.label,
    value: candidate.value,
    confidence,
    firstSeenAt: candidate.evidence.at(0)?.occurredAt ?? now.toISOString(),
    lastSeenAt: candidate.evidence.at(-1)?.occurredAt ?? now.toISOString(),
    evidence: candidate.evidence,
    editable: true,
    source: candidate.kind === "preference" ? "explicit" : "inferred",
    explanation: candidate.explanation,
  };
}

function mergeMemory(previous: MemoryItem, candidate: MemoryCandidate, confidence: number): MemoryItem {
  return {
    ...previous,
    confidence: clamp01(previous.confidence * 0.55 + confidence * 0.45),
    lastSeenAt: candidate.evidence.at(-1)?.occurredAt ?? previous.lastSeenAt,
    evidence: [...previous.evidence, ...candidate.evidence].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 12),
    explanation: candidate.explanation,
  };
}

function selectMemories(memories: MemoryItem[], maximumItems: number): MemoryItem[] {
  const deduped = new Map<string, MemoryItem>();
  for (const memory of memories) {
    const existing = deduped.get(memory.id);
    if (!existing || memory.confidence > existing.confidence) deduped.set(memory.id, memory);
  }
  return topN(
    [...deduped.values()],
    (memory) => memory.confidence + (memory.source === "explicit" ? 0.2 : 0),
    maximumItems,
  );
}

function isMemoryItem(value: unknown): value is MemoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return Boolean(
    typeof item.id === "string" && typeof item.key === "string" && typeof item.kind === "string" &&
    typeof item.label === "string" && typeof item.value === "string" && typeof item.confidence === "number" &&
    typeof item.firstSeenAt === "string" && typeof item.lastSeenAt === "string" && Array.isArray(item.evidence),
  );
}
