import { describe, expect, it } from "vitest";
import { diversify, rankCards, revealMore } from "../lib/ux/adaptiveFeed";
import { transition } from "../lib/ux/onboardingMachine";
import { scorePreferences, starterPath } from "../lib/ux/onboardingPersonalization";
import {
  buildPersonalizationProfile,
  describeRecommendationSignal,
  summarizeLocalActivity,
  timeOfDayLabel,
} from "../lib/ux/personalization";

describe("ux utilities hardening", () => {
  it("clamps onboarding preference scores into [0, 1]", () => {
    const scored = scorePreferences({
      creativity: 4,
      community: -2,
      beauty: Number.NaN,
      journaling: 0.75,
      music: Number.POSITIVE_INFINITY,
    });

    expect(scored).toMatchObject({
      creativity: 1,
      community: 0,
      beauty: 0.5,
      journaling: 0.75,
      music: 0.5,
    });
  });

  it("keeps starter path deterministic", () => {
    const path = starterPath(
      scorePreferences({
        creativity: 1,
        community: 0.2,
        beauty: 0.1,
        journaling: 0,
        music: 0.9,
      }),
    );

    expect(path).toEqual(["create", "home", "community", "rareStudio"]);
  });

  it("supports stepwise BACK transitions in onboarding flow", () => {
    expect(transition("personalize", { type: "BACK" })).toBe("permissions");
    expect(transition("permissions", { type: "BACK" })).toBe("intent");
    expect(transition("intent", { type: "BACK" })).toBe("welcome");
    expect(transition("welcome", { type: "BACK" })).toBe("welcome");
  });

  it("diversifies cards but still fills to limit", () => {
    const cards = [
      { id: "1", kind: "prompt", score: 0.9 },
      { id: "2", kind: "prompt", score: 0.8 },
      { id: "3", kind: "playlist", score: 0.7 },
      { id: "4", kind: "playlist", score: 0.6 },
    ];

    expect(diversify(cards, 3).map((card) => card.id)).toEqual(["1", "3", "2"]);
  });

  it("normalizes invalid card scores and applies mood boosts", () => {
    const ranked = rankCards(
      [
        { id: "a", kind: "prompt", score: Number.NaN },
        { id: "b", kind: "reflection", score: 0.1 },
      ],
      "creative",
    );
    expect(ranked[0]?.id).toBe("a");
    expect(ranked[0]?.score).toBe(0.2);
  });

  it("prevents reveal count from going out of range", () => {
    expect(revealMore(-10, 5)).toBe(0);
    expect(revealMore(4, 5)).toBe(5);
    expect(revealMore(4, -1)).toBe(0);
  });

  it("drops invalid activity timestamps and computes profile safely", () => {
    const summary = summarizeLocalActivity({
      journalCount: 2,
      momentCount: -9,
      circleCount: 1,
      routineCount: 0,
      lastActivityAt: "not-a-date",
    });
    expect(summary).toMatchObject({
      journalCount: 2,
      momentCount: 0,
      circleCount: 1,
      routineCount: 0,
      lastActivityAt: undefined,
    });

    const profile = buildPersonalizationProfile(
      scorePreferences({ community: 1, creativity: 0.4, beauty: 0.3, journaling: 0.2, music: 0.1 }),
      summary,
    );
    expect(profile.topInterestKey).toBe("community");
    expect(profile.recentActivity).toBe(false);
  });

  it("handles malformed recommendation signal and hour inputs", () => {
    expect(describeRecommendationSignal("")).toBe("");
    expect(describeRecommendationSignal("fits:create")).toContain("fits you");
    expect(timeOfDayLabel(-100)).toBe("morning");
    expect(timeOfDayLabel(999)).toBe("evening");
    expect(timeOfDayLabel(Number.NaN)).toBe("afternoon");
  });
});
