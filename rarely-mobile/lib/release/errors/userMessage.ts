import { ERROR_CATALOG } from "./catalog";
import type { ErrorCode, ErrorDetails } from "./types";

export function userMessageFor(code: ErrorCode): string {
  return ERROR_CATALOG[code]?.safeMessage ?? ERROR_CATALOG.UNKNOWN.safeMessage;
}

export function shouldShowRetry(error: ErrorDetails): boolean {
  return error.retryable && error.recovery === "RETRY";
}

export function actionLabel(error: ErrorDetails): string | undefined {
  switch (error.recovery) {
    case "RETRY": return "Try again";
    case "RECONNECT": return "Reconnect";
    case "SIGN_IN": return "Sign in";
    case "RESTORE_PURCHASES": return "Restore purchases";
    case "OPEN_SETTINGS": return "Open settings";
    case "REPAIR_STORAGE": return "Repair local data";
    case "TRY_LATER": return "Try later";
    case "RESELECT_INPUT": return "Choose again";
    case "CONTACT_SUPPORT": return "Contact support";
    default: return undefined;
  }
}
