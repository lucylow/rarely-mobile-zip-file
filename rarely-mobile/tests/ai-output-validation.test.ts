import { describe, expect, it } from "vitest";
import { creativeResultSchema, synthesisSchema } from "../server/routers";

describe("AI output validation", () => {
  it("accepts a complete creative result with safe palette colors", () => {
    const parsed = creativeResultSchema.safeParse({
      title: "A quiet beginning",
      summary: "A small direction for making room to notice what matters.",
      lines: ["Notice one detail", "Choose one texture", "Take one gentle next step"],
      palette: ["#F5D7CF", "#D9CDE7", "#D8E1D5"],
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects incomplete or unsafe creative model output", () => {
    expect(creativeResultSchema.safeParse({
      title: "",
      summary: "Too little",
      lines: ["Only one line"],
      palette: ["not-a-color", "#FFFFFF", "#000000"],
    }).success).toBe(false);
  });

  it("rejects empty or oversized synthesis text", () => {
    expect(synthesisSchema.safeParse("").success).toBe(false);
    expect(synthesisSchema.safeParse("x".repeat(441)).success).toBe(false);
    expect(synthesisSchema.safeParse("A shared thread, followed by one kind next step.").success).toBe(true);
  });
});
