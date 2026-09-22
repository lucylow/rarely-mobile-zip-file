export interface CredentialCheck { name: string; present: boolean; source: 'environment' | 'EAS' | 'Apple'; }
export function credentialReport(values: Record<string, string | undefined>): CredentialCheck[] {
  return [
    { name: 'EXPO_TOKEN', present: !!values.EXPO_TOKEN, source: 'EAS' },
    { name: 'EXPO_ASC_KEY_ID', present: !!values.EXPO_ASC_KEY_ID, source: 'Apple' },
    { name: 'EXPO_ASC_ISSUER_ID', present: !!values.EXPO_ASC_ISSUER_ID, source: 'Apple' },
    { name: 'RARELY_REVENUECAT_APPLE_API_KEY', present: !!values.RARELY_REVENUECAT_APPLE_API_KEY, source: 'environment' },
  ];
}
export function credentialsReady(values: Record<string, string | undefined>): boolean { return credentialReport(values).every((item) => item.present); }
