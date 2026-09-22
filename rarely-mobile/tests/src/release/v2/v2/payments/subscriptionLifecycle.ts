export type SubscriptionStatus = 'trial' | 'active' | 'grace' | 'billing-retry' | 'paused' | 'expired' | 'revoked';
export interface SubscriptionState { status: SubscriptionStatus; productId: string; expiresAt?: number; autoRenew: boolean; updatedAt: number; }

export function accessFromSubscription(state: SubscriptionState, now = Date.now()): boolean {
  if (state.status === 'expired' || state.status === 'revoked') return false;
  if (state.expiresAt != null && state.expiresAt <= now) return false;
  return true;
}

export function subscriptionLabel(state: SubscriptionState): string {
  switch (state.status) {
    case 'trial': return 'Trial';
    case 'active': return state.autoRenew ? 'Active — renews automatically' : 'Active — renewal is off';
    case 'grace': return 'Active — billing needs attention';
    case 'billing-retry': return 'Billing retry in progress';
    case 'paused': return 'Paused';
    case 'expired': return 'Expired';
    case 'revoked': return 'Revoked';
  }
}
