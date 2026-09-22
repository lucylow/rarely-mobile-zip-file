import { describe, expect, it } from "vitest";
import {
  activatePlan,
  canShowUpgradePrompt,
  getDefaultMonetizationState,
  isPremiumActive,
  loadMonetizationExperimentState,
  loadMonetizationPromptState,
  loadMonetizationState,
  MONETIZATION_EXPERIMENT_KEY,
  MONETIZATION_PROMPT_STATE_KEY,
  MONETIZATION_STATE_KEY,
  resetMonetizationAnalytics,
  orderPlansForVariant,
  PLAN_DEFINITIONS,
  getPaywallConversionRate,
  getPaywallSourceGroup,
  getPaywallSourceLabel,
  getRankedPaywallSources,
  getRankedPaywallSourceGroups,
  getEnabledRevenueStreams,
  getRevenueStream,
  REVENUE_CATALOG,
  recordPaywallConversion,
  recordPaywallImpression,
  recordUpgradePromptShown,
  restoreMembership,
  shouldTriggerUsageUpsell,
  startTrial,
  trialDaysLeft,
} from "../lib/ux/monetization";
import { createMemoryStorage } from "./helpers/memoryStorage";

describe("monetization state", () => {
  it("keeps revenue lanes separate and safely enables only implemented paths", () => {
    expect(new Set(REVENUE_CATALOG.map((stream) => stream.id)).size).toBe(REVENUE_CATALOG.length);
    expect(getEnabledRevenueStreams().map((stream) => stream.id)).toEqual(["free_utility", "membership"]);
    expect(REVENUE_CATALOG.every((stream) => stream.contributionMarginPercent === null)).toBe(true);
    expect(getRevenueStream("commerce").enabledByDefault).toBe(false);
  });

  it("defaults to free state", async () => {
    const storage = createMemoryStorage();
    const state = await loadMonetizationState(storage);
    expect(state).toEqual(getDefaultMonetizationState());
  });

  it("starts trial and tracks days remaining", async () => {
    const storage = createMemoryStorage();
    const trial = await startTrial(storage, "test");
    expect(trial.status).toBe("trial");
    expect(isPremiumActive(trial)).toBe(true);
    expect(trialDaysLeft(trial)).toBeGreaterThan(0);
  });

  it("does not rewrite an active trial when trial start is repeated", async () => {
    const storage = createMemoryStorage();
    const first = await startTrial(storage, "first");
    const second = await startTrial(storage, "second");
    expect(second).toEqual(first);
  });

  it("activates selected paid plan", async () => {
    const storage = createMemoryStorage();
    const paid = await activatePlan(storage, "annual", "test");
    expect(paid.status).toBe("active");
    expect(paid.planId).toBe("annual");
    expect(isPremiumActive(paid)).toBe(true);
  });

  it("does not rewrite a repeated same-plan activation but allows a plan change", async () => {
    const storage = createMemoryStorage();
    const first = await activatePlan(storage, "annual", "first");
    const repeated = await activatePlan(storage, "annual", "second");
    expect(repeated).toEqual(first);
    const changed = await activatePlan(storage, "monthly", "upgrade");
    expect(changed.planId).toBe("monthly");
    expect(changed.source).toBe("upgrade");
    expect(changed).not.toEqual(first);
  });

  it("restores a membership from free state", async () => {
    const storage = createMemoryStorage();
    const restored = await restoreMembership(storage);
    expect(restored.status).toBe("active");
    expect(restored.planId).toBe("annual");
  });

  it("normalizes expired and malformed trial states to free", async () => {
    const expiredStorage = createMemoryStorage({
      [MONETIZATION_STATE_KEY]: JSON.stringify({
        status: "trial",
        trialEndsAt: new Date(Date.now() - 60_000).toISOString(),
      }),
    });
    await expect(loadMonetizationState(expiredStorage)).resolves.toEqual(getDefaultMonetizationState());
    const expiredPersisted = JSON.parse(expiredStorage.dump()[MONETIZATION_STATE_KEY] ?? "{}") as {
      status?: string;
    };
    expect(expiredPersisted.status).toBe("free");

    const malformedStorage = createMemoryStorage({
      [MONETIZATION_STATE_KEY]: JSON.stringify({
        status: "trial",
      }),
    });
    await expect(loadMonetizationState(malformedStorage)).resolves.toEqual(getDefaultMonetizationState());
    const malformedPersisted = JSON.parse(malformedStorage.dump()[MONETIZATION_STATE_KEY] ?? "{}") as {
      status?: string;
    };
    expect(malformedPersisted.status).toBe("free");
  });

  it("rejects entitlement payloads with inconsistent plan fields", async () => {
    const cases = [
      { status: "free", planId: "annual" },
      { status: "trial", trialEndsAt: new Date(Date.now() + 60_000).toISOString() },
      { status: "active" },
      { status: "active", planId: "annual", trialEndsAt: new Date(Date.now() + 60_000).toISOString() },
    ];

    for (const payload of cases) {
      const storage = createMemoryStorage({ [MONETIZATION_STATE_KEY]: JSON.stringify(payload) });
      await expect(loadMonetizationState(storage)).resolves.toEqual(getDefaultMonetizationState());
    }
  });

  it("fails closed for invalid persisted membership timestamps", async () => {
    const cases = [
      { status: "active", planId: "annual", startedAt: "not-a-date" },
      { status: "trial", planId: "annual", trialEndsAt: "not-a-date" },
    ];

    for (const payload of cases) {
      const storage = createMemoryStorage({ [MONETIZATION_STATE_KEY]: JSON.stringify(payload) });
      await expect(loadMonetizationState(storage)).resolves.toEqual(getDefaultMonetizationState());
    }
  });

  it("repairs invalid persisted monetization payloads", async () => {
    const invalidStorage = createMemoryStorage({
      [MONETIZATION_STATE_KEY]: JSON.stringify({
        status: "unknown",
      }),
    });
    await expect(loadMonetizationState(invalidStorage)).resolves.toEqual(getDefaultMonetizationState());

    const persisted = JSON.parse(invalidStorage.dump()[MONETIZATION_STATE_KEY] ?? "{}") as {
      status?: string;
    };
    expect(persisted.status).toBe("free");
  });

  it("triggers usage upsell after meaningful engagement", () => {
    expect(
      shouldTriggerUsageUpsell({
        journalCount: 2,
        momentCount: 1,
        circleCount: 0,
        routineCount: 0,
      }),
    ).toBe(true);
    expect(
      shouldTriggerUsageUpsell({
        journalCount: 0,
        momentCount: 0,
        circleCount: 0,
        routineCount: 0,
      }),
    ).toBe(false);
  });

  it("records prompt impressions and applies cooldown", async () => {
    const storage = createMemoryStorage();
    const first = await recordUpgradePromptShown(storage, "home");
    expect(first.shownCount).toBe(1);
    expect(first.lastSource).toBe("home");
    expect(canShowUpgradePrompt(first)).toBe(false);

    const persisted = JSON.parse(storage.dump()[MONETIZATION_PROMPT_STATE_KEY] ?? "{}") as {
      shownCount?: number;
    };
    expect(persisted.shownCount).toBe(1);
  });

  it("normalizes invalid persisted prompt state payloads", async () => {
    const storage = createMemoryStorage({
      [MONETIZATION_PROMPT_STATE_KEY]: JSON.stringify({
        shownCount: -2.7,
        lastShownAt: "invalid-date",
        lastSource: "   ",
      }),
    });

    const promptState = await loadMonetizationPromptState(storage);
    expect(promptState).toEqual({
      shownCount: 0,
      lastShownAt: undefined,
      lastSource: undefined,
    });

    const persisted = JSON.parse(storage.dump()[MONETIZATION_PROMPT_STATE_KEY] ?? "{}") as {
      shownCount?: number;
      lastShownAt?: string;
      lastSource?: string;
    };
    expect(persisted.shownCount).toBe(0);
    expect(persisted.lastShownAt).toBeUndefined();
    expect(persisted.lastSource).toBeUndefined();
  });

  it("stops prompting after max impressions", () => {
    expect(
      canShowUpgradePrompt({
        shownCount: 8,
        lastShownAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      }),
    ).toBe(false);
  });

  it("does not exceed the prompt impression cap when recorded directly", async () => {
    const storage = createMemoryStorage({
      [MONETIZATION_PROMPT_STATE_KEY]: JSON.stringify({
        shownCount: 8,
        lastShownAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
        lastSource: "previous",
      }),
    });
    const next = await recordUpgradePromptShown(storage, "new-source");
    expect(next.shownCount).toBe(8);
    expect(next.lastSource).toBe("previous");
  });

  it("orders plans based on paywall variant", () => {
    const valueFirst = orderPlansForVariant(PLAN_DEFINITIONS, "value-first").map((plan) => plan.id);
    const flexFirst = orderPlansForVariant(PLAN_DEFINITIONS, "flex-first").map((plan) => plan.id);
    expect(valueFirst[0]).toBe("annual");
    expect(flexFirst[0]).toBe("monthly");
  });

  it("keeps valid prompt state when normalization recovery write fails", async () => {
    const brokenWriteStorage = {
      getItem: async () =>
        JSON.stringify({
          shownCount: 2.8,
          lastShownAt: "not-a-date",
          lastSource: "  home  ",
        }),
      setItem: async () => {
        throw new Error("write unavailable");
      },
    };
    await expect(loadMonetizationPromptState(brokenWriteStorage)).resolves.toEqual({
      shownCount: 2,
      lastShownAt: undefined,
      lastSource: "  home  ",
    });
  });

  it("returns a safe default when experiment storage read and recovery write both fail", async () => {
    const brokenStorage = {
      getItem: async () => {
        throw new Error("read unavailable");
      },
      setItem: async () => {
        throw new Error("write unavailable");
      },
    };
    await expect(loadMonetizationExperimentState(brokenStorage)).resolves.toMatchObject({
      impressions: 0,
      trialStarts: 0,
      planPurchases: 0,
      restores: 0,
      sourceMetrics: {},
    });
  });

  it("resets invalid experiment timestamps safely", async () => {
    const invalidAssignedStorage = createMemoryStorage({
      [MONETIZATION_EXPERIMENT_KEY]: JSON.stringify({
        variant: "value-first",
        assignedAt: "not-a-date",
        impressions: 2,
        trialStarts: 1,
        planPurchases: 0,
        restores: 0,
      }),
    });
    const resetAssigned = await loadMonetizationExperimentState(invalidAssignedStorage);
    expect(resetAssigned.impressions).toBe(0);
    expect(resetAssigned.assignedAt).not.toBe("not-a-date");

    const invalidActionStorage = createMemoryStorage({
      [MONETIZATION_EXPERIMENT_KEY]: JSON.stringify({
        variant: "value-first",
        assignedAt: new Date().toISOString(),
        lastActionAt: "not-a-date",
        impressions: 2,
        trialStarts: 1,
        planPurchases: 0,
        restores: 0,
      }),
    });
    const resetAction = await loadMonetizationExperimentState(invalidActionStorage);
    expect(resetAction.impressions).toBe(0);
    expect(resetAction.lastActionAt).toBeUndefined();
  });

  it("resets invalid or negative analytics counters safely", async () => {
    const invalidStates = [
      { impressions: -1, trialStarts: 0, planPurchases: 0, restores: 0 },
      { impressions: Number.NaN, trialStarts: 0, planPurchases: 0, restores: 0 },
      {
        impressions: 1,
        trialStarts: 0,
        planPurchases: 0,
        restores: 0,
        sourceMetrics: { membership: { impressions: -2, trialStarts: 0, planPurchases: 0, restores: 0 } },
      },
    ];

    for (const counters of invalidStates) {
      const storage = createMemoryStorage({
        [MONETIZATION_EXPERIMENT_KEY]: JSON.stringify({
          variant: "value-first",
          assignedAt: new Date().toISOString(),
          ...counters,
        }),
      });
      const state = await loadMonetizationExperimentState(storage);
      expect(state.impressions).toBe(0);
      expect(state.trialStarts).toBe(0);
      expect(state.planPurchases).toBe(0);
      expect(state.restores).toBe(0);
    }
  });

  it("assigns and persists experiment state", async () => {
    const storage = createMemoryStorage();
    const experiment = await loadMonetizationExperimentState(storage);
    expect(["value-first", "flex-first"]).toContain(experiment.variant);
    expect(experiment.impressions).toBe(0);
    const persisted = JSON.parse(storage.dump()[MONETIZATION_EXPERIMENT_KEY] ?? "{}") as {
      variant?: string;
    };
    expect(["value-first", "flex-first"]).toContain(persisted.variant);
  });

  it("normalizes blank analytics sources into the unknown bucket", async () => {
    const storage = createMemoryStorage();
    await recordPaywallImpression(storage, "   ");
    await recordPaywallConversion(storage, "trial", "");
    const persisted = JSON.parse(storage.dump()[MONETIZATION_EXPERIMENT_KEY] ?? "{}") as {
      sourceMetrics?: Record<string, { impressions?: number; trialStarts?: number }>;
    };
    expect(Object.keys(persisted.sourceMetrics ?? {})).toEqual(["unknown"]);
    expect(persisted.sourceMetrics?.unknown?.impressions).toBe(1);
    expect(persisted.sourceMetrics?.unknown?.trialStarts).toBe(1);
  });

  it("keeps analytics mutations usable when local writes fail", async () => {
    const brokenWriteStorage = {
      getItem: async () => null,
      setItem: async () => {
        throw new Error("write unavailable");
      },
    };

    await expect(recordUpgradePromptShown(brokenWriteStorage, "home_usage")).resolves.toMatchObject({
      shownCount: 1,
      lastSource: "home_usage",
    });
    await expect(recordPaywallImpression(brokenWriteStorage, "membership")).resolves.toMatchObject({
      impressions: 1,
      lastSource: "membership",
    });
    await expect(recordPaywallConversion(brokenWriteStorage, "trial", "membership")).resolves.toMatchObject({
      trialStarts: 1,
      sourceMetrics: {
        membership: {
          trialStarts: 1,
        },
      },
    });
  });

  it("tracks conversion counters by type", async () => {
    const storage = createMemoryStorage({
      [MONETIZATION_EXPERIMENT_KEY]: JSON.stringify({
        variant: "value-first",
        assignedAt: new Date().toISOString(),
        impressions: 1,
        trialStarts: 0,
        planPurchases: 0,
        restores: 0,
      }),
    });

    await recordPaywallConversion(storage, "trial", "membership");
    await recordPaywallConversion(storage, "purchase", "membership");
    await recordPaywallConversion(storage, "restore", "membership");

    const persisted = JSON.parse(storage.dump()[MONETIZATION_EXPERIMENT_KEY] ?? "{}") as {
      trialStarts?: number;
      planPurchases?: number;
      restores?: number;
      sourceMetrics?: Record<
        string,
        { impressions?: number; trialStarts?: number; planPurchases?: number; restores?: number }
      >;
    };
    expect(persisted.trialStarts).toBe(1);
    expect(persisted.planPurchases).toBe(1);
    expect(persisted.restores).toBe(1);
    expect(persisted.sourceMetrics?.membership?.trialStarts).toBe(1);
    expect(persisted.sourceMetrics?.membership?.planPurchases).toBe(1);
    expect(persisted.sourceMetrics?.membership?.restores).toBe(1);
  });

  it("computes paywall conversion rate from counters", () => {
    expect(
      getPaywallConversionRate({
        variant: "value-first",
        assignedAt: new Date().toISOString(),
        impressions: 10,
        trialStarts: 2,
        planPurchases: 1,
        restores: 1,
      }),
    ).toBe(0.4);
  });

  it("resets analytics while preserving variant by default", async () => {
    const storage = createMemoryStorage({
      [MONETIZATION_PROMPT_STATE_KEY]: JSON.stringify({
        shownCount: 3,
        lastSource: "home",
      }),
      [MONETIZATION_EXPERIMENT_KEY]: JSON.stringify({
        variant: "flex-first",
        assignedAt: new Date().toISOString(),
        impressions: 7,
        trialStarts: 2,
        planPurchases: 1,
        restores: 1,
      }),
    });

    const next = await resetMonetizationAnalytics(storage);
    expect(next.variant).toBe("flex-first");
    expect(next.impressions).toBe(0);

    const promptPersisted = JSON.parse(storage.dump()[MONETIZATION_PROMPT_STATE_KEY] ?? "{}") as {
      shownCount?: number;
    };
    expect(promptPersisted.shownCount).toBe(0);
  });

  it("tracks source impressions and returns ranked sources", async () => {
    const storage = createMemoryStorage({
      [MONETIZATION_EXPERIMENT_KEY]: JSON.stringify({
        variant: "value-first",
        assignedAt: new Date().toISOString(),
        impressions: 0,
        trialStarts: 0,
        planPurchases: 0,
        restores: 0,
      }),
    });

    await recordPaywallImpression(storage, "home_usage");
    await recordPaywallImpression(storage, "home_usage");
    await recordPaywallImpression(storage, "profile");
    await recordPaywallConversion(storage, "trial", "home_usage");

    const state = await loadMonetizationExperimentState(storage);
    const ranked = getRankedPaywallSources(state);
    expect(ranked[0]?.source).toBe("home_usage");
    expect(ranked[0]?.metrics.impressions).toBe(2);
    expect(ranked[0]?.metrics.trialStarts).toBe(1);
  });

  it("normalizes source labels and groups for analytics display", () => {
    expect(getPaywallSourceLabel("community_circle_creative")).toBe("Community circle: creative");
    expect(getPaywallSourceLabel("create_tool_ai")).toBe("Create tool: ai");
    expect(getPaywallSourceGroup("community_circle_creative")).toBe("Community circles");
    expect(getPaywallSourceGroup("home_usage")).toBe("Home");
  });

  it("aggregates ranked source groups", async () => {
    const storage = createMemoryStorage({
      [MONETIZATION_EXPERIMENT_KEY]: JSON.stringify({
        variant: "value-first",
        assignedAt: new Date().toISOString(),
        impressions: 0,
        trialStarts: 0,
        planPurchases: 0,
        restores: 0,
      }),
    });

    await recordPaywallImpression(storage, "community_circle_creative");
    await recordPaywallImpression(storage, "community_circle_music");
    await recordPaywallImpression(storage, "home_usage");
    await recordPaywallConversion(storage, "trial", "community_circle_creative");

    const state = await loadMonetizationExperimentState(storage);
    const groups = getRankedPaywallSourceGroups(state);
    expect(groups[0]?.source).toBe("Community circles");
    expect(groups[0]?.metrics.impressions).toBe(2);
    expect(groups[0]?.metrics.trialStarts).toBe(1);
  });
});
