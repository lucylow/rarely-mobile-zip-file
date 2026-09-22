export type ErrorEvent = { code: string; message: string; route?: string; operation?: string; build?: string };
export function fingerprint(error: ErrorEvent): string { return [error.code, error.route ?? '-', error.operation ?? '-', error.build ?? '-'].join('|').toLowerCase(); }
export function dedupe(events: ErrorEvent[]): ErrorEvent[] { const seen = new Set<string>(); return events.filter((e) => { const key = fingerprint(e); if (seen.has(key)) return false; seen.add(key); return true; }); }
