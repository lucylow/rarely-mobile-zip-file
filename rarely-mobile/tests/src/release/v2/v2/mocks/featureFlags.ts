export interface MockFlagState {
  id: string;
  flag: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["premiumPaywall", "community", "rareAi", "photoPrompts", "audioCapture", "sync"] as const;

export const MOCK_FEATUREFLAGS = Array.from({ length: 300 }, (_, index): MockFlagState => ({
  id: `${"featureFlags"}-${String(index + 1).padStart(4, '0')}`,
  flag: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockFlagState(id: string): MockFlagState | undefined {
  return MOCK_FEATUREFLAGS.find((item) => item.id === id);
}

export function listMockFlagState(filter?: string): MockFlagState[] {
  if (!filter) return MOCK_FEATUREFLAGS.slice();
  return MOCK_FEATUREFLAGS.filter((item) => item.flag === filter);
}
