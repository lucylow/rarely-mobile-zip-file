export type FormField = { name: string; value: string; dirty: boolean; valid: boolean; error?: string };
export type FormSnapshot = { formId: string; fields: FormField[]; savedAt: number };
export function dirtyFields(snapshot: FormSnapshot): FormField[] { return snapshot.fields.filter((x) => x.dirty); }
export function firstError(snapshot: FormSnapshot): string | null { return snapshot.fields.find((x) => !x.valid)?.error ?? null; }
export function serializeSnapshot(snapshot: FormSnapshot): string { return JSON.stringify(snapshot); }
export function parseSnapshot(raw: string): FormSnapshot | null { try { const parsed = JSON.parse(raw) as FormSnapshot; return parsed?.formId && Array.isArray(parsed.fields) ? parsed : null; } catch { return null; } }
