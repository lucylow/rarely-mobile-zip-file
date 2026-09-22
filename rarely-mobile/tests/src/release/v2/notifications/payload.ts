export interface NotificationPayload { route?: string; kind: string; itemId?: string; }
export function encodeNotificationPayload(payload: NotificationPayload): string { return JSON.stringify(payload); }
export function decodeNotificationPayload(raw: string | undefined): NotificationPayload | null { if (!raw) return null; try { const value = JSON.parse(raw) as NotificationPayload; if (!value.kind) return null; return value; } catch { return null; } }
