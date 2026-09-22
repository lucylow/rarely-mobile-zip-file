export type ErrorCode =
  | "UNKNOWN"
  | "NETWORK_OFFLINE"
  | "NETWORK_TIMEOUT"
  | "NETWORK_RATE_LIMITED"
  | "NETWORK_SERVER"
  | "AUTH_EXPIRED"
  | "AUTH_REQUIRED"
  | "AUTH_REVOKED"
  | "VALIDATION_FAILED"
  | "STORAGE_UNAVAILABLE"
  | "STORAGE_MALFORMED"
  | "STORAGE_QUOTA"
  | "STORAGE_CONFLICT"
  | "SYNC_CONFLICT"
  | "SYNC_REJECTED"
  | "SYNC_TEMPORARY"
  | "PURCHASE_CANCELLED"
  | "PURCHASE_PENDING"
  | "PURCHASE_UNAVAILABLE"
  | "PURCHASE_FAILED"
  | "ENTITLEMENT_UNKNOWN"
  | "ENTITLEMENT_EXPIRED"
  | "ENTITLEMENT_SYNC_FAILED"
  | "AI_CONSENT_REQUIRED"
  | "AI_INPUT_REJECTED"
  | "AI_UNAVAILABLE"
  | "AI_OUTPUT_INVALID"
  | "MEDIA_NOT_FOUND"
  | "MEDIA_UNSUPPORTED"
  | "FEATURE_DISABLED"
  | "RATE_LIMITED"
  | "SERVER_CONFIGURATION"
  | "SERVER_DEPENDENCY";

export type RecoveryAction =
  | "NONE"
  | "RETRY"
  | "RECONNECT"
  | "SIGN_IN"
  | "RESTORE_PURCHASES"
  | "OPEN_SETTINGS"
  | "RESELECT_INPUT"
  | "REPAIR_STORAGE"
  | "CONTACT_SUPPORT"
  | "TRY_LATER";

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  safeMessage: string;
  retryable: boolean;
  recovery: RecoveryAction;
  status?: number;
  causeName?: string;
  fingerprint?: string;
  operation?: string;
  retryAfterMs?: number;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ErrorBoundaryState {
  phase: "idle" | "recovering" | "failed";
  error?: ErrorDetails;
  attempts: number;
}
