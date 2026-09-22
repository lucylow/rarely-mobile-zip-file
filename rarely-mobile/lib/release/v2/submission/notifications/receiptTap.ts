export type NotificationReceipt = { id: string; type: 'moment'|'routine'|'community'|'system'; route: string; consumed: boolean; createdAt: number };
export function consume(receipt: NotificationReceipt): NotificationReceipt { return receipt.consumed ? receipt : { ...receipt, consumed: true }; }
export function safeRoute(receipt: NotificationReceipt): string | null { return /^\/(moment|routine|circle|settings)\/[-a-zA-Z0-9_]+$/.test(receipt.route) ? receipt.route : null; }
export function stale(receipt: NotificationReceipt, now = Date.now(), ttlMs = 24 * 60 * 60_000): boolean { return now - receipt.createdAt > ttlMs; }
