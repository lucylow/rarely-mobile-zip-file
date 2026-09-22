export interface MockActivity {
  id: string;
  kind: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["mood-checkin", "moment-start", "moment-complete", "journal-save", "routine-complete", "circle-join"] as const;

export const MOCK_ACTIVITIES = Array.from({ length: 300 }, (_, index): MockActivity => ({
  id: `${"activities"}-${String(index + 1).padStart(4, '0')}`,
  kind: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockActivity(id: string): MockActivity | undefined {
  return MOCK_ACTIVITIES.find((item) => item.id === id);
}

export function listMockActivity(filter?: string): MockActivity[] {
  if (!filter) return MOCK_ACTIVITIES.slice();
  return MOCK_ACTIVITIES.filter((item) => item.kind === filter);
}
