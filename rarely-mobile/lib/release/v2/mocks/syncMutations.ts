export interface MockSyncMutation {
  id: string;
  kind: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["create", "update", "delete", "reaction", "join"] as const;

export const MOCK_SYNCMUTATIONS = Array.from({ length: 300 }, (_, index): MockSyncMutation => ({
  id: `${"syncMutations"}-${String(index + 1).padStart(4, '0')}`,
  kind: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockSyncMutation(id: string): MockSyncMutation | undefined {
  return MOCK_SYNCMUTATIONS.find((item) => item.id === id);
}

export function listMockSyncMutation(filter?: string): MockSyncMutation[] {
  if (!filter) return MOCK_SYNCMUTATIONS.slice();
  return MOCK_SYNCMUTATIONS.filter((item) => item.kind === filter);
}
