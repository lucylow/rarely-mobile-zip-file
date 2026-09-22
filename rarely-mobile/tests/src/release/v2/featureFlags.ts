export interface FeatureFlags { premiumPaywall: boolean; community: boolean; rareAi: boolean; photoPrompts: boolean; audioCapture: boolean; sync: boolean; }
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = { premiumPaywall: true, community: true, rareAi: true, photoPrompts: true, audioCapture: false, sync: true };
export function safeFlags(input: Partial<FeatureFlags>): FeatureFlags { return { ...DEFAULT_FEATURE_FLAGS, ...input, }; }
