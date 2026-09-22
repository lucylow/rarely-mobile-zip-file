export interface RevenueCatConfig {
  entitlementId: string;
  iosApiKey: string;
  observerMode: boolean;
}

export function validateRevenueCatConfig(config: RevenueCatConfig, production: boolean): string[] {
  const errors: string[] = [];
  if (!config.entitlementId.trim()) errors.push('entitlement-id-missing');
  if (!config.iosApiKey.startsWith('appl_')) errors.push('ios-api-key-format');
  if (production && config.observerMode) errors.push('observer-mode-not-allowed-for-shipping-policy');
  return errors;
}

export function shouldUseRevenueCat(environment: 'development' | 'preview' | 'production', forceNative = false): boolean {
  return environment !== 'development' || forceNative;
}
