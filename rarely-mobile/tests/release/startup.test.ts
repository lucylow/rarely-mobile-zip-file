import { describe, expect, it } from "vitest";
import { runStartup } from "../../lib/release/startup/coordinator";

describe("startup coordinator", () => {
  it("degrades optional dependency failures", async () => { const report = await runStartup([{ id: "storage", critical: false, run: async () => { throw new Error("bad"); } }], () => 1000); expect(report.degraded).toBe(true); expect(report.criticalFailure).toBe(false); });
  it("fails on critical dependency failures", async () => { const report = await runStartup([{ id: "auth", critical: true, run: async () => { throw new Error("bad"); } }], () => 1000); expect(report.criticalFailure).toBe(true); });
});
