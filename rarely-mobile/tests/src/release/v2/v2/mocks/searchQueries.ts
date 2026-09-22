export interface MockSearchQuery {
  id: string;
  kind: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["journal", "moment", "circle", "routine", "global"] as const;

export const MOCK_SEARCHQUERIES = Array.from({ length: 300 }, (_, index): MockSearchQuery => ({
  id: `${"searchQueries"}-${String(index + 1).padStart(4, '0')}`,
  kind: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockSearchQuery(id: string): MockSearchQuery | undefined {
  return MOCK_SEARCHQUERIES.find((item) => item.id === id);
}

export function listMockSearchQuery(filter?: string): MockSearchQuery[] {
  if (!filter) return MOCK_SEARCHQUERIES.slice();
  return MOCK_SEARCHQUERIES.filter((item) => item.kind === filter);
}
