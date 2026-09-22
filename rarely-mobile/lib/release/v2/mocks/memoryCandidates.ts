export interface MockMemoryCandidate {
  id: string;
  kind: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["interest", "routine", "preference", "timing", "style"] as const;

export const MOCK_MEMORYCANDIDATES = Array.from({ length: 300 }, (_, index): MockMemoryCandidate => ({
  id: `${"memoryCandidates"}-${String(index + 1).padStart(4, '0')}`,
  kind: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockMemoryCandidate(id: string): MockMemoryCandidate | undefined {
  return MOCK_MEMORYCANDIDATES.find((item) => item.id === id);
}

export function listMockMemoryCandidate(filter?: string): MockMemoryCandidate[] {
  if (!filter) return MOCK_MEMORYCANDIDATES.slice();
  return MOCK_MEMORYCANDIDATES.filter((item) => item.kind === filter);
}
