import type { ReleaseCheck } from '../types';
import { isSafeProductionEnvironment } from './environment';
import { BUILD_PROFILES, type BuildProfileName } from './profilePolicy';

export interface ConfigSnapshot {
  environment: ReturnType<typeof import('./environment').getEnvironment>;
  profile: BuildProfileName;
  scheme: string;
  bundleIdentifier: string;
  version: string;
  buildNumber: string;
  hasPrivacyManifest: boolean;
  hasAssociatedDomains: boolean;
  hasAppleSignInCapability: boolean;
}

export function validateBuildConfig(snapshot: ConfigSnapshot): ReleaseCheck[] {
  const checks: ReleaseCheck[] = [];
  const add = (id: string, title: string, passed: boolean, detail: string, fix: string) => checks.push({ id, title, severity: passed ? 'info' : 'error', passed, detail, fix });
  const production = snapshot.profile === 'production';

  add('profile', 'Store build profile', !production || BUILD_PROFILES.production.distribution === 'store', snapshot.profile, 'Use the production EAS profile for App Store builds.');
  add('environment', 'Production-safe environment', !production || isSafeProductionEnvironment(snapshot.environment), snapshot.environment.name, 'Disable mock purchases/network/debug UI in production.');
  add('scheme', 'Deep-link scheme', /^[a-z][a-z0-9+.-]*$/.test(snapshot.scheme), snapshot.scheme, 'Use a stable lowercase URL scheme such as rarely.');
  add('bundle', 'iOS bundle identifier', /^[A-Za-z][A-Za-z0-9.-]+$/.test(snapshot.bundleIdentifier), snapshot.bundleIdentifier, 'Register and configure the production bundle ID.');
  add('version', 'App version', /^\d+\.\d+\.\d+$/.test(snapshot.version), snapshot.version, 'Set a valid three-part marketing version.');
  add('build', 'Build number', /^\d+$/.test(snapshot.buildNumber) && Number(snapshot.buildNumber) > 0, snapshot.buildNumber, 'Set a positive iOS CFBundleVersion.');
  add('privacy-manifest', 'Privacy manifest', !production || snapshot.hasPrivacyManifest, String(snapshot.hasPrivacyManifest), 'Include PrivacyInfo.xcprivacy in the iOS target.');
  add('associated-domains', 'Associated domains', true, snapshot.hasAssociatedDomains ? 'enabled' : 'not used', 'Only enable this when universal links are actually configured.');
  add('apple-signin', 'Apple sign-in capability', true, snapshot.hasAppleSignInCapability ? 'enabled' : 'not used', 'Enable the capability when Sign in with Apple is part of the authentication surface.');
  return checks;
}
