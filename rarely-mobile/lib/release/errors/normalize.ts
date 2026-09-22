import { ERROR_CATALOG } from "./catalog";
import { ReleaseError } from "./ReleaseError";
import type { ErrorCode, ErrorDetails } from "./types";

const stringCodeMap: Record<string, ErrorCode> = {
  AbortError: "NETWORK_TIMEOUT",
  TimeoutError: "NETWORK_TIMEOUT",
  NetworkError: "NETWORK_OFFLINE",
  TypeError: "NETWORK_OFFLINE",
  Unauthorized: "AUTH_EXPIRED",
};

const statusToCode = (status?: number): ErrorCode | undefined => {
  if (status === 401 || status === 403) return "AUTH_EXPIRED";
  if (status === 408) return "NETWORK_TIMEOUT";
  if (status === 429) return "NETWORK_RATE_LIMITED";
  if (status !== undefined && status >= 500) return "NETWORK_SERVER";
  return undefined;
};

export function normalizeError(input: unknown, context?: { operation?: string; status?: number }): ErrorDetails {
  if (input instanceof ReleaseError) {
    const catalog = ERROR_CATALOG[input.code];
    return {
      code: input.code,
      message: input.message,
      safeMessage: input.safeMessage || catalog.safeMessage,
      retryable: input.retryable,
      recovery: input.recovery,
      status: input.status ?? context?.status,
      operation: input.operation ?? context?.operation,
      retryAfterMs: input.retryAfterMs,
      metadata: input.metadata,
    };
  }

  const objectValue = typeof input === "object" && input !== null ? input as Record<string, unknown> : undefined;
  const name = typeof objectValue?.name === "string" ? objectValue.name : undefined;
  const status = typeof objectValue?.status === "number" ? objectValue.status : context?.status;
  const explicitCode = typeof objectValue?.code === "string" ? objectValue.code as ErrorCode : undefined;
  const code = explicitCode && ERROR_CATALOG[explicitCode] ? explicitCode : statusToCode(status) ?? (name ? stringCodeMap[name] : undefined) ?? "UNKNOWN";
  const catalog = ERROR_CATALOG[code];
  const rawMessage = typeof objectValue?.message === "string" ? objectValue.message : input instanceof Error ? input.message : "Unknown error";

  return {
    code,
    message: rawMessage.slice(0, 500),
    safeMessage: catalog.safeMessage,
    retryable: catalog.retryable,
    recovery: catalog.recovery,
    status,
    causeName: name,
    operation: context?.operation,
  };
}
