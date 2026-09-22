import type { ActivityEvent } from "../lib/ux/upgrade";

export function fixtureEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    id: "fixture-event",
    kind: "moment.completed",
    source: "home",
    occurredAt: "2026-01-05T12:00:00.000Z",
    deviceId: "fixture-device",
    sessionId: "fixture-session",
    privacy: "personal",
    title: "Fixture moment",
    metadata: { moodId: "creative", momentId: "fixture", toolId: "journal", tags: ["creative"] },
    schemaVersion: 1,
    ...overrides,
  };
}

export function manyFixtures(count: number): ActivityEvent[] {
  return Array.from({ length: count }, (_, index) => fixtureEvent({
    id: `fixture-${index}`,
    occurredAt: new Date(Date.parse("2026-01-01T12:00:00.000Z") + index * 86_400_000).toISOString(),
    metadata: { moodId: index % 2 ? "creative" : "happy", momentId: `moment-${index % 4}`, tags: index % 3 ? ["creative"] : ["gentle"] },
  }));
}
