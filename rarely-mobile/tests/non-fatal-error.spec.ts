import { afterEach, describe, expect, it, vi } from "vitest";

import { clearRecentNonFatalErrors, getRecentNonFatalErrors, reportNonFatalError, withNonFatal } from "../lib/non-fatal-error";

describe("non-fatal error reporter", () => {
  afterEach(() => {
    clearRecentNonFatalErrors();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("records and logs recoverable errors", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportNonFatalError("test:scope", new Error("oops"), { feature: "personalization" });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const events = getRecentNonFatalErrors();
    expect(events[0]?.scope).toBe("test:scope");
    expect(events[0]?.message).toBe("oops");
    expect(events[0]?.metadata?.feature).toBe("personalization");
  });

  it("dedupes repeated scope+message bursts", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportNonFatalError("test:scope", "same");
    reportNonFatalError("test:scope", "same");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(getRecentNonFatalErrors()).toHaveLength(1);
  });

  it("allows reporting again after dedupe window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportNonFatalError("test:scope", "same");
    vi.advanceTimersByTime(5001);
    reportNonFatalError("test:scope", "same");
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(getRecentNonFatalErrors()).toHaveLength(2);
  });

  it("falls back to safe scope and metadata shape", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unreadableMetadata = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("broken metadata");
        },
      },
    );

    reportNonFatalError("   ", "failed", unreadableMetadata as unknown as Record<string, unknown>);
    const events = getRecentNonFatalErrors();
    expect(events[0]?.scope).toBe("unknown");
    expect(events[0]?.metadata).toEqual({ metadataError: "unreadable" });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it("returns action result when no error occurs", async () => {
    const result = await withNonFatal("test:ok", async () => "done");
    expect(result).toBe("done");
    expect(getRecentNonFatalErrors()).toHaveLength(0);
  });

  it("reports and returns undefined when action fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const onError = vi.fn();
    const result = await withNonFatal(
      "test:fail",
      async () => {
        throw new Error("boom");
      },
      { metadata: { feature: "home" }, onError },
    );
    expect(result).toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(getRecentNonFatalErrors()[0]?.scope).toBe("test:fail");
  });
});

