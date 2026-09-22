import type { ActivityEvent } from "./types";

export function randomToken(length = 10): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let value = "";
  for (let index = 0; index < length; index += 1) {
    const position = Math.floor(Math.random() * alphabet.length);
    value += alphabet[position];
  }
  return value;
}

export function createDeviceId(): string {
  return `device_${randomToken(18)}`;
}

export function createSessionId(): string {
  return `session_${Date.now()}_${randomToken(12)}`;
}

export function createEventId(
  deviceId: string,
  occurredAt: string,
  kind: ActivityEvent["kind"],
): string {
  const day = occurredAt.slice(0, 10).replace(/-/g, "");
  return `${day}_${deviceId}_${kind}_${randomToken(8)}`;
}

export function createMemoryId(key: string): string {
  return `memory_${stableHash(key).slice(0, 16)}`;
}

export function createTelemetryId(name: string, timestamp = Date.now()): string {
  return `telemetry_${stableHash(`${name}:${timestamp}:${randomToken(4)}`).slice(0, 20)}`;
}

export function stableHash(input: string): string {
  let hashA = 0x811c9dc5;
  let hashB = 0x9e3779b9;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 0x01000193);
    hashB ^= code + index;
    hashB = Math.imul(hashB, 0x85ebca6b);
  }
  return `${(hashA >>> 0).toString(16).padStart(8, "0")}${(hashB >>> 0).toString(16).padStart(8, "0")}`;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function daysBetween(older: string, newer: string): number {
  const a = Date.parse(older);
  const b = Date.parse(newer);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.floor((b - a) / 86_400_000));
}

export function isoDate(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function startOfDay(date = new Date()): Date {
  return new Date(`${isoDate(date)}T00:00:00.000Z`);
}

export function endOfDay(date = new Date()): Date {
  return new Date(`${isoDate(date)}T23:59:59.999Z`);
}

export function isSameDay(a: string, b: string): boolean {
  return isoDate(new Date(a)) === isoDate(new Date(b));
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function topN<T>(
  values: T[],
  score: (value: T) => number,
  count: number,
): T[] {
  return [...values].sort((left, right) => score(right) - score(left)).slice(0, Math.max(0, count));
}
