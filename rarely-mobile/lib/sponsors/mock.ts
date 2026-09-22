let sequence = 0;

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, Math.min(ms, 900)));

export function resetDemoSequence(): void {
  sequence = 0;
}

export function makeId(prefix: string): string {
  sequence += 1;
  return `demo-${prefix}-${String(sequence).padStart(3, "0")}`;
}

import type { SponsorId, SponsorResult } from "./types";

export type ProviderMeta = { provider: string; mode: "mock"; requestId: string; durationMs: number; status: "complete" | "fallback" | "error" };

export function mockResult<T>(provider: SponsorId, requestId: string, data: T, durationMs: number): SponsorResult<T> {
  return { data, provider, mode: "mock", requestId, durationMs, status: "success" };
}

export async function withMockMeta<T>(provider: string, operation: () => Promise<T>): Promise<T & { meta: ProviderMeta }> {
  const requestId = makeId(provider);
  const started = Date.now();
  const value = await operation();
  return { ...(value as object), meta: { provider, mode: "mock" as const, requestId, durationMs: Date.now() - started, status: "complete" as const } } as T & { meta: ProviderMeta };
}
