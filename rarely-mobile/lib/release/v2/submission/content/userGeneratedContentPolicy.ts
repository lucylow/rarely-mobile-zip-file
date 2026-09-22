export type UGC = { id: string; body: string; authorId: string; visibility: 'private'|'circle'; reported: boolean; blocked: boolean };
export function publishable(item: UGC): boolean { return Boolean(item.id && item.authorId && item.body.trim()) && !item.reported && !item.blocked; }
export function sanitizeBody(body: string): string { return body.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim(); }
export function preview(body: string, max = 140): string { const clean = sanitizeBody(body); return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`; }
