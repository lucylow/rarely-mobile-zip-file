export interface Candidate { id: string; score: number; lastSeenAt?: number; seed: number; }

export function compareCandidates(a: Candidate, b: Candidate): number {
  if (b.score !== a.score) return b.score - a.score;
  const aSeen = a.lastSeenAt ?? Number.POSITIVE_INFINITY;
  const bSeen = b.lastSeenAt ?? Number.POSITIVE_INFINITY;
  if (aSeen !== bSeen) return aSeen - bSeen;
  return a.seed - b.seed;
}

export function rankCandidates(candidates: Candidate[]): Candidate[] { return [...candidates].sort(compareCandidates); }
