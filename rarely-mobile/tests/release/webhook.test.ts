import { describe, expect, it } from "vitest";
import { verifyHmacSignature, verifyAuthorizationHeader } from "../../server/release/revenueCatWebhook";
import crypto from "node:crypto";

describe("billing webhook verification", () => {
  it("supports simple authorization token verification", () => { expect(verifyAuthorizationHeader("secret", "secret")).toBe(true); expect(verifyAuthorizationHeader("wrong", "secret")).toBe(false); });
  it("verifies timestamped HMAC", () => { const body = JSON.stringify({ event: { id: "e1" } }); const secret = "abc"; const timestamp = Math.floor(Date.now()/1000); const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex"); expect(verifyHmacSignature(body, `t=${timestamp},v1=${signature}`, secret)).toBe(true); });
});
