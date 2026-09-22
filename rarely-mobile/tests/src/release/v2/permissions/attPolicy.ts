export interface AttPolicy { enabled: boolean; userOptedIn: boolean; shareWithAdPartners: boolean; }
export function trackingAllowed(policy: AttPolicy): boolean { return policy.enabled && policy.userOptedIn && policy.shareWithAdPartners; }
export function assertNoTrackingWithoutConsent(policy: AttPolicy): void { if (policy.shareWithAdPartners && !policy.userOptedIn) throw new Error('tracking-consent-missing'); }
