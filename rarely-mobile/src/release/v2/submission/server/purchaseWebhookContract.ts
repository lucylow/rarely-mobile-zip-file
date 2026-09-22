export type PurchaseWebhook = { eventId: string; type: 'INITIAL_PURCHASE'|'RENEWAL'|'CANCELLATION'|'EXPIRATION'|'NON_RENEWING_PURCHASE'; appUserId?: string; productId: string; transactionId: string; environment: 'SANDBOX'|'PRODUCTION'; eventAt: number };
export function validateWebhook(event: PurchaseWebhook): string[] {
  const errors: string[] = [];
  if (!event.eventId.trim()) errors.push('event-id');
  if (!event.productId.trim()) errors.push('product-id');
  if (!event.transactionId.trim()) errors.push('transaction-id');
  if (!event.appUserId?.trim()) errors.push('app-user-id');
  if (event.eventAt <= 0) errors.push('event-time');
  return errors;
}
export function idempotencyKey(event: PurchaseWebhook): string { return `${event.environment}:${event.eventId}:${event.transactionId}`; }
