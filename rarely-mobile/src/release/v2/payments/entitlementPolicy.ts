import { hasPremiumAccess, type EntitlementSnapshot } from './entitlements';
export function featureAllowed(feature: 'premium' | 'free', snapshot: EntitlementSnapshot | undefined, now = Date.now()): boolean { return feature === 'free' || hasPremiumAccess(snapshot, now); }
