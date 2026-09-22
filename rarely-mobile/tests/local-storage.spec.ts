import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

import {
  appendAiPromptHistory,
  appendPersonalizationHistory,
  clearAiPromptHistory,
  clearFavoriteAiPromptHistory,
  restoreAiPromptHistory,
  clearPersonalizationHistory,
  clearRecommendationFeedback,
  loadAiMode,
  deleteAiPromptHistoryItem,
  loadAiPromptHistory,
  toggleAiPromptFavorite,
  loadRecommendationFeedback,
  loadPersonalizationHistory,
  parseActivityRecords,
  saveAiMode,
  saveRecommendationFeedback,
} from "../lib/ux/localStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadLocalActivitySnapshot } from "../lib/ux/localActivity";

describe("local storage guards", () => {
  beforeEach(() => {
    storage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T12:00:00.000Z"));
  });

  it("loads a canonical activity snapshot without failing all records", async () => {
    const snapshot = await loadLocalActivitySnapshot({
      getItem: async (key: string) => {
        if (key === "rarely.journalEntries") return JSON.stringify([{ text: "kept locally", date: "2026-08-20T12:00:00.000Z" }]);
        if (key === "rarely.completedMoments") throw new Error("moment storage unavailable");
        if (key === "rarely.joinedCircles") return JSON.stringify([{ id: "circle", joinedAt: "2026-08-20T12:00:00.000Z" }]);
        return "not-json";
      },
    });
    expect(snapshot.journal).toHaveLength(1);
    expect(snapshot.moments).toEqual([]);
    expect(snapshot.circles[0]?.id).toBe("circle");
    expect(snapshot.routines).toEqual([]);
    expect(snapshot.unavailableKeys).toEqual(["rarely.completedMoments"]);
  });

  it("persists a valid AI mode and rejects malformed values", async () => {
    await saveAiMode("reflect");
    expect(await loadAiMode()).toBe("reflect");
    storage.set("rarely.aiMode", "unknown");
    expect(await loadAiMode()).toBeNull();
  });

  it("caps AI prompt history and excludes private content fields", async () => {
    for (let i = 0; i < 12; i++) {
      await appendAiPromptHistory({ prompt: `Prompt ${i}`, feedback: i % 2 ? "useful" : "tryAnother", at: "2026-08-20T12:00:00.000Z" });
    }
    const history = await loadAiPromptHistory();
    expect(history).toHaveLength(10);
    expect(history[0]?.prompt).toBe("Prompt 11");
    expect(JSON.stringify(history)).not.toContain("journalEntries");
    expect(JSON.stringify(history)).not.toContain("imageUri");
  });

  it("clears only favorite AI prompts without touching private journal data", async () => {
    await appendAiPromptHistory({ prompt: "Favorite idea", favorite: true, at: "2026-08-20T12:00:00.000Z" });
    await appendAiPromptHistory({ prompt: "Keep idea", at: "2026-08-20T12:01:00.000Z" });
    storage.set("rarely.journalEntries", "private journal remains");
    await clearFavoriteAiPromptHistory();
    expect((await loadAiPromptHistory()).map((item) => item.prompt)).toEqual(["Keep idea"]);
    expect(storage.get("rarely.journalEntries")).toBe("private journal remains");
  });

  it("restores cleared AI history without touching private journal data", async () => {
    const prompt = { prompt: "Restore this idea", favorite: true, at: "2026-08-20T12:00:00.000Z" } as const;
    storage.set("rarely.journalEntries", "private journal remains");
    await restoreAiPromptHistory([prompt]);
    await clearAiPromptHistory();
    expect(await loadAiPromptHistory()).toEqual([]);
    await restoreAiPromptHistory([prompt]);
    expect((await loadAiPromptHistory())[0]?.prompt).toBe("Restore this idea");
    expect((await loadAiPromptHistory())[0]?.favorite).toBe(true);
    expect(storage.get("rarely.journalEntries")).toBe("private journal remains");
  });

  it("toggles AI prompt favorites without touching private journal data", async () => {
    await appendAiPromptHistory({ prompt: "A private-safe idea", at: "2026-08-20T12:00:00.000Z" });
    storage.set("rarely.journalEntries", "private journal remains");
    await toggleAiPromptFavorite("2026-08-20T12:00:00.000Z", "A private-safe idea");
    expect((await loadAiPromptHistory())[0]?.favorite).toBe(true);
    await toggleAiPromptFavorite("2026-08-20T12:00:00.000Z", "A private-safe idea");
    expect((await loadAiPromptHistory())[0]?.favorite).toBeUndefined();
    expect(storage.get("rarely.journalEntries")).toBe("private journal remains");
  });

  it("deletes one AI prompt and clears the AI history independently", async () => {
    await appendAiPromptHistory({ prompt: "Keep this", at: "2026-08-20T12:00:00.000Z" });
    await appendAiPromptHistory({ prompt: "Remove this", at: "2026-08-20T12:01:00.000Z" });
    storage.set("rarely.journalEntries", "private journal remains");
    await deleteAiPromptHistoryItem("2026-08-20T12:01:00.000Z", "Remove this");
    expect((await loadAiPromptHistory()).map((item) => item.prompt)).toEqual(["Keep this"]);
    await clearAiPromptHistory();
    expect(await loadAiPromptHistory()).toEqual([]);
    expect(storage.get("rarely.journalEntries")).toBe("private journal remains");
  });

  it("parses and deduplicates activity records safely", () => {
    const records = parseActivityRecords(
      JSON.stringify([
        "a",
        { id: "b", note: "ok", joinedAt: "2026-01-01T00:00:00.000Z" },
        { id: "b", note: "dup" },
        { id: "", note: "bad" },
        42,
      ]),
    );
    expect(records).toEqual([
      { id: "a" },
      { id: "b", note: "ok", joinedAt: "2026-01-01T00:00:00.000Z" },
    ]);
  });

  it("normalizes object records and drops invalid timestamps", () => {
    const records = parseActivityRecords(
      JSON.stringify([
        {
          id: "  c  ",
          name: "Daily check-in",
          note: "kept",
          imageUri: "file://img",
          joinedAt: "not-a-date",
          completedAt: "2026-08-01T00:00:00.000Z",
        },
      ]),
    );

    expect(records).toEqual([
      {
        id: "c",
        name: "Daily check-in",
        note: "kept",
        imageUri: "file://img",
        joinedAt: undefined,
        completedAt: "2026-08-01T00:00:00.000Z",
      },
    ]);
  });

  it("normalizes personalization history and caps to 30 entries", async () => {
    for (let i = 0; i < 35; i++) {
      await appendPersonalizationHistory({
        kind: "recommendation",
        value: `fits:item-${i}`,
        at: "invalid-date",
      });
    }

    const history = await loadPersonalizationHistory();
    expect(history).toHaveLength(30);
    expect(history[0]?.at).toBe("2026-08-20T12:00:00.000Z");
    expect(history[0]?.value).toBe("fits:item-34");
    expect(history[29]?.value).toBe("fits:item-5");
  });

  it("serializes concurrent history writes without losing signals", async () => {
    await Promise.all([
      appendPersonalizationHistory({ kind: "mood", value: "creative", at: "2026-08-20T12:00:00.000Z" }),
      appendPersonalizationHistory({ kind: "mood", value: "calm", at: "2026-08-20T12:01:00.000Z" }),
    ]);
    const history = await loadPersonalizationHistory();
    expect(history.map((item) => item.value)).toEqual(["calm", "creative"]);
  });

  it("sanitizes malformed recommendation feedback payloads", async () => {
    storage.set(
      "rarely.personalizationFeedback",
      JSON.stringify({
        "mood:creative": { fits: 2, dismissed: 1, lastFitsAt: "2026-08-19T00:00:00.000Z" },
        "": { fits: 999 },
        "broken:item": { fits: "bad", dismissed: null },
        "circle:music": { dismissed: 1, lastDismissedAt: "invalid-date" },
      }),
    );

    const feedback = await loadRecommendationFeedback();
    expect(feedback).toEqual({
      "mood:creative": {
        fits: 2,
        dismissed: 1,
        lastFitsAt: "2026-08-19T00:00:00.000Z",
        lastDismissedAt: undefined,
      },
      "circle:music": {
        fits: undefined,
        dismissed: 1,
        lastFitsAt: undefined,
        lastDismissedAt: undefined,
      },
    });
  });

  it("clears recommendation feedback without touching history", async () => {
    storage.set("rarely.personalizationFeedback", JSON.stringify({ "mood:creative": { fits: 1 } }));
    storage.set("rarely.personalizationHistory", JSON.stringify([{ kind: "mood", value: "creative", at: "2026-08-20T12:00:00.000Z" }]));
    await clearRecommendationFeedback();
    expect(await loadRecommendationFeedback()).toEqual({});
    expect(await loadPersonalizationHistory()).toHaveLength(1);
  });

  it("clears personalization history without touching feedback", async () => {
    storage.set("rarely.personalizationFeedback", JSON.stringify({ "mood:creative": { fits: 1 } }));
    storage.set("rarely.personalizationHistory", JSON.stringify([{ kind: "mood", value: "creative", at: "2026-08-20T12:00:00.000Z" }]));
    await clearPersonalizationHistory();
    expect(await loadPersonalizationHistory()).toEqual([]);
    expect(await loadRecommendationFeedback()).toEqual({ "mood:creative": { fits: 1, dismissed: undefined, lastFitsAt: undefined, lastDismissedAt: undefined } });
  });

  it("keeps AI history usable when favorite persistence fails", async () => {
    storage.set("rarely.aiPromptHistory", JSON.stringify([
      { prompt: "A private prompt", at: "2026-08-20T12:00:00.000Z", favorite: false },
    ]));
    const setItemMock = vi.mocked(AsyncStorage.setItem);
    setItemMock.mockRejectedValueOnce(new Error("storage unavailable"));
    await expect(toggleAiPromptFavorite("2026-08-20T12:00:00.000Z", "A private prompt"))
      .resolves.toMatchObject([{ prompt: "A private prompt", at: "2026-08-20T12:00:00.000Z" }]);
  });

  it("throws when recommendation feedback persistence fails", async () => {
    const setItemMock = vi.mocked(AsyncStorage.setItem);
    setItemMock.mockRejectedValueOnce(new Error("storage unavailable"));
    await expect(
      saveRecommendationFeedback({
        "mood:creative": { fits: 1, dismissed: 0, lastFitsAt: "2026-08-19T00:00:00.000Z" },
      }),
    ).rejects.toThrow("storage unavailable");
  });
});
