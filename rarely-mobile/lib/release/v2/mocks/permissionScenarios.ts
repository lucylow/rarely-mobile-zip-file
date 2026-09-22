export interface MockPermissionScenario {
  id: string;
  permission: string;
  index: number;
  createdAt: number;
  note: string;
}

const VALUES = ["notifications", "photos", "microphone", "tracking"] as const;

export const MOCK_PERMISSIONSCENARIOS = Array.from({ length: 300 }, (_, index): MockPermissionScenario => ({
  id: `${"permissionScenarios"}-${String(index + 1).padStart(4, '0')}`,
  permission: VALUES[index % VALUES.length],
  index,
  createdAt: Date.UTC(2026, 0, 1) + index * 86_400_000,
  note: `Deterministic development fixture ${index + 1}.`,
}));

export function findMockPermissionScenario(id: string): MockPermissionScenario | undefined {
  return MOCK_PERMISSIONSCENARIOS.find((item) => item.id === id);
}

export function listMockPermissionScenario(filter?: string): MockPermissionScenario[] {
  if (!filter) return MOCK_PERMISSIONSCENARIOS.slice();
  return MOCK_PERMISSIONSCENARIOS.filter((item) => item.permission === filter);
}
