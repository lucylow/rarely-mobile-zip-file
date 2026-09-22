import type { EntitlementSnapshot } from './entitlements';

export interface RestoreResult {
  status: 'active' | 'none' | 'failed';
  entitlements?: EntitlementSnapshot;
  userMessage: string;
}

export function interpretRestoreResult(snapshot: EntitlementSnapshot | undefined, error?: unknown, now = Date.now()): RestoreResult {
  if (error) return { status: 'failed', userMessage: 'We could not check your purchases right now. Please try again.' };
  if (!snapshot || !snapshot.premium.active || (snapshot.premium.expiresAt != null && snapshot.premium.expiresAt <= now)) {
    return { status: 'none', userMessage: 'No active RARELY membership was found for this Apple account.' };
  }
  return { status: 'active', entitlements: snapshot, userMessage: 'Your RARELY membership has been restored.' };
}
