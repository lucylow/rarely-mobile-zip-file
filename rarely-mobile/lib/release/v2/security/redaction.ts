const SENSITIVE_KEY = /token|secret|password|authorization|cookie|receipt|identity|email/i;
const SENSITIVE_VALUE = /bearer\s+[a-z0-9._-]+|sk-[a-z0-9_-]+/i;

export function redactString(value: string): string {
  if (!value) return value;
  if (SENSITIVE_VALUE.test(value)) return '[REDACTED]';
  if (value.length > 600) return `${value.slice(0, 120)}…[TRUNCATED]`;
  return value;
}

export function redactObject(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[DEPTH_LIMIT]';
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map((item) => redactObject(item, depth + 1));
  if (!value || typeof value !== 'object') return value;
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY.test(key) ? '[REDACTED]' : redactObject(child, depth + 1);
  }
  return output;
}
