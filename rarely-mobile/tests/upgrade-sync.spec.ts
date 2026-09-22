import { describe, expect, it } from "vitest";
import { createUpgradeService, hydrateUpgradeService } from "../lib/ux/upgrade/upgradeService";
import { createMemoryStorage } from "../lib/ux/upgrade/storage";

describe("RARELY upgrade integration", () => {
  it("records activity locally and enqueues privacy-safe sync events", async () => {
    const service = createUpgradeService({
      storage: createMemoryStorage(),
      privacy: {
        syncPersonalEvents: true,
        syncPrivateJournals: false,
        diagnosticsEnabled: false,
        notificationsEnabled: true,
        aiConsent: false,
        communityPreflightEnabled: true,
        shareScrapbookByDefault: false,
      },
    });

    const event = await service.recorder.record({
      kind: "moment.completed",
      source: "home",
      metadata: {
        moodId: "creative",
        text: "do not sync this journal body",
        itemId: "moment-1",
      },
      title: "Creative push",
    });

    expect(event.kind).toBe("moment.completed");
    expect(event.privacy).toBe("personal");
    expect(service.sync.getPending()).toHaveLength(1);
    expect(service.sync.getPending()[0].metadata.moodId).toBe("creative");
    expect(service.sync.getPending()[0].metadata.text).toBeUndefined();
    expect(service.sync.getPending()[0].title).toBe("Creative push");
  });

  it("hydrates the sync queue across service instances without losing queued events", async () => {
    const storage = createMemoryStorage();
    const first = createUpgradeService({ storage });
    await first.recorder.record({
      kind: "journal.saved",
      source: "journal",
      metadata: { prompt: "reflective check-in" },
      privacy: "private-journal",
    });

    const second = createUpgradeService({ storage });
    await hydrateUpgradeService(second);

    expect(second.sync.getPending()).toHaveLength(0);
    expect(second.activity.snapshot().events).toHaveLength(1);
  });
});
