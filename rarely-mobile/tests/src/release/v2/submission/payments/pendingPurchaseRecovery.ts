export type PendingPurchase = { id: string; productId: string; createdAt: number; attempts: number; status: 'pending'|'recovering'|'resolved'|'failed' };
export function scheduleRecovery(item: PendingPurchase): PendingPurchase { return { ...item, status: 'recovering', attempts: item.attempts + 1 }; }
export function resolveRecovery(item: PendingPurchase): PendingPurchase { return { ...item, status: 'resolved' }; }
export function failRecovery(item: PendingPurchase, maxAttempts = 5): PendingPurchase { return { ...item, status: item.attempts >= maxAttempts ? 'failed' : 'pending' }; }
export function recoverable(items: PendingPurchase[], now: number, minAgeMs = 2_000): PendingPurchase[] {
  return items.filter((x) => x.status !== 'resolved' && now - x.createdAt >= minAgeMs).sort((a,b) => a.createdAt - b.createdAt);
}
