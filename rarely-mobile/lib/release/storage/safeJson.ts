export interface SafeParseResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export function safeJsonParse<T>(raw: string | null | undefined): SafeParseResult<T> {
  if (raw == null || raw.trim() === "") return { ok: false, error: "empty" };
  try {
    const parsed: unknown = JSON.parse(raw);
    return { ok: true, value: parsed as T };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "invalid-json" };
  }
}

export function safeJsonStringify(value: unknown): SafeParseResult<string> {
  try {
    return { ok: true, value: JSON.stringify(value) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "stringify-failed" };
  }
}
