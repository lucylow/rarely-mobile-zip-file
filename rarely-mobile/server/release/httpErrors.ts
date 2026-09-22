import { ReleaseError } from "../../lib/release/errors/ReleaseError";
import type { ErrorDetails } from "../../lib/release/errors/types";

export interface HttpErrorPayload { ok: false; error: { code: string; message: string; requestId?: string; retryable: boolean } }

export function toHttpPayload(details: ErrorDetails, requestId?: string): HttpErrorPayload {
  return { ok: false, error: { code: details.code, message: details.safeMessage, requestId, retryable: details.retryable } };
}

export function isClientAbort(error: unknown): boolean { return error instanceof ReleaseError && error.code === "NETWORK_TIMEOUT"; }
