const BLOCKED_HOSTS = new Set(['javascript:', 'data:', 'file:']);
const ALLOWED_SCHEMES = new Set(['rarely', 'https']);

export function isSafeDeepLink(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    if (BLOCKED_HOSTS.has(url.protocol)) return false;
    if (!ALLOWED_SCHEMES.has(url.protocol.replace(':', ''))) return false;
    if (url.username || url.password) return false;
    if (url.protocol === 'https:' && !url.hostname.endsWith('.example.com') && url.hostname !== 'example.com') return false;
    return true;
  } catch {
    return false;
  }
}

export function sanitizePathSegment(value: string): string {
  return encodeURIComponent(value.trim()).slice(0, 200);
}
