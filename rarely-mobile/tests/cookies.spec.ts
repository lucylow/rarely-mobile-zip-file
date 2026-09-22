import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "../server/_core/cookies";

function createRequest(input: {
  protocol: string;
  hostname: string;
  forwardedProto?: string | string[];
}): Request {
  return {
    protocol: input.protocol,
    hostname: input.hostname,
    headers: input.forwardedProto ? { "x-forwarded-proto": input.forwardedProto } : {},
  } as Request;
}

describe("getSessionCookieOptions", () => {
  it("uses secure cross-site cookies for HTTPS requests", () => {
    const req = createRequest({
      protocol: "https",
      hostname: "3000-abc.manuspre.computer",
    });

    expect(getSessionCookieOptions(req)).toMatchObject({
      domain: ".manuspre.computer",
      httpOnly: true,
      path: "/",
      sameSite: "none",
      secure: true,
    });
  });

  it("treats forwarded HTTPS as secure", () => {
    const req = createRequest({
      protocol: "http",
      hostname: "3000-abc.manuspre.computer",
      forwardedProto: "http, https",
    });

    expect(getSessionCookieOptions(req)).toMatchObject({
      sameSite: "none",
      secure: true,
    });
  });

  it("uses lax cookies for non-secure localhost requests", () => {
    const req = createRequest({
      protocol: "http",
      hostname: "localhost",
    });

    expect(getSessionCookieOptions(req)).toMatchObject({
      domain: undefined,
      sameSite: "lax",
      secure: false,
    });
  });

  it("keeps domain unset for root domains without subdomain", () => {
    const req = createRequest({
      protocol: "https",
      hostname: "manuspre.computer",
    });

    expect(getSessionCookieOptions(req).domain).toBeUndefined();
  });

  it("treats x-forwarded-proto arrays case-insensitively", () => {
    const req = createRequest({
      protocol: "http",
      hostname: "api.example.com",
      forwardedProto: ["HTTP", "HTTPS"],
    });

    expect(getSessionCookieOptions(req)).toMatchObject({
      secure: true,
      sameSite: "none",
    });
  });
});
