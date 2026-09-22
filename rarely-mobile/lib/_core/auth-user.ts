export type NormalizedAuthUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
};

export type User = NormalizedAuthUser;

type UserLike = Partial<NormalizedAuthUser> & {
  id?: unknown;
  openId?: unknown;
  name?: unknown;
  email?: unknown;
  loginMethod?: unknown;
  lastSignedIn?: unknown;
};

function toOptionalTrimmedString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toIsoDate(value: unknown): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) return parsed;
  }
  return new Date(0);
}

export function normalizeAuthUserPayload(payload: unknown): NormalizedAuthUser | null {
  if (typeof payload !== "object" || payload === null) return null;
  const parsed = payload as UserLike;
  const id = typeof parsed.id === "number" ? parsed.id : Number.NaN;
  const openId = typeof parsed.openId === "string" ? parsed.openId.trim() : "";

  if (!Number.isSafeInteger(id) || id <= 0 || !openId) return null;

  return {
    id,
    openId,
    name: toOptionalTrimmedString(parsed.name),
    email: toOptionalTrimmedString(parsed.email),
    loginMethod: toOptionalTrimmedString(parsed.loginMethod),
    lastSignedIn: toIsoDate(parsed.lastSignedIn),
  };
}

export const normalizeUserPayload = normalizeAuthUserPayload;
