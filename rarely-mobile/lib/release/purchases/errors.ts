import { ReleaseError } from "../errors/ReleaseError";

export function mapPurchaseError(input: unknown): ReleaseError {
  const error = input as Record<string, unknown> | undefined;
  const message = typeof error?.message === "string" ? error.message : "Purchase failed";
  const code = typeof error?.code === "string" ? error.code.toLowerCase() : "";
  if (code.includes("cancel")) return new ReleaseError({ code: "PURCHASE_CANCELLED", message, safeMessage: "No purchase was made.", retryable: false, recovery: "NONE" });
  if (code.includes("pending")) return new ReleaseError({ code: "PURCHASE_PENDING", message, safeMessage: "Your purchase is still processing.", retryable: true, recovery: "TRY_LATER" });
  if (code.includes("unavailable") || code.includes("store")) return new ReleaseError({ code: "PURCHASE_UNAVAILABLE", message, retryable: true, recovery: "TRY_LATER" });
  return new ReleaseError({ code: "PURCHASE_FAILED", message, retryable: true, recovery: "RETRY" });
}
