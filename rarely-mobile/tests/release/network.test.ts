import { describe, expect, it } from "vitest";
import { backoffDelay } from "../../lib/release/network/backoff";
import { CircuitBreaker } from "../../lib/release/network/circuitBreaker";
import { FixedWindowLimiter } from "../../server/release/rateLimit";

describe("network guards", () => {
  it("caps exponential backoff", () => { expect(backoffDelay(99, { baseMs: 100, maxMs: 1_000, jitterRatio: 0 }, () => 0.5)).toBe(1_000); });
  it("opens a circuit after threshold", () => { const breaker = new CircuitBreaker(2, 1000); breaker.failure(0); breaker.failure(1); expect(breaker.allow(2)).toBe(false); expect(breaker.allow(1002)).toBe(true); });
  it("limits a fixed window", () => { const limiter = new FixedWindowLimiter(2, 1000); expect(limiter.check("u", 0).allowed).toBe(true); expect(limiter.check("u", 1).allowed).toBe(true); expect(limiter.check("u", 2).allowed).toBe(false); });
});
