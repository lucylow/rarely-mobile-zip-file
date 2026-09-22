const ALLOWED = new Set(['https:', 'rarely:']);
export function safeUrl(url: string): URL | null { try { const parsed = new URL(url); return ALLOWED.has(parsed.protocol) ? parsed : null; } catch { return null; } }
export function safeExternalUrl(url: string): boolean { const parsed = safeUrl(url); return !!parsed && parsed.protocol === 'https:' && !parsed.username && !parsed.password; }
