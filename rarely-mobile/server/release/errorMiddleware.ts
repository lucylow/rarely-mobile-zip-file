import { normalizeError } from "../../lib/release/errors/normalize";
import { fingerprintError, withFingerprint } from "../../lib/release/errors/fingerprint";
import { redactObject } from "../../lib/release/privacy/redact";
import type { ErrorDetails } from "../../lib/release/errors/types";
import { ensureRequestId } from "./requestId";

export interface ErrorLogSink { write(input: { requestId: string; error: ErrorDetails; context: Record<string, unknown> }): Promise<void> | void; }

export async function normalizeServerFailure(input: { error: unknown; requestId?: string; operation?: string; status?: number; context?: Record<string, unknown>; sink?: ErrorLogSink }): Promise<{ requestId: string; error: ErrorDetails }> {
  const requestId = ensureRequestId(input.requestId);
  const normalized = withFingerprint(normalizeError(input.error, { operation: input.operation, status: input.status }));
  if (input.sink) {
    await input.sink.write({ requestId, error: normalized, context: redactObject(input.context ?? {}) as Record<string, unknown> });
  }
  return { requestId, error: normalized };
}

export function loggableErrorCode(error: ErrorDetails): string { return error.fingerprint ?? fingerprintError(error); }
