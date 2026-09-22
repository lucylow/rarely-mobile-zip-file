import { describe, expect, it } from "vitest";
import { SyncQueue } from "../lib/ux/upgrade/sync";
import { PrivacyCenter } from "../lib/ux/upgrade/privacyCenter";
import { fixtureEvent } from "./fixtures";
import { createMemoryStorage } from "../lib/ux/upgrade/storage";
import type { ActivityDraft, EventCursor, SyncBatch, SyncEvent } from "../lib/ux/upgrade/types";

const now = "2026-09-22T15:00:00.000Z";

function event(kind: ActivityDraft["kind"], privacy: ActivityDraft["privacy"] = "personal") {
  return fixtureEvent({
    id: `${kind}-${privacy}`,
    kind,
    occurredAt: now,
    privacy,
    metadata: {
      moodId: "creative",
      text: "do not sync this body",
      itemId: "moment-1",
    },
  });
}

function transportFor(events: SyncEvent[], rejected: Array<{ id: string; reason: string }> = []) {
  const pushed: SyncBatch[] = [];
  let cursor: EventCursor | null = null;
  return {
    pushed,
    push: async (batch: SyncBatch) => {
      pushed.push(batch);
      const accepted = batch.events.filter((event) => !rejected.some((item) => item.id === event.id)).map((event) => event.id);
      if (accepted.length) cursor = { sequence: cursor ? cursor.sequence + accepted.length : accepted.length, eventId: accepted.at(-1)! };
      return { accepted, rejected: rejected.filter((item) => batch.events.some((event) => event.id === item.id)), serverCursor: cursor };
    },
    pull: async () => ({ events, cursor }),
  };
}

describe("SyncQueue", () => {
  it("rejects secret-like events before they enter the outbox", async () => {
    const q = new SyncQueue(createMemoryStorage(), new PrivacyCenter());
    await q.hydrate();
    const added = await q.enqueue(event("moment.completed", "secret-like"));
    expect(added).toBe(false);
    expect(q.getPending()).toHaveLength(0);
  });

  it("redacts personal metadata before queueing", async () => {
    const q = new SyncQueue(createMemoryStorage(), new PrivacyCenter());
    await q.hydrate();
    await q.enqueue(event("moment.completed"));
    const [queued] = q.getPending();
    expect(queued.metadata.text).toBeUndefined();
    expect(queued.metadata.moodId).toBe("creative");
  });

  it("deduplicates the same event id within the outbox", async () => {
    const q = new SyncQueue(createMemoryStorage(), new PrivacyCenter());
    await q.hydrate();
    const a = event("moment.completed");
    const first = await q.enqueue(a);
    const second = await q.enqueue(a);
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(q.getPending()).toHaveLength(1);
  });

  it("flushes accepted events and persists the server cursor", async () => {
    const storage = createMemoryStorage();
    const q = new SyncQueue(storage, new PrivacyCenter());
    await q.hydrate();
    await q.enqueue(event("moment.completed"));
    const transport = transportFor([]);
    const result = await q.flush(transport, "device-test");
    expect(result.state).toBe("idle");
    expect(result.pending).toBe(0);
    expect(result.cursor?.sequence).toBe(1);
  });

  it("does not discard rejected events when all events are rejected", async () => {
    const q = new SyncQueue(createMemoryStorage(), new PrivacyCenter());
    await q.hydrate();
    await q.enqueue(event("moment.completed"));
    const queued = q.getPending()[0];
    const transport = transportFor([], [{ id: queued.id, reason: "policy" }]);
    const result = await q.flush(transport, "device-test");
    expect(result.state).toBe("error");
    expect(result.pending).toBe(1);
    expect(result.lastError).toBe("policy");
  });

  it("leaves local state available when the transport fails", async () => {
    const q = new SyncQueue(createMemoryStorage(), new PrivacyCenter());
    await q.hydrate();
    await q.enqueue(event("moment.saved"));
    const result = await q.flush({
      push: async () => { throw new Error("offline"); },
      pull: async () => ({ events: [], cursor: null }),
    }, "device-test");
    expect(result.state).toBe("error");
    expect(result.pending).toBe(1);
    expect(q.getPending()).toHaveLength(1);
  });

  it("persists the outbox across queue instances", async () => {
    const storage = createMemoryStorage();
    const first = new SyncQueue(storage, new PrivacyCenter());
    await first.hydrate();
    await first.enqueue(event("moment.saved"));

    const second = new SyncQueue(storage, new PrivacyCenter());
    await second.hydrate();
    expect(second.getPending()).toHaveLength(1);
  });

  it("can be disabled without mutating queued data", async () => {
    const storage = createMemoryStorage();
    const q = new SyncQueue(storage, new PrivacyCenter(), { enabled: false, batchSize: 40, maxRetries: 2 });
    await q.hydrate();
    expect(await q.enqueue(event("moment.completed"))).toBe(false);
    const result = await q.flush(transportFor([]), "device-test");
    expect(result.state).toBe("paused");
    expect(result.pending).toBe(0);
  });

  it("pulls after a successful flush when the outbox is empty", async () => {
    const q = new SyncQueue(createMemoryStorage(), new PrivacyCenter());
    await q.hydrate();
    let pulled = 0;
    const result = await q.flush({
      push: async () => ({ accepted: [], rejected: [], serverCursor: null }),
      pull: async () => {
        pulled += 1;
        return { events: [], cursor: { sequence: 12, eventId: "evt-12" } };
      },
    }, "device-test");
    expect(result.state).toBe("idle");
    expect(pulled).toBe(1);
    expect(result.cursor).toEqual({ sequence: 12, eventId: "evt-12" });
  });

  it("hydrates malformed outbox data as an empty safe queue", async () => {
    const storage = createMemoryStorage();
    await storage.set("rarely.upgrade.sync.outbox", { broken: true });
    const q = new SyncQueue(storage, new PrivacyCenter());
    const result = await q.hydrate();
    expect(result.state).toBe("idle");
    expect(result.pending).toBe(0);
  });
});
