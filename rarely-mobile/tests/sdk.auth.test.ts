import { describe, expect, it, vi } from "vitest";

vi.mock("../server/db", () => ({
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
}));

vi.mock("../server/_core/env", () => ({
  ENV: {
    appId: "test-app-id",
    cookieSecret: "test-secret",
    databaseUrl: "",
    oAuthServerUrl: "",
    ownerOpenId: "",
    isProduction: false,
    forgeApiUrl: "",
    forgeApiKey: "",
  },
}));

import { SDKServer } from "../server/_core/sdk";

describe("SDK auth/session hardening", () => {
  it("rejects empty openId when creating session tokens", async () => {
    const sdk = new SDKServer({ post: vi.fn() } as any);
    await expect(sdk.createSessionToken("   ")).rejects.toThrow("openId is required");
  });

  it("rejects malformed bearer authorization headers", async () => {
    const sdk = new SDKServer({ post: vi.fn() } as any);
    await expect(
      sdk.authenticateRequest({
        headers: { authorization: "Bearer   " },
      } as any),
    ).rejects.toMatchObject({
      name: "HttpError",
      statusCode: 403,
    });
  });

  it("rejects sessions whose appId does not match runtime app id", async () => {
    const sdk = new SDKServer({ post: vi.fn() } as any);
    const token = await sdk.signSession({
      openId: "user_1",
      appId: "other-app-id",
      name: "User",
    });
    await expect(sdk.verifySession(token)).resolves.toBeNull();
  });

  it("fails fast when OAuth state is malformed", async () => {
    const post = vi.fn();
    const sdk = new SDKServer({ post } as any);
    await expect(sdk.exchangeCodeForToken("code", "%%%")).rejects.toThrow("Invalid OAuth state");
    expect(post).not.toHaveBeenCalled();
  });
});
