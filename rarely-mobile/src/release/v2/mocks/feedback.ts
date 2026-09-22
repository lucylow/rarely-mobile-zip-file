export interface MockFeedback {
  id: string;
  kind: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["fits", "not-for-me", "saved", "dismissed"] as const;

export const MOCK_FEEDBACK = Array.from({ length: 300 }, (_, index): MockFeedback => ({
  id: `${"feedback"}-${String(index + 1).padStart(4, '0')}`,
  kind: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockFeedback(id: string): MockFeedback | undefined {
  return MOCK_FEEDBACK.find((item) => item.id === id);
}

export function listMockFeedback(filter?: string): MockFeedback[] {
  if (!filter) return MOCK_FEEDBACK.slice();
  return MOCK_FEEDBACK.filter((item) => item.kind === filter);
}
