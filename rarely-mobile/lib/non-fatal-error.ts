type ErrorMetadata = Record<string, unknown>;
type NonFatalErrorEvent = {
  scope: string;
  message: string;
  metadata?: ErrorMetadata;
  at: string;
};

const RECENT_EVENT_LIMIT = 50;
const DEDUPE_WINDOW_MS = 5000;
const DEDUPE_KEY_LIMIT = 200;
const recentEvents: NonFatalErrorEvent[] = [];
const lastReportedByKey = new Map<string, number>();

type WithNonFatalOptions = {
  metadata?: ErrorMetadata;
  onError?: (error: unknown) => void;
};

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function normalizeScope(scope: unknown): string {
  if (typeof scope !== "string") return "unknown";
  const trimmed = scope.trim();
  return trimmed.length > 0 ? trimmed : "unknown";
}

function normalizeMetadata(metadata: unknown): ErrorMetadata | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  try {
    const entries = Object.entries(metadata as Record<string, unknown>);
    if (entries.length === 0) return undefined;
    return Object.fromEntries(entries);
  } catch {
    return { metadataError: "unreadable" };
  }
}

/**
 * Centralized best-effort reporter for recoverable issues.
 * Keeps UX resilient while preserving enough context for debugging.
 */
export function reportNonFatalError(scope: string, error: unknown, metadata?: ErrorMetadata): void {
  const normalizedScope = normalizeScope(scope);
  const message = normalizeErrorMessage(error);
  const key = `${normalizedScope}:${message}`;
  const now = Date.now();

  for (const [reportedKey, reportedAt] of lastReportedByKey.entries()) {
    if (now - reportedAt >= DEDUPE_WINDOW_MS) {
      lastReportedByKey.delete(reportedKey);
    }
  }

  const lastReportedAt = lastReportedByKey.get(key) ?? 0;
  if (now - lastReportedAt < DEDUPE_WINDOW_MS) return;
  lastReportedByKey.set(key, now);
  while (lastReportedByKey.size > DEDUPE_KEY_LIMIT) {
    const oldest = lastReportedByKey.keys().next().value;
    if (!oldest) break;
    lastReportedByKey.delete(oldest);
  }

  recentEvents.unshift({
    scope: normalizedScope,
    message,
    metadata: normalizeMetadata(metadata),
    at: new Date(now).toISOString(),
  });
  if (recentEvents.length > RECENT_EVENT_LIMIT) {
    recentEvents.length = RECENT_EVENT_LIMIT;
  }

  const normalizedMetadata = normalizeMetadata(metadata);
  if (normalizedMetadata) {
    console.warn(`[non-fatal:${normalizedScope}] ${message}`, normalizedMetadata);
    return;
  }
  console.warn(`[non-fatal:${normalizedScope}] ${message}`);
}

export function getRecentNonFatalErrors(): NonFatalErrorEvent[] {
  return [...recentEvents];
}

export function clearRecentNonFatalErrors(): void {
  recentEvents.length = 0;
  lastReportedByKey.clear();
}

export async function withNonFatal<T>(
  scope: string,
  action: () => Promise<T>,
  options?: WithNonFatalOptions,
): Promise<T | undefined> {
  try {
    return await action();
  } catch (error) {
    reportNonFatalError(scope, error, options?.metadata);
    options?.onError?.(error);
    return undefined;
  }
}

