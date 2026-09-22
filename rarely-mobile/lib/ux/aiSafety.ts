import type { AiRequest, AiSafetyResult } from "./aiContracts";

const SECRET_PATTERNS = [
  /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
  /\b(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/g,
  /\b(?:password|passcode|api[_ -]?key|secret|token)\b\s*[:=]?\s*[^\s]+/gi,
];

export function scrubAiText(text: string): string {
  return SECRET_PATTERNS.reduce((output, pattern) => output.replace(pattern, "[REDACTED]"), text);
}

export function minimizeAiContext<T extends Record<string, unknown>>(
  value: T,
  allowedKeys: readonly string[],
): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => allowedKeys.includes(key)),
  ) as Partial<T>;
}

export function checkAiRequest(request: AiRequest): AiSafetyResult {
  const flags: string[] = [];
  if (!request.userConsented) flags.push("consent_required");
  const serializedContext = JSON.stringify(request.context);
  if (serializedContext.length > 4_000) flags.push("context_too_large");
  if (SECRET_PATTERNS.some((pattern) => pattern.test(serializedContext))) flags.push("secret_like");
  return { allowed: flags.length === 0, flags };
}

export function checkAiOutput(output: string): AiSafetyResult {
  const flags: string[] = [];
  if (output.length > 12_000) flags.push("output_too_large");
  return { allowed: flags.length === 0, flags };
}
