import { describe, expect, it } from "vitest";
import { classifyUri, safeMediaUri } from "../../lib/release/media/uri";

describe("media guards", () => {
  it("accepts private local uri types", () => { expect(classifyUri("file:///tmp/a.jpg")).toBe("file"); expect(classifyUri("ph://ABC")).toBe("photo"); });
  it("rejects unsupported schemes", () => { expect(safeMediaUri("ftp://example.com/a.jpg")).toBeUndefined(); });
});
