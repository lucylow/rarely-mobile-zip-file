import { describe, expect, it } from "vitest";
import { MemoryStorage } from "../../lib/release/storage/memoryStorage";
import { readAndHeal } from "../../lib/release/storage/healer";

describe("storage healing", () => {
  it("returns fallback for missing data", async () => { const store = new MemoryStorage(); const result = await readAndHeal(store, "x", { ok: true }, 1); expect(result.status).toBe("missing"); expect(result.value).toEqual({ ok: true }); });
  it("quarantines malformed json", async () => { const store = new MemoryStorage(); await store.set("x", "{nope"); const result = await readAndHeal(store, "x", { ok: true }, 1); expect(result.status).toBe("quarantined"); expect(result.value).toEqual({ ok: true }); });
});
