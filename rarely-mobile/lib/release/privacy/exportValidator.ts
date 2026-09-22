export interface ExportValidation { ok: boolean; errors: string[]; warnings: string[]; }

export function validateExport(value: unknown): ExportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!value || typeof value !== "object") errors.push("export-not-object");
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  if (record.schemaVersion !== 1) errors.push("unsupported-schema-version");
  if (typeof record.createdAt !== "string") errors.push("missing-createdAt");
  if (!Array.isArray(record.journal)) errors.push("journal-not-array");
  if (!Array.isArray(record.activity)) errors.push("activity-not-array");
  if (record.preferences === undefined) warnings.push("preferences-missing");
  return { ok: errors.length === 0, errors, warnings };
}
