import { createSessionId, isSameDay } from "./ids";
import type { ActivityEvent, UpgradeActivityKind } from "./types";

export interface SessionSummary {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  eventCount: number;
  completedCount: number;
  meaningful: boolean;
  sources: string[];
}

export class SessionTracker {
  private readonly sessionId = createSessionId();
  private readonly startedAt = new Date().toISOString();
  private events: ActivityEvent[] = [];

  attach(event: ActivityEvent): void { this.events.push(event); }

  summary(now = new Date()): SessionSummary {
    const meaningfulKinds = new Set<UpgradeActivityKind>(["moment.completed", "create.completed", "journal.saved", "routine.completed", "circle.posted"]);
    const completedCount = this.events.filter((event) => meaningfulKinds.has(event.kind)).length;
    return {
      sessionId: this.sessionId,
      startedAt: this.startedAt,
      endedAt: now.toISOString(),
      eventCount: this.events.length,
      completedCount,
      meaningful: completedCount > 0,
      sources: [...new Set(this.events.map((event) => event.source))],
    };
  }

  sameDay(): boolean { return isSameDay(this.startedAt, new Date().toISOString()); }
}
