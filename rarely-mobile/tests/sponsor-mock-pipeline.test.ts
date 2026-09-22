import { describe, expect, it } from "vitest";
import { resetSponsorDemoSession, runSponsorPipeline, SponsorPipelineCancelled } from "../lib/sponsors/orchestrator";

const brief = { intent: "minimal everyday look", occasion: "everyday", vibe: "minimal", preferences: ["minimal", "neutral", "comfortable"], budget: { min: 20, max: 120, currency: "USD" } };

describe("offline sponsor demo", () => {
  it("completes every provider preview without credentials", async () => {
    resetSponsorDemoSession();
    const result = await runSponsorPipeline(brief);
    expect(result.visual.meta?.mode).toBe("mock");
    expect(result.shopping.meta?.mode).toBe("mock");
    expect(result.ranked.length).toBeGreaterThan(0);
    expect(result.domain.domain).toBe("rarely-minimal-studio.example");
    expect(result.report.status).toBe("complete");
    expect(result.foxitJob.status).toBe("complete");
    expect(result.doctavianJob.status).toBe("complete");
  }, 10000);

  it("cancels safely before later provider stages can update", async () => {
    resetSponsorDemoSession();
    let cancelled = false;
    const operation = runSponsorPipeline(brief, {
      onStage: (update) => {
        if (update.id === "personalize" && update.status === "running") cancelled = true;
      },
      shouldCancel: () => cancelled,
    });
    await expect(operation).rejects.toBeInstanceOf(SponsorPipelineCancelled);
  });
});
