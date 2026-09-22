import type { Surface } from "./uxTypes";

const SESSION_KEY = "rarely.session.v1";
export type SessionSnapshot = { lastSurface: Surface; lastRoute?: string };

type StorageLike = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const SURFACES: Surface[] = ["home", "create", "community", "rareStudio", "profile"];

function isSessionSnapshot(value: unknown): value is SessionSnapshot {
  if (!value || typeof value !== "object") return false;
  const maybe = value as { lastSurface?: unknown; lastRoute?: unknown };
  const hasValidSurface =
    typeof maybe.lastSurface === "string" && SURFACES.includes(maybe.lastSurface as Surface);
  const hasValidRoute = maybe.lastRoute === undefined || typeof maybe.lastRoute === "string";
  return hasValidSurface && hasValidRoute;
}

async function safeRemoveSessionSnapshot(storage: StorageLike) {
  try {
    await storage.removeItem(SESSION_KEY);
  } catch {
    // Ignore cleanup failures and keep restore resilient.
  }
}

export async function restoreSession(storage: StorageLike): Promise<SessionSnapshot | null> {
  let raw: string | null = null;
  try {
    raw = await storage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isSessionSnapshot(parsed)) {
      await safeRemoveSessionSnapshot(storage);
      return null;
    }
    return parsed;
  } catch {
    await safeRemoveSessionSnapshot(storage);
    return null;
  }
}

export async function saveSession(storage: StorageLike, snapshot: SessionSnapshot) {
  if (!isSessionSnapshot(snapshot)) {
    throw new Error("Invalid session snapshot");
  }
  await storage.setItem(SESSION_KEY, JSON.stringify(snapshot));
}

export { SESSION_KEY };
