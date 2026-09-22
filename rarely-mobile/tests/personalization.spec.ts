import { describe, expect, it } from "vitest";
import { resetPersonalizationBestEffort } from "../lib/ux/preferencesPersistence";
import { checkAiOutput, checkAiRequest, minimizeAiContext, scrubAiText } from "../lib/ux/aiSafety";
import { getAiGovernanceDisclosure, getAiPromptPolicy } from "../lib/ux/aiPrompts";
import { scorePreferences } from "../lib/ux/onboardingPersonalization";
import { aiCreativeModes, applyRecommendationFeedback, buildPersonalizationProfile, describeRecommendationSignal, fallbackAiPrompt, isRecommendationExploring, normalizeRecommendationFeedback, personalizedRationale, personalizedAiPrompt, personalizedCreatePrompt, rankCreateTools, rankMoodOptions, rankRoutines, rankWithFeedback, recommendationKey, refineAiPrompt, selectedFeedbackKind, summarizeRecommendationFeedback, timeAwarePrompt } from "../lib/ux/personalization";

describe("local personalization", () => {
  it("keeps AI prompt governance versioned and reversible", () => {
    const policy = getAiPromptPolicy("spark");
    const rolledBack = getAiPromptPolicy("spark", false);
    expect(policy.version).toBe("2026-08-22.1");
    expect(policy.enabled).toBe(true);
    expect(policy.privacyBoundary.toLowerCase()).toContain("never use private journal");
    expect(policy.fallback).toContain("small idea");
    expect(rolledBack.enabled).toBe(false);
    expect(rolledBack.fallback).toContain("small idea");
    expect(getAiGovernanceDisclosure()).toContain("private journal text and images stay on this device");
    expect(getAiGovernanceDisclosure("private-fallback")).toContain("nothing was sent anywhere");
  });

  it("keeps AI context bounded and privacy-safe", () => {
    expect(scrubAiText("Email me at hello@example.com or use password:secret")).toContain("[REDACTED]");
    expect(minimizeAiContext({ interest: "music", privateNote: "never send", mode: "spark" }, ["interest", "mode"]))
      .toEqual({ interest: "music", mode: "spark" });
    expect(checkAiRequest({ task: "creative", requestId: "test-1", context: { interest: "music" }, userConsented: false }))
      .toEqual({ allowed: false, flags: ["consent_required"] });
    expect(checkAiRequest({ task: "creative", requestId: "test-2", context: { text: "password:secret" }, userConsented: true }).flags)
      .toContain("secret_like");
    expect(checkAiOutput("x".repeat(12_001))).toEqual({ allowed: false, flags: ["output_too_large"] });
  });

  it("reports partial local failures during personalization reset", async () => {
    const partialStorage = {
      setItem: async () => undefined,
      removeItem: async (key: string) => {
        if (key === "rarely.lastMood") throw new Error("storage unavailable");
      },
    };
    await expect(resetPersonalizationBestEffort(partialStorage, "{}"))
      .resolves.toEqual({ preferencesSaved: true, starterPathCleared: true, lastMoodCleared: false });

    const unavailableStorage = {
      setItem: async () => { throw new Error("storage unavailable"); },
      removeItem: async () => undefined,
    };
    await expect(resetPersonalizationBestEffort(unavailableStorage, "{}"))
      .resolves.toEqual({ preferencesSaved: false, starterPathCleared: false, lastMoodCleared: false });
  });

  it("selects the strongest private interest and counts local memories", () => {
    const preferences = scorePreferences({ music: 1, creativity: 0.5 });
    const profile = buildPersonalizationProfile(preferences, { journalCount: 2, momentCount: 1, circleCount: 0, routineCount: 1 });
    expect(profile.topInterestKey).toBe("music");
    expect(profile.topInterestLabel).toBe("your soundtrack");
    expect(profile.totalMemories).toBe(4);
  });

  it("uses recent activity without exposing journal text", () => {
    const profile = buildPersonalizationProfile(scorePreferences({ journaling: 1 }), { journalCount: 1, momentCount: 0, circleCount: 0, routineCount: 0, lastActivityAt: new Date().toISOString() });
    expect(profile.recentActivity).toBe(true);
    expect(personalizedRationale(profile, "calm")).toContain("story you have already started");
    expect(personalizedCreatePrompt(profile)).toContain("private collection");
  });

  it("honors quiet hours and reversible recommendation feedback", () => {
    const profile = buildPersonalizationProfile(scorePreferences({ quietHours: true }), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 });
    expect(timeAwarePrompt(profile, 22)).toContain("gentle pause");
    const ranked = rankWithFeedback([{ id: "one" }, { id: "two" }], { one: { dismissed: 1 }, two: { fits: 1 } });
    expect(ranked.map((item) => item.id)).toEqual(["two", "one"]);
  });

  it("keeps AI prompts local, low-pressure, and quiet-hours aware", () => {
    const calmProfile = buildPersonalizationProfile(scorePreferences({ creativity: 1, quietHours: true }), { journalCount: 3, momentCount: 1, circleCount: 0, routineCount: 0 });
    expect(personalizedAiPrompt(calmProfile)).toContain("gentle creative question");
    expect(personalizedAiPrompt(calmProfile).toLowerCase()).toContain("never");
    const playfulProfile = buildPersonalizationProfile(scorePreferences({ music: 1 }), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 });
    const playfulPrompt = personalizedAiPrompt(playfulProfile);
    expect(playfulPrompt).toContain("creative question");
    expect(playfulPrompt).toContain("low-pressure");
    expect(playfulPrompt.toLowerCase()).toContain("never use private journal text or images");
  });

  it("supports distinct AI modes without widening the private input scope", () => {
    const profile = buildPersonalizationProfile(scorePreferences({ creativity: 1 }), { journalCount: 2, momentCount: 0, circleCount: 0, routineCount: 0 });
    const prompts = aiCreativeModes.map((mode) => personalizedAiPrompt(profile, mode.id));
    expect(new Set(prompts).size).toBe(aiCreativeModes.length);
    for (const prompt of prompts) {
      expect(prompt.toLowerCase()).toContain("optional");
      expect(prompt.toLowerCase()).toContain("never use private journal text or images");
    }
    expect(prompts[0]).toContain("surprising but kind");
    expect(prompts[1]).toContain("grounded reflection");
    expect(prompts[2]).toContain("playful imaginative");
  });

  it("refines AI prompts locally and provides mode-specific fallbacks", () => {
    const base = "Offer one creative question.";
    expect(refineAiPrompt(base, "gentler")).toContain("gentle and optional");
    expect(refineAiPrompt(base, "shorter")).toContain("one simple question");
    expect(refineAiPrompt(base, "morePlayful")).toContain("more playful");
    expect(refineAiPrompt("", "gentler")).toContain("small, honest detail");
    expect(fallbackAiPrompt("spark")).toContain("small idea");
    expect(fallbackAiPrompt("reflect")).toContain("detail");
    expect(fallbackAiPrompt("play")).toContain("color or sound");
    for (const mode of aiCreativeModes) {
      expect(fallbackAiPrompt(mode.id).toLowerCase()).not.toContain("journal");
    }
  });

  it("ranks Create tools from the private interest profile", () => {
    const profile = buildPersonalizationProfile(scorePreferences({ music: 1 }), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 });
    const tools = [{ id: "journal" }, { id: "music" }, { id: "photo" }];
    expect(rankCreateTools(tools, profile).map((tool) => tool.id)[0]).toBe("music");
  });

  it("applies scoped feedback to Create and routine rankings", () => {
    const profile = buildPersonalizationProfile(scorePreferences({ creativity: 1 }), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 });
    const tools = [{ id: "journal" }, { id: "photo" }, { id: "collage" }];
    const routines = [{ id: "soft" }, { id: "color" }, { id: "reset" }];
    const feedback = {
      [recommendationKey("create", "journal")]: { dismissed: 1 },
      [recommendationKey("create", "photo")]: { fits: 1 },
      [recommendationKey("routine", "soft")]: { dismissed: 1 },
      [recommendationKey("routine", "reset")]: { fits: 1 },
    };
    expect(rankCreateTools(tools, profile, feedback).map((tool) => tool.id)[0]).toBe("photo");
    expect(rankRoutines(routines, profile, feedback).map((routine) => routine.id)[0]).toBe("reset");
  });

  it("adapts Home mood order from feedback", () => {
    const ranked = rankMoodOptions(
      [{ id: "happy" }, { id: "creative" }, { id: "stressed" }],
      {
        [recommendationKey("mood", "creative")]: { fits: 1 },
        [recommendationKey("mood", "happy")]: { dismissed: 1 },
      },
    );
    expect(ranked.map((mood) => mood.id)).toEqual(["creative", "stressed", "happy"]);
  });

  it("describes legacy and scoped recommendation history entries", () => {
    expect(describeRecommendationSignal("fits:mood:creative")).toContain('mood suggestions for "Creative" fits you');
    expect(describeRecommendationSignal("dismissed:photo")).toContain('mood suggestions for "photo" was not for you');
  });

  it("records feedback timestamps and favors fresher wins", () => {
    const staleDate = "2025-01-01T00:00:00.000Z";
    const freshDate = new Date().toISOString();
    const first = applyRecommendationFeedback({}, recommendationKey("mood", "happy"), "fits", staleDate);
    const second = applyRecommendationFeedback(first, recommendationKey("mood", "creative"), "fits", freshDate);
    const third = applyRecommendationFeedback(second, recommendationKey("mood", "happy"), "dismissed", staleDate);
    expect(third[recommendationKey("mood", "creative")]?.lastFitsAt).toBe(freshDate);
    const ranked = rankMoodOptions([{ id: "happy" }, { id: "creative" }], third);
    expect(ranked.map((item) => item.id)[0]).toBe("creative");
  });

  it("decays stale recommendation signals to keep ranking adaptable", () => {
    const staleDate = "2024-01-01T00:00:00.000Z";
    const freshDate = new Date().toISOString();
    const ranked = rankMoodOptions(
      [{ id: "happy" }, { id: "creative" }],
      {
        [recommendationKey("mood", "creative")]: { fits: 5, lastFitsAt: staleDate },
        [recommendationKey("mood", "happy")]: { fits: 2, lastFitsAt: freshDate },
      },
    );
    expect(ranked.map((item) => item.id)[0]).toBe("happy");
  });

  it("reports recommendation confidence from local signals", () => {
    const key = recommendationKey("create", "journal");
    const seeded = applyRecommendationFeedback({}, key, "fits", new Date().toISOString());
    const medium = summarizeRecommendationFeedback(seeded, key);
    expect(medium.confidence).toBe("low");
    const boosted = applyRecommendationFeedback(
      applyRecommendationFeedback(
        applyRecommendationFeedback(seeded, key, "fits", new Date().toISOString()),
        key,
        "fits",
        new Date().toISOString(),
      ),
      key,
      "fits",
      new Date().toISOString(),
    );
    const high = summarizeRecommendationFeedback(boosted, key);
    expect(high.confidence).toBe("high");
    expect(high.net).toBeGreaterThan(0);
  });

  it("explores unseen options when confidence is low", () => {
    const ranked = rankMoodOptions(
      [{ id: "creative" }, { id: "happy" }, { id: "stressed" }, { id: "vibing" }],
      {
        [recommendationKey("mood", "creative")]: { fits: 1 },
        [recommendationKey("mood", "happy")]: { dismissed: 1 },
      },
    );
    expect(ranked.slice(0, 3).map((item) => item.id)).toEqual(["creative", "stressed", "vibing"]);
  });

  it("stops exploration once confidence is high", () => {
    const key = recommendationKey("mood", "creative");
    const feedback = applyRecommendationFeedback(
      applyRecommendationFeedback(
        applyRecommendationFeedback(
          applyRecommendationFeedback({}, key, "fits", new Date().toISOString()),
          key,
          "fits",
          new Date().toISOString(),
        ),
        key,
        "fits",
        new Date().toISOString(),
      ),
      key,
      "fits",
      new Date().toISOString(),
    );
    const ranked = rankMoodOptions(
      [{ id: "happy" }, { id: "creative" }, { id: "stressed" }],
      feedback,
    );
    expect(ranked[0]?.id).toBe("creative");
    expect(ranked[1]?.id).toBe("happy");
    expect(isRecommendationExploring(feedback, key)).toBe(false);
  });

  it("flags exploration mode at low confidence", () => {
    const key = recommendationKey("routine", "soft");
    const feedback = applyRecommendationFeedback({}, key, "fits", new Date().toISOString());
    expect(isRecommendationExploring(feedback, key)).toBe(true);
  });

  it("uses scope-specific confidence thresholds", () => {
    const timestamp = new Date().toISOString();
    const moodKey = recommendationKey("mood", "creative");
    const routineKey = recommendationKey("routine", "soft");
    const moodFeedback = applyRecommendationFeedback({}, moodKey, "fits", timestamp);
    const routineFeedback = applyRecommendationFeedback({}, routineKey, "fits", timestamp);
    expect(summarizeRecommendationFeedback(moodFeedback, moodKey).confidence).toBe("medium");
    expect(summarizeRecommendationFeedback(routineFeedback, routineKey).confidence).toBe("low");
  });

  it("prefers the most recent selected feedback kind", () => {
    const key = recommendationKey("circle", "creative");
    const feedback = {
      [key]: {
        fits: 3,
        dismissed: 1,
        lastFitsAt: "2026-07-15T10:00:00.000Z",
        lastDismissedAt: "2026-07-16T10:00:00.000Z",
      },
    };
    expect(selectedFeedbackKind(feedback, key)).toBe("dismissed");
  });

  it("falls back to counts when timestamps are missing", () => {
    const key = recommendationKey("routine", "soft");
    const feedback = { [key]: { fits: 2, dismissed: 1 } };
    expect(selectedFeedbackKind(feedback, key)).toBe("fits");
  });

  it("normalizes empty recommendation ids to a safe key", () => {
    expect(recommendationKey("mood", "   ")).toBe("mood:unknown");
  });

  it("sanitizes malformed recommendation feedback payloads", () => {
    const raw = {
      "  mood:creative  ": { fits: 2.9, dismissed: -1, lastFitsAt: "2026-08-10T00:00:00.000Z", lastDismissedAt: "bad-date" },
      "": { fits: 1 },
      "create:photo": "not-an-object",
    };
    const normalized = normalizeRecommendationFeedback(raw);
    expect(normalized["mood:creative"]?.fits).toBe(2);
    expect(normalized["mood:creative"]?.dismissed).toBeUndefined();
    expect(normalized["mood:creative"]?.lastFitsAt).toBe("2026-08-10T00:00:00.000Z");
    expect(normalized["mood:creative"]?.lastDismissedAt).toBeUndefined();
    expect(normalized["create:photo"]).toBeUndefined();
  });
});
