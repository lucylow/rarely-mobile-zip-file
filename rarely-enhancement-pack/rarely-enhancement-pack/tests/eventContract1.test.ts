import { describe, expect, it } from "vitest";
import { ActivityStore, createMemoryStorage, PrivacyCenter, DEFAULT_PRIVACY_SETTINGS } from "../lib/ux/upgrade";

describe("event contract suite 1", () => {
  it("round trips mood.checked #1.1", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "mood.checked", source: "home", metadata: { suite: 1, index: 1 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("mood.checked");
    expect(snapshot.events[0].source).toBe("home");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips moment.viewed #1.2", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "moment.viewed", source: "home", metadata: { suite: 1, index: 2 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("moment.viewed");
    expect(snapshot.events[0].source).toBe("home");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips moment.completed #1.3", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "moment.completed", source: "home", metadata: { suite: 1, index: 3 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("moment.completed");
    expect(snapshot.events[0].source).toBe("home");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips moment.saved #1.4", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "moment.saved", source: "home", metadata: { suite: 1, index: 4 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("moment.saved");
    expect(snapshot.events[0].source).toBe("home");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips moment.dismissed #1.5", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "moment.dismissed", source: "home", metadata: { suite: 1, index: 5 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("moment.dismissed");
    expect(snapshot.events[0].source).toBe("home");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips journal.started #1.6", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "journal.started", source: "journal", metadata: { suite: 1, index: 6 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("journal.started");
    expect(snapshot.events[0].source).toBe("journal");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips journal.saved #1.7", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "journal.saved", source: "journal", metadata: { suite: 1, index: 7 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("journal.saved");
    expect(snapshot.events[0].source).toBe("journal");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips journal.deleted #1.8", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "journal.deleted", source: "journal", metadata: { suite: 1, index: 8 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("journal.deleted");
    expect(snapshot.events[0].source).toBe("journal");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips create.started #1.9", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "create.started", source: "create", metadata: { suite: 1, index: 9 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("create.started");
    expect(snapshot.events[0].source).toBe("create");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips create.completed #1.10", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "create.completed", source: "create", metadata: { suite: 1, index: 10 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("create.completed");
    expect(snapshot.events[0].source).toBe("create");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips circle.joined #1.11", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "circle.joined", source: "community", metadata: { suite: 1, index: 11 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("circle.joined");
    expect(snapshot.events[0].source).toBe("community");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips circle.left #1.12", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "circle.left", source: "community", metadata: { suite: 1, index: 12 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("circle.left");
    expect(snapshot.events[0].source).toBe("community");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips circle.posted #1.13", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "circle.posted", source: "community", metadata: { suite: 1, index: 13 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("circle.posted");
    expect(snapshot.events[0].source).toBe("community");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips circle.reacted #1.14", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "circle.reacted", source: "community", metadata: { suite: 1, index: 14 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("circle.reacted");
    expect(snapshot.events[0].source).toBe("community");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips routine.started #1.15", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "routine.started", source: "studio", metadata: { suite: 1, index: 15 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("routine.started");
    expect(snapshot.events[0].source).toBe("studio");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips routine.completed #1.16", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "routine.completed", source: "studio", metadata: { suite: 1, index: 16 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("routine.completed");
    expect(snapshot.events[0].source).toBe("studio");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips routine.skipped #1.17", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "routine.skipped", source: "studio", metadata: { suite: 1, index: 17 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("routine.skipped");
    expect(snapshot.events[0].source).toBe("studio");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips scrapbook.opened #1.18", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "scrapbook.opened", source: "scrapbook", metadata: { suite: 1, index: 18 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("scrapbook.opened");
    expect(snapshot.events[0].source).toBe("scrapbook");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips memory.accepted #1.19", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "memory.accepted", source: "profile", metadata: { suite: 1, index: 19 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("memory.accepted");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips memory.rejected #1.20", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "memory.rejected", source: "profile", metadata: { suite: 1, index: 20 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("memory.rejected");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips memory.deleted #1.21", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "memory.deleted", source: "profile", metadata: { suite: 1, index: 21 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("memory.deleted");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips recommendation.fitted #1.22", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "recommendation.fitted", source: "home", metadata: { suite: 1, index: 22 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("recommendation.fitted");
    expect(snapshot.events[0].source).toBe("home");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips recommendation.rejected #1.23", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "recommendation.rejected", source: "home", metadata: { suite: 1, index: 23 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("recommendation.rejected");
    expect(snapshot.events[0].source).toBe("home");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips backup.exported #1.24", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "backup.exported", source: "profile", metadata: { suite: 1, index: 24 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("backup.exported");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips backup.imported #1.25", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "backup.imported", source: "profile", metadata: { suite: 1, index: 25 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("backup.imported");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips sync.completed #1.26", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "sync.completed", source: "system", metadata: { suite: 1, index: 26 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("sync.completed");
    expect(snapshot.events[0].source).toBe("system");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips notification.opened #1.27", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "notification.opened", source: "system", metadata: { suite: 1, index: 27 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("notification.opened");
    expect(snapshot.events[0].source).toBe("system");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips ai.sparked #1.28", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "ai.sparked", source: "profile", metadata: { suite: 1, index: 28 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("ai.sparked");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips ai.reflected #1.29", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "ai.reflected", source: "profile", metadata: { suite: 1, index: 29 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("ai.reflected");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

  it("round trips ai.played #1.30", async () => {
    const store = new ActivityStore(createMemoryStorage(), { privacy: new PrivacyCenter(DEFAULT_PRIVACY_SETTINGS) });
    await store.hydrate();
    const event = await store.record({ kind: "ai.played", source: "profile", metadata: { suite: 1, index: 30 } });
    const snapshot = store.snapshot();
    expect(snapshot.state).toBe("loaded");
    expect(snapshot.events.length).toBe(1);
    expect(snapshot.events[0].kind).toBe("ai.played");
    expect(snapshot.events[0].source).toBe("profile");
    expect(event.schemaVersion).toBe(1);
  });

});
