export type QuietHours = { start: number; end: number };
export type Candidate = { id: string; score: number; eligibleFrom: number; expiresAt?: number };
export function withinQuietHours(hour: number, quiet: QuietHours): boolean { return quiet.start <= quiet.end ? hour >= quiet.start && hour < quiet.end : hour >= quiet.start || hour < quiet.end; }
export function chooseNext(candidates: Candidate[], now: number, quiet: QuietHours, hour: number): Candidate | null {
  if (withinQuietHours(hour, quiet)) return null;
  return candidates.filter((x) => x.eligibleFrom <= now && (x.expiresAt === undefined || x.expiresAt > now)).sort((a,b) => b.score - a.score)[0] ?? null;
}
export function dedupeSchedules(ids: string[]): string[] { return [...new Set(ids)]; }
