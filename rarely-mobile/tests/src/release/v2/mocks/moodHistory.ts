export interface MockMoodHistory {
  id: string;
  mood: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["happy", "stressed", "creative", "tired", "excited", "vibing"] as const;

export const MOCK_MOODHISTORY = Array.from({ length: 300 }, (_, index): MockMoodHistory => ({
  id: `${"moodHistory"}-${String(index + 1).padStart(4, '0')}`,
  mood: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockMoodHistory(id: string): MockMoodHistory | undefined {
  return MOCK_MOODHISTORY.find((item) => item.id === id);
}

export function listMockMoodHistory(filter?: string): MockMoodHistory[] {
  if (!filter) return MOCK_MOODHISTORY.slice();
  return MOCK_MOODHISTORY.filter((item) => item.mood === filter);
}
