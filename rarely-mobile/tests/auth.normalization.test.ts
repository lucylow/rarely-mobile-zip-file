import { describe, expect, it } from "vitest";
import { normalizeAuthUserPayload } from "../lib/_core/auth-user";

describe("auth user normalization", () => {
  it("accepts valid user payloads and normalizes fields", () => {
    const user = normalizeAuthUserPayload({
      id: 42,
      openId: " user-123 ",
      name: "Ari",
      email: "ari@example.com",
      loginMethod: "email",
      lastSignedIn: "2026-08-20T00:00:00.000Z",
    });

    expect(user).toMatchObject({
      id: 42,
      openId: "user-123",
      name: "Ari",
      email: "ari@example.com",
      loginMethod: "email",
    });
    expect(Boolean(user && user.lastSignedIn instanceof Date)).toBe(true);
  });

  it("rejects malformed user payloads", () => {
    expect(normalizeAuthUserPayload(null)).toBeNull();
    expect(normalizeAuthUserPayload({ id: Number.NaN, openId: "x" })).toBeNull();
    expect(normalizeAuthUserPayload({ id: 0, openId: "x" })).toBeNull();
    expect(normalizeAuthUserPayload({ id: 1.5, openId: "x" })).toBeNull();
    expect(normalizeAuthUserPayload({ id: 1, openId: "" })).toBeNull();
  });

  it("falls back to epoch date when lastSignedIn is invalid", () => {
    const user = normalizeAuthUserPayload({ id: 1, openId: "abc", lastSignedIn: "bad-date" });
    expect(user && user.lastSignedIn.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("trims optional identity fields and nulls blanks", () => {
    const user = normalizeAuthUserPayload({
      id: 2,
      openId: "abc",
      name: "  Ari  ",
      email: "   ",
      loginMethod: "  email  ",
    });
    expect(user).toMatchObject({
      name: "Ari",
      email: null,
      loginMethod: "email",
    });
  });
});
