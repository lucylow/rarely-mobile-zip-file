import { createDeviceId, createEventId, createSessionId, topN } from "./ids";
import { safeStorageRead, safeStorageWrite, type UpgradeStorage } from "./storage";
import { PrivacyCenter, stripPrivateFields } from "./privacyCenter";
import type { ActivityDraft, ActivityEvent, ActivitySource, PrivacyClass, UpgradeActivityKind } from "./types";

const EVENTS_KEY = "rarely.upgrade.events";
const DEVICE_KEY = "rarely.upgrade.device";
const SESSION_KEY = "rarely.upgrade.session";
const MAX_EVENTS = 2500;
const SCHEMA_VERSION = 1;

export interface EventStoreSnapshot {
  state: "empty" | "loaded" | "malformed" | "unavailable";
  events: ActivityEvent[];
  deviceId: string;
  sessionId: string;
}

export interface EventStoreOptions {
  privacy: PrivacyCenter;
  now?: () => Date;
  maxEvents?: number;
}

export class ActivityStore {
  private events: ActivityEvent[] = [];
  private deviceId = "";
  private sessionId = "";
  private state: EventStoreSnapshot["state"] = "empty";
  private readonly now: () => Date;
  private readonly maxEvents: number;

  constructor(private readonly storage: UpgradeStorage, private readonly options: EventStoreOptions) {
    this.now = options.now ?? (() => new Date());
    this.maxEvents = Math.max(100, options.maxEvents ?? MAX_EVENTS);
  }

  async hydrate(): Promise<EventStoreSnapshot> {
    try {
      const [savedEvents, savedDevice, savedSession] = await Promise.all([
        safeStorageRead<unknown>(this.storage, EVENTS_KEY),
        safeStorageRead<string>(this.storage, DEVICE_KEY),
        safeStorageRead<string>(this.storage, SESSION_KEY),
      ]);
      if (!savedEvents.ok) {
        this.state = "unavailable";
        return this.snapshot();
      }
      if (savedEvents.value !== null && !Array.isArray(savedEvents.value)) {
        this.state = "malformed";
        this.events = [];
      } else {
        this.events = Array.isArray(savedEvents.value) ? normalizeEvents(savedEvents.value) : [];
        this.state = this.events.length ? "loaded" : "empty";
      }
      this.deviceId = savedDevice.ok ? (savedDevice.value ?? createDeviceId()) : createDeviceId();
      this.sessionId = savedSession.ok ? (savedSession.value ?? createSessionId()) : createSessionId();
      await Promise.all([
        this.storage.set(DEVICE_KEY, this.deviceId),
        this.storage.set(SESSION_KEY, this.sessionId),
      ]);
      return this.snapshot();
    } catch {
      this.state = "unavailable";
      return this.snapshot();
    }
  }

  async record<T extends Record<string, unknown>>(draft: ActivityDraft<T>): Promise<ActivityEvent<T>> {
    const occurredAt = draft.occurredAt ?? this.now().toISOString();
    const privacy = draft.privacy ?? this.options.privacy.classifyActivity(draft.kind);
    const safeMetadata = privacy === "public" || privacy === "personal"
      ? stripPrivateFields(draft.metadata)
      : draft.metadata;
    const deviceId = this.deviceId || createDeviceId();
    const sessionId = this.sessionId || createSessionId();
    this.deviceId = deviceId;
    this.sessionId = sessionId;
    const event: ActivityEvent<T> = {
      id: createEventId(deviceId, occurredAt, draft.kind),
      kind: draft.kind,
      source: draft.source,
      occurredAt,
      deviceId,
      sessionId,
      privacy,
      title: draft.title,
      metadata: safeMetadata as T,
      schemaVersion: SCHEMA_VERSION,
    };
    this.events = compactEvents([...this.events, event as ActivityEvent], this.maxEvents);
    this.state = "loaded";
    await safeStorageWrite(this.storage, EVENTS_KEY, this.events);
    return event;
  }

  async remove(eventId: string): Promise<boolean> {
    const before = this.events.length;
    this.events = this.events.filter((event) => event.id !== eventId);
    if (before === this.events.length) return false;
    await this.storage.set(EVENTS_KEY, this.events);
    if (!this.events.length) this.state = "empty";
    return true;
  }

  async clear(): Promise<void> {
    this.events = [];
    this.state = "empty";
    await this.storage.remove(EVENTS_KEY);
  }

  getEvents(options: {
    since?: string;
    until?: string;
    kinds?: UpgradeActivityKind[];
    sources?: ActivitySource[];
    privacy?: PrivacyClass[];
    limit?: number;
  } = {}): ActivityEvent[] {
    let output = [...this.events];
    if (options.since) output = output.filter((event) => event.occurredAt >= options.since!);
    if (options.until) output = output.filter((event) => event.occurredAt <= options.until!);
    if (options.kinds?.length) {
      const kinds = new Set(options.kinds);
      output = output.filter((event) => kinds.has(event.kind));
    }
    if (options.sources?.length) {
      const sources = new Set(options.sources);
      output = output.filter((event) => sources.has(event.source));
    }
    if (options.privacy?.length) {
      const privacy = new Set(options.privacy);
      output = output.filter((event) => privacy.has(event.privacy));
    }
    output.sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
    return options.limit === undefined ? output : output.slice(-Math.max(0, options.limit));
  }

  findLatest(kind: UpgradeActivityKind): ActivityEvent | null {
    return this.getEvents({ kinds: [kind], limit: 1 }).at(-1) ?? null;
  }

  count(kind: UpgradeActivityKind): number {
    return this.events.filter((event) => event.kind === kind).length;
  }

  distinctDays(kind?: UpgradeActivityKind): number {
    return new Set(this.events.filter((event) => !kind || event.kind === kind).map((event) => event.occurredAt.slice(0, 10))).size;
  }

  topTitles(limit = 5): Array<{ title: string; count: number }> {
    const counts = new Map<string, number>();
    for (const event of this.events) {
      if (!event.title) continue;
      counts.set(event.title, (counts.get(event.title) ?? 0) + 1);
    }
    return topN([...counts.entries()].map(([title, count]) => ({ title, count })), (item) => item.count, limit);
  }

  snapshot(): EventStoreSnapshot {
    return {
      state: this.state,
      events: [...this.events],
      deviceId: this.deviceId,
      sessionId: this.sessionId,
    };
  }

  getDeviceId(): string { return this.deviceId; }
  getSessionId(): string { return this.sessionId; }
}

function normalizeEvents(input: unknown[]): ActivityEvent[] {
  return input.filter(isActivityEvent).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)).slice(-MAX_EVENTS);
}

function isActivityEvent(value: unknown): value is ActivityEvent {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return Boolean(
    typeof item.id === "string" &&
    typeof item.kind === "string" &&
    typeof item.source === "string" &&
    typeof item.occurredAt === "string" &&
    typeof item.deviceId === "string" &&
    typeof item.sessionId === "string" &&
    typeof item.privacy === "string" &&
    typeof item.schemaVersion === "number" &&
    typeof item.metadata === "object" &&
    item.metadata !== null,
  );
}

function compactEvents(events: ActivityEvent[], maxEvents: number): ActivityEvent[] {
  if (events.length <= maxEvents) return events;
  const pinnedKinds = new Set(["journal.saved", "moment.completed", "routine.completed", "memory.accepted"]);
  const pinned = events.filter((event) => pinnedKinds.has(event.kind));
  const recent = events.slice(-Math.max(0, maxEvents - pinned.length));
  const unique = new Map([...pinned, ...recent].map((event) => [event.id, event]));
  return [...unique.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)).slice(-maxEvents);
}
