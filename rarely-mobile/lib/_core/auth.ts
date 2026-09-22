import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, USER_INFO_KEY } from "@/constants/oauth";
import { normalizeAuthUserPayload, type NormalizedAuthUser } from "./auth-user";

export type User = NormalizedAuthUser;

function tokenPreview(token: string | null): string {
  if (!token) return "missing";
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

function isWebStorageAvailable(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function normalizeUserPayload(payload: unknown): User | null {
  return normalizeAuthUserPayload(payload);
}

function parseUser(raw: string): User | null {
  try {
    return normalizeUserPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token retrieval");
      return null;
    }

    // Use SecureStore for native
    console.log("[Auth] Getting session token...");
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    console.log("[Auth] Session token retrieved from SecureStore:", tokenPreview(token));
    return token;
  } catch (error) {
    console.error("[Auth] Failed to get session token:", error);
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    if (!token?.trim()) {
      throw new Error("Cannot store an empty session token.");
    }

    // Web platform uses cookie-based auth, no manual token management needed
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token storage");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Setting session token...", tokenPreview(token));
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    console.log("[Auth] Session token stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set session token:", error);
    throw error;
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    // Web platform uses cookie-based auth, logout is handled by server clearing cookie
    if (Platform.OS === "web") {
      console.log("[Auth] Web platform uses cookie-based auth, skipping token removal");
      return;
    }

    // Use SecureStore for native
    console.log("[Auth] Removing session token...");
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    console.log("[Auth] Session token removed from SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to remove session token:", error);
  }
}

export async function getUserInfo(): Promise<User | null> {
  try {
    console.log("[Auth] Getting user info...");

    let info: string | null = null;
    if (Platform.OS === "web") {
      // Use localStorage for web
      info = isWebStorageAvailable() ? window.localStorage.getItem(USER_INFO_KEY) : null;
    } else {
      // Use SecureStore for native
      info = await SecureStore.getItemAsync(USER_INFO_KEY);
    }

    if (!info) {
      console.log("[Auth] No user info found");
      return null;
    }
    const user = parseUser(info);
    if (!user) {
      console.warn("[Auth] Stored user info was malformed, clearing...");
      await clearUserInfo();
      return null;
    }
    console.log("[Auth] User info retrieved:", { id: user.id, hasEmail: Boolean(user.email) });
    return user;
  } catch (error) {
    console.error("[Auth] Failed to get user info:", error);
    return null;
  }
}

export async function setUserInfo(user: User): Promise<void> {
  try {
    const normalized = normalizeUserPayload(user);
    if (!normalized) {
      throw new Error("Invalid user info payload.");
    }
    console.log("[Auth] Setting user info...", { id: normalized.id, hasEmail: Boolean(normalized.email) });

    if (Platform.OS === "web") {
      // Use localStorage for web
      if (isWebStorageAvailable()) {
        window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(normalized));
      }
      console.log("[Auth] User info stored in localStorage successfully");
      return;
    }

    // Use SecureStore for native
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(normalized));
    console.log("[Auth] User info stored in SecureStore successfully");
  } catch (error) {
    console.error("[Auth] Failed to set user info:", error);
  }
}

export async function clearUserInfo(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      // Use localStorage for web
      if (isWebStorageAvailable()) {
        window.localStorage.removeItem(USER_INFO_KEY);
      }
      return;
    }

    // Use SecureStore for native
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
  } catch (error) {
    console.error("[Auth] Failed to clear user info:", error);
  }
}
