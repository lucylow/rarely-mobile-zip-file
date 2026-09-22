import type { ErrorCode, RecoveryAction } from "./types";

interface CatalogEntry {
  safeMessage: string;
  retryable: boolean;
  recovery: RecoveryAction;
}

export const ERROR_CATALOG: Record<ErrorCode, CatalogEntry> = {
  UNKNOWN: { safeMessage: "Something went wrong. Please try again.", retryable: true, recovery: "RETRY" },
  NETWORK_OFFLINE: { safeMessage: "You appear to be offline. Your saved work is still on this device.", retryable: true, recovery: "RECONNECT" },
  NETWORK_TIMEOUT: { safeMessage: "That took too long. Please try again.", retryable: true, recovery: "RETRY" },
  NETWORK_RATE_LIMITED: { safeMessage: "Too many requests. Please pause for a moment and try again.", retryable: true, recovery: "TRY_LATER" },
  NETWORK_SERVER: { safeMessage: "The service is having trouble right now. Try again shortly.", retryable: true, recovery: "TRY_LATER" },
  AUTH_EXPIRED: { safeMessage: "Your session expired. Please sign in again.", retryable: false, recovery: "SIGN_IN" },
  AUTH_REQUIRED: { safeMessage: "Please sign in to continue.", retryable: false, recovery: "SIGN_IN" },
  AUTH_REVOKED: { safeMessage: "Your session was signed out. Please sign in again.", retryable: false, recovery: "SIGN_IN" },
  VALIDATION_FAILED: { safeMessage: "Please check the highlighted information and try again.", retryable: false, recovery: "RESELECT_INPUT" },
  STORAGE_UNAVAILABLE: { safeMessage: "Local storage is temporarily unavailable. Your current screen can still continue.", retryable: true, recovery: "RETRY" },
  STORAGE_MALFORMED: { safeMessage: "Some local data could not be read. We kept the rest of your app intact.", retryable: false, recovery: "REPAIR_STORAGE" },
  STORAGE_QUOTA: { safeMessage: "There is not enough local space to save this item.", retryable: false, recovery: "OPEN_SETTINGS" },
  STORAGE_CONFLICT: { safeMessage: "Your local changes need to be reconciled before saving.", retryable: false, recovery: "RETRY" },
  SYNC_CONFLICT: { safeMessage: "Your latest changes could not be merged automatically.", retryable: false, recovery: "RETRY" },
  SYNC_REJECTED: { safeMessage: "This change was not accepted by the server.", retryable: false, recovery: "TRY_LATER" },
  SYNC_TEMPORARY: { safeMessage: "Sync is temporarily delayed. Your local changes remain available.", retryable: true, recovery: "TRY_LATER" },
  PURCHASE_CANCELLED: { safeMessage: "No purchase was made.", retryable: false, recovery: "NONE" },
  PURCHASE_PENDING: { safeMessage: "Your purchase is still processing. Access will update when Apple confirms it.", retryable: true, recovery: "TRY_LATER" },
  PURCHASE_UNAVAILABLE: { safeMessage: "Purchases are temporarily unavailable on this device.", retryable: true, recovery: "TRY_LATER" },
  PURCHASE_FAILED: { safeMessage: "We could not complete the purchase. You have not lost your existing access.", retryable: true, recovery: "RETRY" },
  ENTITLEMENT_UNKNOWN: { safeMessage: "We could not confirm your membership yet.", retryable: true, recovery: "RESTORE_PURCHASES" },
  ENTITLEMENT_EXPIRED: { safeMessage: "This membership has ended. You can review your options anytime.", retryable: false, recovery: "OPEN_SETTINGS" },
  ENTITLEMENT_SYNC_FAILED: { safeMessage: "Membership status is temporarily delayed.", retryable: true, recovery: "TRY_LATER" },
  AI_CONSENT_REQUIRED: { safeMessage: "Please allow the AI tool to use the information you enter.", retryable: false, recovery: "OPEN_SETTINGS" },
  AI_INPUT_REJECTED: { safeMessage: "That input is not suitable for this creative tool. Try a shorter, non-sensitive prompt.", retryable: false, recovery: "RESELECT_INPUT" },
  AI_UNAVAILABLE: { safeMessage: "Creative AI is unavailable right now. A built-in prompt is ready instead.", retryable: true, recovery: "RETRY" },
  AI_OUTPUT_INVALID: { safeMessage: "The creative result was not usable, so we switched to a safe fallback.", retryable: true, recovery: "RETRY" },
  MEDIA_NOT_FOUND: { safeMessage: "That image is no longer available. We kept your text safe.", retryable: false, recovery: "RESELECT_INPUT" },
  MEDIA_UNSUPPORTED: { safeMessage: "That media format is not supported on this device.", retryable: false, recovery: "RESELECT_INPUT" },
  FEATURE_DISABLED: { safeMessage: "This feature is unavailable in the current build.", retryable: false, recovery: "NONE" },
  RATE_LIMITED: { safeMessage: "Please slow down for a moment and try again.", retryable: true, recovery: "TRY_LATER" },
  SERVER_CONFIGURATION: { safeMessage: "This service is not configured for this environment.", retryable: false, recovery: "CONTACT_SUPPORT" },
  SERVER_DEPENDENCY: { safeMessage: "A required service is temporarily unavailable.", retryable: true, recovery: "TRY_LATER" },
};
