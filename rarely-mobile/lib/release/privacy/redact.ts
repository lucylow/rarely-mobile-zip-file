const SENSITIVE_KEYS = new Set([
  "password", "token", "accessToken", "refreshToken", "authorization", "cookie", "journalText", "privateNote",
  "receipt", "signedTransactionInfo", "signedRenewalInfo", "email", "phone", "address", "imageBase64",
]);

export function redactObject(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 40).map((item) => redactObject(item, depth + 1));
  if (!value || typeof value !== "object") return typeof value === "string" && value.length > 500 ? `${value.slice(0, 500)}…` : value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE_KEYS.has(key) ? "[redacted]" : redactObject(child, depth + 1);
  }
  return out;
}

export function redactText(value: string): string {
  return value.replace(/(?:bearer\s+)[a-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/[A-Za-z0-9_-]{24,}/g, "[redacted-id]")
    .slice(0, 600);
}
