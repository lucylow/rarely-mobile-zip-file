import { describe, expect, it } from "vitest";
import { MOCK_RARE_MOMENTS, MOCK_PROMPTS, MOCK_JOURNAL_ENTRIES } from "../../lib/release/mocks";

describe("mock catalog", () => {
  it("contains enough density for list testing", () => { expect(MOCK_RARE_MOMENTS.length).toBeGreaterThan(100); expect(MOCK_PROMPTS.length).toBeGreaterThan(100); expect(MOCK_JOURNAL_ENTRIES.length).toBeGreaterThan(50); });
  it("has deterministic ids", () => { expect(MOCK_RARE_MOMENTS[0].id).toBe("moment-001"); expect(MOCK_PROMPTS[0].id).toBe("prompt-001"); });
});
