import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getBearerTokenFromHeader,
  getSafeFrontendUrl,
  oauthErrorStatus,
} from "../server/_core/oauth";

vi.mock("../server/_core/env", () => ({
  ENV: {
    forgeApiUrl: "https://forge.example.com",
    forgeApiKey: "test-key",
  },
}));

describe("oauth guard helpers", () => {
  it("uses fallback URL for invalid frontend redirect values", () => {
    expect(getSafeFrontendUrl(undefined)).toBe("http://localhost:8081");
    expect(getSafeFrontendUrl("javascript:alert(1)")).toBe("http://localhost:8081");
    expect(getSafeFrontendUrl("not-a-url")).toBe("http://localhost:8081");
  });

  it("keeps valid http/https frontend redirect values", () => {
    expect(getSafeFrontendUrl("https://example.com/app")).toBe("https://example.com/app");
    expect(getSafeFrontendUrl("http://localhost:8081")).toBe("http://localhost:8081/");
  });

  it("extracts bearer token safely from auth headers", () => {
    expect(getBearerTokenFromHeader(undefined)).toBeNull();
    expect(getBearerTokenFromHeader("Token abc")).toBeNull();
    expect(getBearerTokenFromHeader("bearer abc123")).toBeNull();
    expect(getBearerTokenFromHeader("Bearer   ")).toBeNull();
    expect(getBearerTokenFromHeader("Bearer abc123")).toBe("abc123");
    expect(getBearerTokenFromHeader(["Bearer first", "Bearer second"])).toBe("first");
  });

  it("maps oauth failures to appropriate response status", () => {
    expect(oauthErrorStatus(new Error("Invalid OAuth state"))).toBe(400);
    expect(oauthErrorStatus(new Error("OAuth provider did not return a valid openId"))).toBe(502);
    expect(oauthErrorStatus(new Error("random"))).toBe(500);
  });
});

describe("data api guardrails", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects empty api ids", async () => {
    const { callDataApi } = await import("../server/_core/dataApi");
    await expect(callDataApi("   ")).rejects.toThrow("Data API ID is required");
  });

  it("parses jsonData payload when provider returns a JSON string", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ jsonData: "{\"ok\":true,\"items\":[1,2]}" }),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const { callDataApi } = await import("../server/_core/dataApi");
    const result = await callDataApi("Youtube/search", { query: { q: "rarely" } });

    expect(result).toEqual({ ok: true, items: [1, 2] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("maps 5xx failures to retryable DataApiError", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: async () => ({}),
      text: async () => "provider unavailable",
    });
    vi.stubGlobal("fetch", fetchMock);

    const { callDataApi, DataApiError } = await import("../server/_core/dataApi");
    await expect(callDataApi("Youtube/search")).rejects.toMatchObject({
      name: "DataApiError",
      status: 503,
      retryable: true,
    } satisfies Partial<InstanceType<typeof DataApiError>>);
  });

  it("maps AbortError-like failures to timeout DataApiError", async () => {
    const aborted = new Error("aborted");
    aborted.name = "AbortError";
    const fetchMock = vi.fn().mockRejectedValue(aborted);
    vi.stubGlobal("fetch", fetchMock);

    const { callDataApi } = await import("../server/_core/dataApi");
    await expect(callDataApi("Youtube/search")).rejects.toMatchObject({
      name: "DataApiError",
      retryable: true,
      message: "Data API request timed out",
    });
  });
});
