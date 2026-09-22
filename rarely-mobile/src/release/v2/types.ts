export type EnvironmentName = 'development' | 'preview' | 'production';
export type AppPlatform = 'ios' | 'web';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface ReleaseEnvironment {
  name: EnvironmentName;
  apiBaseUrl: string;
  appScheme: string;
  bundleIdentifier: string;
  storeProductIds: readonly string[];
  mockPurchases: boolean;
  mockNetwork: boolean;
  debugMenu: boolean;
}

export interface ReleaseCheck {
  id: string;
  title: string;
  severity: 'error' | 'warning' | 'info';
  passed: boolean;
  detail: string;
  fix?: string;
}

export interface ReleaseReport {
  version: string;
  buildNumber: string;
  generatedAt: string;
  environment: EnvironmentName;
  checks: ReleaseCheck[];
  blockers: number;
  warnings: number;
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
