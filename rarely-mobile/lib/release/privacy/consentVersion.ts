export const CONSENT_VERSION = 2; export function needsConsentReacceptance(savedVersion: number | undefined): boolean { return savedVersion !== CONSENT_VERSION; }
