export interface AvailabilitySnapshot { canBuy: boolean; reason?: "not-ios" | "missing-key" | "no-offering" | "ready"; }
export function purchaseAvailability(input: { ios: boolean; keyConfigured: boolean; hasOffering: boolean }): AvailabilitySnapshot {
  if (!input.ios) return { canBuy: false, reason: "not-ios" };
  if (!input.keyConfigured) return { canBuy: false, reason: "missing-key" };
  if (!input.hasOffering) return { canBuy: false, reason: "no-offering" };
  return { canBuy: true, reason: "ready" };
}
