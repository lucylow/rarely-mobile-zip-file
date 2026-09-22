export type DeepLink =
  | { kind: 'home' }
  | { kind: 'moment'; momentId: string }
  | { kind: 'journal'; journalId: string }
  | { kind: 'routine'; routineId: string }
  | { kind: 'circle'; circleId: string }
  | { kind: 'membership' }
  | { kind: 'unknown'; path: string };

export function parseDeepLink(url: string): DeepLink {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: 'unknown', path: url };
  }

  const rawPath = parsed.protocol === 'rarely:' && parsed.hostname
    ? `/${parsed.hostname}${parsed.pathname}`
    : parsed.pathname;
  const path = rawPath.replace(/^\/+|\/+$/g, '');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { kind: 'home' };
  if (parts[0] === 'membership') return { kind: 'membership' };
  if (parts.length === 2 && parts[0] === 'moment') return { kind: 'moment', momentId: parts[1] };
  if (parts.length === 2 && parts[0] === 'journal') return { kind: 'journal', journalId: parts[1] };
  if (parts.length === 2 && parts[0] === 'routine') return { kind: 'routine', routineId: parts[1] };
  if (parts.length === 2 && parts[0] === 'circle') return { kind: 'circle', circleId: parts[1] };
  return { kind: 'unknown', path };
}
