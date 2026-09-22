export function checksum(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function envelope<T>(version: number, value: T): { version: number; checksum: string; value: T } {
  const json = JSON.stringify(value);
  return { version, checksum: checksum(json), value };
}

export function verifyEnvelope<T>(input: unknown): { ok: true; value: T } | { ok: false; reason: string } {
  if (!input || typeof input !== "object") return { ok: false, reason: "not-object" };
  const candidate = input as { value?: T; checksum?: unknown };
  if (typeof candidate.checksum !== "string" || !("value" in candidate)) return { ok: false, reason: "missing-fields" };
  return checksum(JSON.stringify(candidate.value)) === candidate.checksum
    ? { ok: true, value: candidate.value as T }
    : { ok: false, reason: "checksum-mismatch" };
}
