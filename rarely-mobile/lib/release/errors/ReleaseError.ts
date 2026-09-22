import type { ErrorCode, ErrorDetails, RecoveryAction } from "./types";

export class ReleaseError extends Error {
  readonly code: ErrorCode;
  readonly safeMessage: string;
  readonly retryable: boolean;
  readonly recovery: RecoveryAction;
  readonly status?: number;
  readonly operation?: string;
  readonly retryAfterMs?: number;
  readonly metadata?: Record<string, string | number | boolean | null>;

  constructor(input: Partial<ErrorDetails> & { code: ErrorCode; message: string }) {
    super(input.message);
    this.name = "ReleaseError";
    this.code = input.code;
    this.safeMessage = input.safeMessage ?? "Something went wrong. Please try again.";
    this.retryable = input.retryable ?? false;
    this.recovery = input.recovery ?? "NONE";
    this.status = input.status;
    this.operation = input.operation;
    this.retryAfterMs = input.retryAfterMs;
    this.metadata = input.metadata;
  }
}

export const isReleaseError = (value: unknown): value is ReleaseError =>
  value instanceof ReleaseError ||
  (typeof value === "object" && value !== null && "code" in value && "safeMessage" in value);
