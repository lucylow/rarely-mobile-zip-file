export type ErrorTone = 'gentle'|'neutral'|'urgent';
export function userMessage(code: string, tone: ErrorTone = 'neutral'): string {
  const messages: Record<string,string> = { offline: 'You are offline. Your work is saved here and will sync later.', timeout: 'That took too long. Your work is still safe.', unauthorized: 'Please sign in again to continue.', purchase_pending: 'Your purchase is still being confirmed. Check again shortly.', storage_recovered: 'We recovered your saved work.', unknown: 'Something went wrong. Please try again.' };
  const base = messages[code] ?? messages.unknown;
  return tone === 'urgent' ? `${base} We recommend trying again before leaving.` : base;
}
