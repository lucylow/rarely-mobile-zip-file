export type RuntimeConfig = { apiBaseUrl: string; revenueCatIosKey: string; environment: 'development'|'preview'|'production'; bundleId: string; scheme: string; sentryDsn?: string };
export function validateRuntimeConfig(config: RuntimeConfig): string[] {
  const errors: string[] = [];
  if (!/^https:\/\//.test(config.apiBaseUrl)) errors.push('api-must-use-https');
  if (!config.revenueCatIosKey.trim()) errors.push('revenuecat-key-required');
  if (!/^com\.[a-z0-9.-]+$/.test(config.bundleId)) errors.push('bundle-id-invalid');
  if (!config.scheme.trim()) errors.push('scheme-required');
  if (config.environment === 'production' && config.sentryDsn && !/^https:\/\//.test(config.sentryDsn)) errors.push('sentry-dsn-invalid');
  return errors;
}
export function isProduction(config: RuntimeConfig): boolean { return config.environment === 'production'; }
