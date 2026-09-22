import { describe, expect, it, vi } from "vitest";

import { firstParam, normalizedParam, normalizedParamOr, runGuarded } from "../lib/ux/guards";

describe("shared async guards", () => {
  it("returns first param value safely", () => {
    expect(firstParam("mood", "fallback")).toBe("mood");
    expect(firstParam(["circle", "ignored"], "fallback")).toBe("circle");
    expect(firstParam(undefined, "fallback")).toBe("fallback");
  });

  it("normalizes optional params safely", () => {
    expect(normalizedParam("  mood  ")).toBe("mood");
    expect(normalizedParam(["  circle  ", "ignored"])).toBe("circle");
    expect(normalizedParam("   ")).toBeUndefined();
    expect(normalizedParam(undefined)).toBeUndefined();
  });

  it("normalizes params with fallback", () => {
    expect(normalizedParamOr("  routine  ", "fallback")).toBe("routine");
    expect(normalizedParamOr("   ", "fallback")).toBe("fallback");
    expect(normalizedParamOr(undefined, "fallback")).toBe("fallback");
  });

  it("resolves guarded tasks when successful", async () => {
    await expect(runGuarded(async () => 42)).resolves.toBe(42);
  });

  it("calls onError and returns undefined on failure", async () => {
    const onError = vi.fn();
    const result = await runGuarded(async () => {
      throw new Error("boom");
    }, onError);

    expect(result).toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
