import type { ActivityDraft, ActivityEvent, UpgradeActivityKind } from "./types";
import type { ActivityStore } from "./eventStore";
import type { SyncQueue } from "./sync";
import type { TelemetryBuffer } from "./telemetry";
import type { SessionTracker } from "./session";

export class UpgradeActivityRecorder {
  constructor(
    private readonly store: ActivityStore,
    private readonly sync: SyncQueue,
    private readonly telemetry?: TelemetryBuffer,
    private readonly session?: SessionTracker,
  ) {}

  async record<T extends Record<string, unknown>>(draft: ActivityDraft<T>): Promise<ActivityEvent<T>> {
    const event = await this.store.record(draft);
    await this.sync.enqueue(event);
    this.session?.attach(event);
    this.telemetry?.track("activity", { kind: draft.kind, source: draft.source, privacy: event.privacy });
    return event;
  }

  async completed(
    kind: Extract<UpgradeActivityKind, "moment.completed" | "create.completed" | "routine.completed" | "journal.saved" | "circle.posted">,
    source: ActivityDraft["source"],
    metadata: Record<string, unknown>,
    title?: string,
  ): Promise<ActivityEvent> {
    return this.record({ kind, source, metadata, title });
  }
}
