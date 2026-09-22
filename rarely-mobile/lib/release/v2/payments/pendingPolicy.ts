export function pendingPurchaseMessage(): string { return 'Apple is still processing the purchase. We will update your membership when the transaction finishes.'; }
export function shouldPollForPendingPurchase(ageMs: number): boolean { return ageMs < 15 * 60_000; }
