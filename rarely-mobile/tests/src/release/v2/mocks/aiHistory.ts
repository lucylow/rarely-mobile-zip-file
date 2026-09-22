export interface MockAiHistory {
  id: string;
  mode: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["spark", "reflect", "play"] as const;

export const MOCK_AIHISTORY = Array.from({ length: 300 }, (_, index): MockAiHistory => ({
  id: `${"aiHistory"}-${String(index + 1).padStart(4, '0')}`,
  mode: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockAiHistory(id: string): MockAiHistory | undefined {
  return MOCK_AIHISTORY.find((item) => item.id === id);
}

export function listMockAiHistory(filter?: string): MockAiHistory[] {
  if (!filter) return MOCK_AIHISTORY.slice();
  return MOCK_AIHISTORY.filter((item) => item.mode === filter);
}
