export type BillingEventType = 'INITIAL_PURCHASE' | 'RENEWAL' | 'CANCELLATION' | 'EXPIRATION' | 'BILLING_ISSUE' | 'PRODUCT_CHANGE';
export interface BillingEvent { id: string; appUserId?: string; productId?: string; type: BillingEventType; eventAt: number; expirationAt?: number; }

export function eventChangesAccess(event: BillingEvent): boolean {
  return ['INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE', 'PRODUCT_CHANGE'].includes(event.type);
}

export function summarizeBillingEvent(event: BillingEvent): string {
  return `${event.type}:${event.productId ?? 'unknown'}:${event.appUserId ?? 'anonymous'}`;
}
