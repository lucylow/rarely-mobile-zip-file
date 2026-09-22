export interface AnalyticsConsent { granted: boolean; updatedAt?: number; }
export function canSendAnalytics(consent: AnalyticsConsent): boolean { return consent.granted === true; }
