import type { EnvironmentName, ReleaseEnvironment } from '../types';

const REQUIRED = ['RARELY_API_URL', 'RARELY_IOS_BUNDLE_ID'] as const;

export function getEnvironment(name: EnvironmentName, values: Record<string, string | undefined>): ReleaseEnvironment {
  const apiBaseUrl = values.RARELY_API_URL ?? 'https://api.example.com';
  const bundleIdentifier = values.RARELY_IOS_BUNDLE_ID ?? 'com.app.rarelymobile';
  const appScheme = values.RARELY_APP_SCHEME ?? 'rarely';
  return {
    name,
    apiBaseUrl,
    appScheme,
    bundleIdentifier,
    storeProductIds: ['rarely.premium.monthly', 'rarely.premium.annual'],
    mockPurchases: name !== 'production',
    mockNetwork: name === 'development',
    debugMenu: name !== 'production',
  };
}

export function missingProductionEnvironment(values: Record<string, string | undefined>): string[] {
  return REQUIRED.filter((key) => !values[key]);
}

export function isSafeProductionEnvironment(env: ReleaseEnvironment): boolean {
  return env.name === 'production'
    && env.mockPurchases === false
    && env.mockNetwork === false
    && env.debugMenu === false
    && /^https:\/\//.test(env.apiBaseUrl)
    && /^[a-zA-Z][a-zA-Z0-9.-]+$/.test(env.bundleIdentifier);
}
