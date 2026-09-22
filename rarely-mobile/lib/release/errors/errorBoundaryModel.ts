import type { ErrorBoundaryState, ErrorDetails } from "./types";

export const initialErrorBoundaryState = (): ErrorBoundaryState => ({ phase: "idle", attempts: 0 });

export function enterRecovery(state: ErrorBoundaryState, error: ErrorDetails): ErrorBoundaryState {
  return { phase: "recovering", error, attempts: state.attempts + 1 };
}

export function markRecovered(): ErrorBoundaryState {
  return { phase: "idle", attempts: 0 };
}

export function markFailed(state: ErrorBoundaryState, error: ErrorDetails): ErrorBoundaryState {
  return { phase: "failed", error, attempts: state.attempts };
}

export function canAutoRecover(state: ErrorBoundaryState, maxAttempts = 2): boolean {
  return state.phase !== "failed" && state.attempts < maxAttempts;
}
