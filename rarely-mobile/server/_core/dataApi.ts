/**
 * Quick example (matches curl usage):
 *   await callDataApi("Youtube/search", {
 *     query: { gl: "US", hl: "en", q: "manus" },
 *   })
 */
import { ENV } from "./env";

export type DataApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  pathParams?: Record<string, unknown>;
  formData?: Record<string, unknown>;
};

export class DataApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "DataApiError";
  }
}

const DATA_API_TIMEOUT_MS = 12_000;

function validateApiId(apiId: string): string {
  const trimmed = apiId.trim();
  if (!trimmed) throw new DataApiError("Data API ID is required");
  if (trimmed.length > 256) throw new DataApiError("Data API ID is too long");
  return trimmed;
}

function safeRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function isAbortLikeError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  if (!error || typeof error !== "object") return false;
  const maybe = error as { name?: unknown; code?: unknown };
  if (maybe.name === "AbortError") return true;
  if (maybe.code === "ABORT_ERR") return true;
  return false;
}

export async function callDataApi(
  apiId: string,
  options: DataApiCallOptions = {},
): Promise<unknown> {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }

  const normalizedApiId = validateApiId(apiId);
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), DATA_API_TIMEOUT_MS);

  // Build the full URL by appending the service path to the base URL
  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL("webdevtoken.v1.WebDevService/CallApi", baseUrl).toString();

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "connect-protocol-version": "1",
        authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      signal: timeoutController.signal,
      body: JSON.stringify({
        apiId: normalizedApiId,
        query: safeRecord(options.query),
        body: safeRecord(options.body),
        path_params: safeRecord(options.pathParams),
        multipart_form_data: safeRecord(options.formData),
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new DataApiError(
        `Data API request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`,
        response.status,
        response.status >= 500,
      );
    }

    const payload = await response.json().catch(() => ({}));
    if (payload && typeof payload === "object" && "jsonData" in payload) {
      const jsonData = (payload as Record<string, unknown>).jsonData;
      if (typeof jsonData === "string") {
        try {
          return JSON.parse(jsonData);
        } catch {
          return jsonData;
        }
      }
      return jsonData;
    }
    return payload;
  } catch (error) {
    if (error instanceof DataApiError) throw error;
    if (isAbortLikeError(error)) {
      throw new DataApiError("Data API request timed out", undefined, true);
    }
    if (error instanceof Error) {
      throw new DataApiError(error.message, undefined, true);
    }
    throw new DataApiError("Unknown Data API error", undefined, true);
  } finally {
    clearTimeout(timeout);
  }
}
