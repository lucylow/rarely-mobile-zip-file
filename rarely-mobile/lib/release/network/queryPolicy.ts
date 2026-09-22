export interface QueryFailure { code?: string; retryable?: boolean; }
export interface QueryPolicy { staleTimeMs: number; retry: number; refetchOnFocus: boolean; refetchOnReconnect: boolean; }

export const CORE_QUERY_POLICY: QueryPolicy = {
  staleTimeMs: 30_000,
  retry: 2,
  refetchOnFocus: true,
  refetchOnReconnect: true,
};

export function queryRetry(failure: QueryFailure | undefined, attempt: number): boolean {
  if (!failure) return attempt < 2;
  if (failure.code === "AUTH_EXPIRED") return false;
  if (failure.code === "PURCHASE_CANCELLED") return false;
  return failure.retryable !== false && attempt < 2;
}
