export function requireEntitlement(activeIds: string[], required = "rarely_plus"): void { if (!activeIds.includes(required)) throw new Error("ENTITLEMENT_REQUIRED"); }
