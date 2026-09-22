export interface MockEntitlement {
  id: string;
  status: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["active", "expired", "grace", "pending"] as const;

export const MOCK_ENTITLEMENTS = Array.from({ length: 300 }, (_, index): MockEntitlement => ({
  id: `${"entitlements"}-${String(index + 1).padStart(4, '0')}`,
  status: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockEntitlement(id: string): MockEntitlement | undefined {
  return MOCK_ENTITLEMENTS.find((item) => item.id === id);
}

export function listMockEntitlement(filter?: string): MockEntitlement[] {
  if (!filter) return MOCK_ENTITLEMENTS.slice();
  return MOCK_ENTITLEMENTS.filter((item) => item.status === filter);
}
