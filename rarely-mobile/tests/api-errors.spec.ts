import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "../lib/_core/api-errors";

describe("api error messaging", () => {
  it("maps common HTTP statuses to user messages", () => {
    expect(getApiErrorMessage({ status: 401 })).toContain("session expired");
    expect(getApiErrorMessage({ status: 403 })).toContain("permission");
    expect(getApiErrorMessage({ status: 404 })).toContain("could not find");
    expect(getApiErrorMessage({ status: 429 })).toContain("Too many requests");
    expect(getApiErrorMessage({ status: 500 })).toContain("server is busy");
  });

  it("uses retryable copy for network-like failures", () => {
    expect(getApiErrorMessage({ retryable: true })).toContain("Network issue");
  });

  it("falls back to custom message when provided", () => {
    expect(getApiErrorMessage({ message: "Custom failure" })).toBe("Custom failure");
    expect(getApiErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});
