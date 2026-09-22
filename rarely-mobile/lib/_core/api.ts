import { Platform } from "react-native";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Auth from "./auth";

type AuthUserResponse = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const REQUEST_TIMEOUT_MS = 15_000;

function asHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

function parseResponseErrorMessage(raw: string): string {
  if (!raw.trim()) return "Request failed";
  try {
    const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
    if (typeof parsed.error === "string" && parsed.error.trim()) return parsed.error;
    if (typeof parsed.message === "string" && parsed.message.trim()) return parsed.message;
  } catch {
    // Fall through to raw text.
  }
  return raw;
}

function toAuthUserResponse(input: unknown): AuthUserResponse | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  const id = typeof value.id === "number" && Number.isFinite(value.id) ? value.id : Number.NaN;
  const openId = typeof value.openId === "string" ? value.openId : null;
  const name = typeof value.name === "string" ? value.name : null;
  const email = typeof value.email === "string" ? value.email : null;
  const loginMethod = typeof value.loginMethod === "string" ? value.loginMethod : null;
  const lastSignedIn =
    typeof value.lastSignedIn === "string" && Number.isFinite(Date.parse(value.lastSignedIn))
      ? value.lastSignedIn
      : new Date(0).toISOString();

  if (!openId || !Number.isFinite(id)) return null;
  return { id, openId, name, email, loginMethod, lastSignedIn };
}

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const signal = options.signal ?? timeoutController.signal;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...asHeaderRecord(options.headers),
  };

  // Determine the auth method:
  // - Native platform: use stored session token as Bearer auth
  // - Web (including iframe): use cookie-based auth (browser handles automatically)
  //   Cookie is set on backend domain via POST /api/auth/session after receiving token via postMessage
  if (Platform.OS !== "web") {
    const sessionToken = await Auth.getSessionToken();
    console.log("[API] apiCall:", {
      endpoint,
      hasToken: !!sessionToken,
      method: options.method || "GET",
    });
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
      console.log("[API] Authorization header added");
    }
  } else {
    console.log("[API] apiCall:", { endpoint, platform: "web", method: options.method || "GET" });
  }

  const baseUrl = getApiBaseUrl();
  // Ensure no double slashes between baseUrl and endpoint
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = baseUrl ? `${cleanBaseUrl}${cleanEndpoint}` : endpoint;
  console.log("[API] Full URL:", url);

  try {
    console.log("[API] Making request...");
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      signal,
    });

    console.log("[API] Response status:", response.status, response.statusText);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log("[API] Response headers:", responseHeaders);

    // Check if Set-Cookie header is present (cookies are automatically handled in React Native)
    const setCookie = response.headers.get("Set-Cookie");
    if (setCookie) {
      console.log("[API] Set-Cookie header received:", setCookie);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] Error response:", errorText);
      const errorMessage = parseResponseErrorMessage(errorText) || `API call failed: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, response.status >= 500);
    }

    const contentType = response.headers.get("content-type");
    if (response.status === 204 || response.status === 205) {
      return {} as T;
    }
    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.json();
        console.log("[API] JSON response received");
        return data as T;
      } catch {
        throw new ApiError("The server returned invalid JSON.", response.status, true);
      }
    }

    const text = await response.text();
    console.log("[API] Text response received");
    if (!text.trim()) return {} as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError("The server returned an unreadable response.", response.status, true);
    }
  } catch (error) {
    console.error("[API] Request failed:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", undefined, true);
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, undefined, true);
    }
    throw new ApiError("Unknown error occurred", undefined, true);
  } finally {
    clearTimeout(timeout);
  }
}

// OAuth callback handler - exchange code for session token
// Calls /api/oauth/mobile endpoint which returns JSON with app_session_id and user
export async function exchangeOAuthCode(
  code: string,
  state: string,
): Promise<{ sessionToken: string; user: AuthUserResponse | null }> {
  console.log("[API] exchangeOAuthCode called");
  // Use GET with query params
  const params = new URLSearchParams({ code, state });
  const endpoint = `/api/oauth/mobile?${params.toString()}`;
  console.log("[API] Calling OAuth mobile endpoint:", endpoint);
  const result = await apiCall<{ app_session_id?: unknown; user?: unknown }>(endpoint);

  // Convert app_session_id to sessionToken for compatibility
  const sessionToken = typeof result.app_session_id === "string" ? result.app_session_id.trim() : "";
  const user = toAuthUserResponse(result.user);
  console.log("[API] OAuth exchange result:", {
    hasSessionToken: !!sessionToken,
    hasUser: !!user,
    sessionToken: sessionToken ? `${sessionToken.substring(0, 50)}...` : null,
  });
  if (!sessionToken) {
    throw new ApiError("Login succeeded but no app session token was returned.");
  }

  return {
    sessionToken,
    user,
  };
}

// Logout
export async function logout(): Promise<void> {
  await apiCall<void>("/api/auth/logout", {
    method: "POST",
  });
}

// Get current authenticated user (web uses cookie-based auth)
export async function getMe(): Promise<{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: string;
} | null> {
  try {
    const result = await apiCall<{ user?: unknown }>("/api/auth/me");
    const user = toAuthUserResponse(result.user);
    return user || null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    console.error("[API] getMe failed:", error);
    return null;
  }
}

// Establish session cookie on the backend (3000-xxx domain)
// Called after receiving token via postMessage to get a proper Set-Cookie from the backend
export async function establishSession(token: string): Promise<boolean> {
  try {
    console.log("[API] establishSession: setting cookie on backend...");
    const baseUrl = getApiBaseUrl();
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${cleanBaseUrl}/api/auth/session`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include", // Important: allows Set-Cookie to be stored
    });

    if (!response.ok) {
      const reason = await response.text();
      console.error("[API] establishSession failed:", response.status, reason);
      return false;
    }

    console.log("[API] establishSession: cookie set successfully");
    return true;
  } catch (error) {
    console.error("[API] establishSession error:", error);
    return false;
  }
}
