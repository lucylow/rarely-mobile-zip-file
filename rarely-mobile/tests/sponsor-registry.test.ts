import { describe, expect, it } from "vitest";
import { createSponsorProvider } from "../lib/sponsors/registry";
import { mockResult } from "../lib/sponsors/mock";

describe("sponsor registry", () => {
  it("returns the mock adapter behind one factory", () => {
    expect(createSponsorProvider("perfect-corp")).toBeDefined();
    expect(createSponsorProvider("name-com")).toBeDefined();
    expect(() => createSponsorProvider("serpapi", "live")).toThrow(/not configured/i);
  });
  it("creates an honest mock envelope", () => {
    expect(mockResult("serpapi", "demo-serpapi-001", { count: 12 }, 550)).toEqual({ data: { count: 12 }, provider: "serpapi", mode: "mock", requestId: "demo-serpapi-001", durationMs: 550, status: "success" });
  });
});
