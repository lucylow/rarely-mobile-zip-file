export const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function canManageSubscription(source: 'storekit' | 'server' | 'unknown'): boolean {
  return source !== 'unknown';
}

export function subscriptionManagementMessage(): string {
  return 'Manage or cancel your subscription in Apple Account subscriptions. Your access continues through the current billing period.';
}
