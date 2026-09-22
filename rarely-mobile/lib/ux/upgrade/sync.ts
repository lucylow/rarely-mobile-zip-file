import { safeStorageRead, safeStorageWrite, type UpgradeStorage } from "./storage";
import type { PrivacyCenter } from "./privacyCenter";
import type { ActivityEvent, EventCursor, SyncAck, SyncBatch, SyncEvent } from "./types";

const OUTBOX_KEY = "rarely.upgrade.sync.outbox";
const CURSOR_KEY = "rarely.upgrade.sync.cursor";
const SYNC_VERSION = 1;

export interface SyncTransport {
  push(batch: SyncBatch): Promise<SyncAck>;
  pull(cursor: EventCursor | null, limit: number): Promise<{ events: SyncEvent[]; cursor: EventCursor | null }>;
}

export interface SyncSettings {
  enabled: boolean;
  batchSize: number;
  maxRetries: number;
}

export interface SyncStatus {
  state: "idle" | "syncing" | "paused" | "error";
  pending: number;
  lastSyncedAt?: string;
  lastError?: string;
  cursor: EventCursor | null;
}

export class SyncQueue {
  private outbox: SyncEvent[] = [];
  private cursor: EventCursor | null = null;
  private status: SyncStatus = { state: "idle", pending: 0, cursor: null };

  constructor(
    private readonly storage: UpgradeStorage,
    private readonly privacy: PrivacyCenter,
    private readonly settings: SyncSettings = { enabled: true, batchSize: 40, maxRetries: 2 },
  ) {}

  async hydrate(): Promise<SyncStatus> {
    const [outbox, cursor] = await Promise.all([
      safeStorageRead<unknown>(this.storage, OUTBOX_KEY),
      safeStorageRead<EventCursor | null>(this.storage, CURSOR_KEY),
    ]);
    if (!outbox.ok || !cursor.ok) {
      this.status = { ...this.status, state: "error", lastError: "storage_unavailable" };
      return this.status;
    }
    this.outbox = Array.isArray(outbox.value) ? outbox.value.filter(isSyncEvent) : [];
    this.cursor = cursor.value ?? null;
    this.status = { ...this.status, pending: this.outbox.length, cursor: this.cursor };
    return this.status;
  }

  async enqueue(event: ActivityEvent): Promise<boolean> {
    if (!this.settings.enabled || !this.privacy.canSync(event)) return false;
    const syncEvent = toSyncEvent(event);
    if (this.outbox.some((item) => item.id === syncEvent.id)) return false;
    this.outbox.push(syncEvent);
    await this.persist();
    this.status = { ...this.status, pending: this.outbox.length };
    return true;
  }

  async enqueueMany(events: ActivityEvent[]): Promise<number> {
    let added = 0;
    for (const event of events) if (await this.enqueue(event)) added += 1;
    return added;
  }

  async flush(transport: SyncTransport, deviceId: string): Promise<SyncStatus> {
    if (!this.settings.enabled) {
      this.status = { ...this.status, state: "paused" };
      return this.status;
    }
    this.status = { ...this.status, state: "syncing", lastError: undefined };
    try {
      let cycles = 0;
      while (this.outbox.length && cycles < this.settings.maxRetries + 1) {
        cycles += 1;
        const batchEvents = this.outbox.slice(0, this.settings.batchSize);
        const ack = await transport.push({ deviceId, cursor: this.cursor, events: batchEvents, clientTime: new Date().toISOString(), schemaVersion: SYNC_VERSION });
        const accepted = new Set(ack.accepted);
        this.outbox = this.outbox.filter((event) => !accepted.has(event.id));
        this.cursor = ack.serverCursor ?? this.cursor;
        if (ack.rejected.length && this.outbox.length === batchEvents.length) throw new Error(ack.rejected[0].reason || "sync_rejected");
        await this.persist();
      }
      if (!this.outbox.length) {
        const pulled = await transport.pull(this.cursor, this.settings.batchSize);
        this.cursor = pulled.cursor ?? this.cursor;
        await this.persist();
      }
      this.status = { ...this.status, state: "idle", pending: this.outbox.length, lastSyncedAt: new Date().toISOString(), cursor: this.cursor };
      return this.status;
    } catch (error) {
      this.status = { ...this.status, state: "error", pending: this.outbox.length, lastError: error instanceof Error ? error.message : "sync_failed", cursor: this.cursor };
      return this.status;
    }
  }

  async pause(): Promise<void> { this.status = { ...this.status, state: "paused" }; }
  getPending(): SyncEvent[] { return [...this.outbox]; }
  getStatus(): SyncStatus { return { ...this.status }; }

  private async persist(): Promise<void> {
    await safeStorageWrite(this.storage, OUTBOX_KEY, this.outbox);
    await safeStorageWrite(this.storage, CURSOR_KEY, this.cursor);
  }
}

function toSyncEvent(event: ActivityEvent): SyncEvent {
  return {
    id: event.id,
    // The client timestamp is carried as an opaque ordering hint. The server assigns the authoritative cursor.
    sequence: Date.parse(event.occurredAt),
    kind: event.kind,
    occurredAt: event.occurredAt,
    source: event.source,
    privacy: event.privacy,
    title: event.title,
    metadata: event.privacy === "public" ? event.metadata : redactSyncMetadata(event.metadata),
  };
}

function redactSyncMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const allowed = new Set(["moodId", "momentId", "toolId", "circleId", "circleName", "routineId", "feedback", "durationMinutes", "tags", "itemId"]);
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => allowed.has(key)));
}

function isSyncEvent(value: unknown): value is SyncEvent {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.kind === "string" && typeof item.occurredAt === "string" && typeof item.sequence === "number";
}
