export type UniversalLink = { scheme: string; host: string; path: string; signed: boolean; source: 'user'|'system'|'web' };
export const ALLOWED_HOSTS = new Set(['rarely.app', 'www.rarely.app']);
export function verifyLink(link: UniversalLink): string[] {
  const errors: string[] = [];
  if (link.scheme !== 'https') errors.push('https-required');
  if (!ALLOWED_HOSTS.has(link.host)) errors.push('host-not-allowed');
  if (!link.path.startsWith('/app/')) errors.push('path-not-allowed');
  if (link.source !== 'system' && !link.signed) errors.push('signature-required');
  return errors;
}
export function safeRoute(link: UniversalLink): string | null { return verifyLink(link).length ? null : link.path.slice('/app/'.length); }
