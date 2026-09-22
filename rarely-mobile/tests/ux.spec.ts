import { describe, expect, it } from "vitest";
import { moodPrompt, nextExperience } from "../lib/ux/moodCheckIn";
import { onboardingProgress, shouldShowOnboarding, transition } from "../lib/ux/onboardingMachine";
import { getJournalExportMode, prepareJournalExportText } from "../lib/ux/export";
import { clearJournalDraftBestEffort, isPrivateImageUri, loadJournalDraftBestEffort, validatePrivateImageUri } from "../lib/ux/journalPersistence";
import { resetKeysBestEffort } from "../lib/ux/localReset";
import { getMotionDistance, getMotionDuration } from "../lib/ux/motion";
import { restoreSession, saveSession } from "../lib/ux/session";
import { createMemoryStorage } from "./helpers/memoryStorage";

describe("RARELY UX primitives", () => {
  it("maps moods to helpful next surfaces", () => {
    expect(moodPrompt("creative")).toContain("make");
    expect(nextExperience("social").surface).toBe("community");
  });

  it("supports skippable onboarding with progress", () => {
    expect(transition("welcome", { type: "NEXT" })).toBe("intent");
    expect(transition("permissions", { type: "SKIP" })).toBe("done");
    expect(onboardingProgress("personalize")).toBe(0.8);
  });

  it("keeps the current route when onboarding storage is unavailable", async () => {
    const brokenStorage = {
      getItem: async () => {
        throw new Error("storage unavailable");
      },
    };
    await expect(shouldShowOnboarding(brokenStorage)).resolves.toBe(false);
    await expect(shouldShowOnboarding({ getItem: async () => null })).resolves.toBe(true);
    await expect(shouldShowOnboarding({ getItem: async () => "true" })).resolves.toBe(false);
  });

  it("selects an explicit journal export mode", () => {
    expect(getJournalExportMode("web", false)).toBe("web-share");
    expect(getJournalExportMode("ios", true)).toBe("native-share");
    expect(getJournalExportMode("android", false)).toBe("unavailable");
  });

  it("prepares only valid journal records for export", () => {
    expect(prepareJournalExportText([])).toBeNull();
    expect(prepareJournalExportText([{ text: "" }, { text: 42 }])).toBeNull();
    expect(prepareJournalExportText([{ text: "  Keep this  ", date: "not-a-date" }])).toContain("Unknown date\nKeep this");
  });

  it("keeps journal entry success independent from draft cleanup", async () => {
    await expect(clearJournalDraftBestEffort({ removeItem: async () => undefined })).resolves.toBe(true);
    await expect(clearJournalDraftBestEffort({ removeItem: async () => { throw new Error("storage unavailable"); } })).resolves.toBe(false);
  });

  it("distinguishes journal draft availability states", async () => {
    await expect(loadJournalDraftBestEffort({ getItem: async () => null })).resolves.toEqual({ status: "empty" });
    await expect(loadJournalDraftBestEffort({ getItem: async () => JSON.stringify({ text: "Keep this", updatedAt: "2026-08-22T12:00:00.000Z" }) })).resolves.toMatchObject({ status: "loaded", attachmentSkipped: false, draft: { text: "Keep this" } });
    await expect(loadJournalDraftBestEffort({ getItem: async () => JSON.stringify({ text: "Keep this", imageUri: "https://example.com/private.jpg" }) })).resolves.toMatchObject({ status: "loaded", attachmentSkipped: true, draft: { text: "Keep this" } });
    await expect(loadJournalDraftBestEffort({ getItem: async () => JSON.stringify({ updatedAt: "invalid" }) })).resolves.toEqual({ status: "malformed" });
    await expect(loadJournalDraftBestEffort({ getItem: async () => { throw new Error("storage unavailable"); } })).resolves.toEqual({ status: "unavailable" });
  });

  it("accepts only local image references for private attachments", () => {
    expect(isPrivateImageUri("file:///private/image.jpg")).toBe(true);
    expect(isPrivateImageUri("content://media/external/images/1")).toBe(true);
    expect(isPrivateImageUri("https://example.com/image.jpg")).toBe(false);
    expect(isPrivateImageUri("not-an-image")).toBe(false);
  });

  it("validates private image existence without propagating storage failures", async () => {
    await expect(validatePrivateImageUri("file:///private/image.jpg", { getInfoAsync: async () => ({ exists: true }) })).resolves.toBe("valid");
    await expect(validatePrivateImageUri("file:///missing/image.jpg", { getInfoAsync: async () => ({ exists: false }) })).resolves.toBe("missing");
    await expect(validatePrivateImageUri("file:///private/image.jpg", { getInfoAsync: async () => { throw new Error("filesystem unavailable"); } })).resolves.toBe("unavailable");
    await expect(validatePrivateImageUri("https://example.com/image.jpg")).resolves.toBe("invalid");
  });

  it("keeps motion bounded and disables it for reduced-motion users", () => {
    expect(getMotionDuration(false, 280)).toBe(280);
    expect(getMotionDuration(false, -10)).toBe(0);
    expect(getMotionDuration(true, 280)).toBe(0);
    expect(getMotionDistance(false, 8)).toBe(8);
    expect(getMotionDistance(true, 8)).toBe(0);
  });

  it("reports complete and partial local reset outcomes", async () => {
    await expect(resetKeysBestEffort({ removeItem: async () => undefined }, ["one", "two"])).resolves.toEqual({ clearedKeys: ["one", "two"], failedKeys: [] });
    await expect(resetKeysBestEffort({ removeItem: async (key) => { if (key === "two") throw new Error("disk unavailable"); } }, ["one", "two"])).resolves.toEqual({ clearedKeys: ["one"], failedKeys: ["two"] });
    await expect(resetKeysBestEffort({ removeItem: async () => { throw new Error("disk unavailable"); } }, ["one"])).resolves.toEqual({ clearedKeys: [], failedKeys: ["one"] });
  });

  it("recovers valid sessions and clears malformed values", async () => {
    const storage = createMemoryStorage();
    await saveSession(storage, { lastSurface: "create", lastRoute: "/journal" });
    await expect(restoreSession(storage)).resolves.toEqual({ lastSurface: "create", lastRoute: "/journal" });
    await storage.setItem("rarely.session.v1", "not-json");
    await expect(restoreSession(storage)).resolves.toBeNull();
  });

  it("stays resilient when invalid-session cleanup fails", async () => {
    const storage = createMemoryStorage({ "rarely.session.v1": "not-json" });
    const failingCleanupStorage = {
      ...storage,
      removeItem: async () => {
        throw new Error("disk unavailable");
      },
    };

    await expect(restoreSession(failingCleanupStorage)).resolves.toBeNull();
  });
});
