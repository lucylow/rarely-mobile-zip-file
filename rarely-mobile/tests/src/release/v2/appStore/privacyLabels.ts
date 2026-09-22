export type DataType = 'contactInfo' | 'userContent' | 'identifiers' | 'usageData' | 'diagnostics' | 'purchases';
export type Purpose = 'appFunctionality' | 'analytics' | 'personalization' | 'accountManagement';
export interface PrivacyDataType { type: DataType; linkedToUser: boolean; tracking: boolean; purposes: Purpose[]; source: 'app' | 'third-party'; }

export const DEFAULT_PRIVACY_INVENTORY: readonly PrivacyDataType[] = [
  { type: 'contactInfo', linkedToUser: true, tracking: false, purposes: ['accountManagement', 'appFunctionality'], source: 'app' },
  { type: 'userContent', linkedToUser: true, tracking: false, purposes: ['appFunctionality', 'personalization'], source: 'app' },
  { type: 'identifiers', linkedToUser: true, tracking: false, purposes: ['accountManagement'], source: 'app' },
  { type: 'usageData', linkedToUser: false, tracking: false, purposes: ['analytics', 'appFunctionality'], source: 'app' },
  { type: 'diagnostics', linkedToUser: false, tracking: false, purposes: ['appFunctionality'], source: 'third-party' },
  { type: 'purchases', linkedToUser: true, tracking: false, purposes: ['accountManagement', 'appFunctionality'], source: 'third-party' },
];

export function privacySummary(inventory: readonly PrivacyDataType[]): string[] { return inventory.map((item) => `${item.type}:${item.source}:tracking=${item.tracking}`); }
