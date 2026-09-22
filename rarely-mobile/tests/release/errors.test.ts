import { describe, expect, it } from "vitest";
import { normalizeError } from "../../lib/release/errors/normalize";
import { fingerprintError } from "../../lib/release/errors/fingerprint";

describe("release errors", () => {
  it("maps offline failures", () => { const error = normalizeError(new TypeError("Network request failed")); expect(error.code).toBe("NETWORK_OFFLINE"); });
  it("maps 429 failures", () => { const error = normalizeError({ status: 429, message: "slow down" }); expect(error.code).toBe("NETWORK_RATE_LIMITED"); });
  it("fingerprints stable fields", () => { const error = normalizeError({ status: 500, message: "boom" }, { operation: "loadFeed" }); expect(fingerprintError(error)).toBe(fingerprintError(error)); });
});
