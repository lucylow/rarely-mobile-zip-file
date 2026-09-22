import { ReleaseError } from "../errors/ReleaseError";
import { retry } from "./retry";
import { withTimeout } from "./timeout";

export interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  operation?: string;
}

export async function safeFetch(input: RequestInfo | URL, options: SafeFetchOptions = {}): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const retries = options.retries ?? 2;
  const operation = options.operation ?? "http";
  return retry(async () => {
    try {
      const request = fetch(input, options);
      const response = await withTimeout(request, timeoutMs, operation);
      if (!response.ok) {
        const status = response.status;
        const code = status === 401 ? "AUTH_EXPIRED" : status === 429 ? "NETWORK_RATE_LIMITED" : status >= 500 ? "NETWORK_SERVER" : "NETWORK_SERVER";
        throw new ReleaseError({
          code,
          status,
          operation,
          message: `HTTP ${status} from ${operation}`,
          retryable: status === 429 || status >= 500,
          recovery: status === 401 ? "SIGN_IN" : status === 429 ? "TRY_LATER" : "RETRY",
        });
      }
      return response;
    } catch (error) {
      if (error instanceof ReleaseError) throw error;
      if (error instanceof TypeError) {
        throw new ReleaseError({ code: "NETWORK_OFFLINE", message: error.message, operation, retryable: true, recovery: "RECONNECT" });
      }
      throw error;
    }
  }, { maxAttempts: retries + 1, shouldRetry: (error) => error.retryable });
}
