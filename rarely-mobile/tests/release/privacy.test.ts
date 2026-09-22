import { describe, expect, it } from "vitest";
import { redactObject } from "../../lib/release/privacy/redact";
import { buildExportBundle, serializeExport } from "../../lib/release/privacy/exportBundle";

describe("privacy", () => {
  it("redacts secrets", () => { expect(redactObject({ token: "secret", name: "ok" })).toEqual({ token: "[redacted]", name: "ok" }); });
  it("exports stable schema", () => { const bundle = buildExportBundle({ journal: [], activity: [], preferences: { token: "hidden" } }); const result = serializeExport(bundle); expect(bundle.schemaVersion).toBe(1); expect(result.json).toContain("schemaVersion"); });
});
