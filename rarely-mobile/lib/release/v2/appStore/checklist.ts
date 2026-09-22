import type { ReleaseCheck } from '../types';
import { APP_STORE } from './catalog';

export interface AppStoreInputs {
  bundleIdentifier: string;
  version: string;
  buildNumber: string;
  privacyUrl: string;
  supportUrl: string;
  termsUrl?: string;
  accountCreation: boolean;
  inAppPurchases: boolean;
  signInProviders: string[];
  hasAppleSignIn: boolean;
  hasDeleteAccount: boolean;
  hasRestorePurchases: boolean;
  hasStoreKitProducts: boolean;
  hasPrivacyManifest: boolean;
  hasAppPrivacyAnswers: boolean;
  exportComplianceConfigured: boolean;
}

export function runAppStoreChecklist(input: AppStoreInputs): ReleaseCheck[] {
  const checks: ReleaseCheck[] = [];
  const add = (id: string, title: string, passed: boolean, detail: string, fix?: string) =>
    checks.push({ id, title, severity: passed ? 'info' : 'error', passed, detail, fix });

  add('bundle-id', 'Bundle identifier', /^[a-zA-Z][a-zA-Z0-9.-]+$/.test(input.bundleIdentifier), input.bundleIdentifier, 'Replace the placeholder bundle ID with the registered Apple Bundle ID.');
  add('version', 'Marketing version', /^\d+\.\d+\.\d+$/.test(input.version), input.version, 'Use a three-part version such as 1.0.0.');
  add('build', 'Build number', /^\d+$/.test(input.buildNumber) && Number(input.buildNumber) > 0, input.buildNumber, 'Increment the iOS build number for every uploaded build.');
  add('privacy-url', 'Privacy policy URL', /^https:\/\//.test(input.privacyUrl), input.privacyUrl, 'Provide the public privacy policy URL in App Store Connect.');
  add('support-url', 'Support URL', /^https:\/\//.test(input.supportUrl), input.supportUrl, 'Provide a public support URL.');
  if (input.termsUrl) add('terms-url', 'Terms URL', /^https:\/\//.test(input.termsUrl), input.termsUrl, 'Provide a public terms URL if shown in the app.');
  if (input.accountCreation) add('delete-account', 'Account deletion', input.hasDeleteAccount, 'In-app account deletion path', 'Add a direct in-app account deletion flow.');
  if (input.inAppPurchases) {
    add('restore-purchases', 'Restore Purchases', input.hasRestorePurchases, 'Membership restore path', 'Add a clearly discoverable Restore Purchases action.');
    add('iap-products', 'StoreKit products', input.hasStoreKitProducts, 'Production product catalog', 'Configure matching App Store Connect subscription product IDs.');
  }
  if (input.signInProviders.some((p) => p !== 'apple')) add('apple-sign-in', 'Sign in with Apple', input.hasAppleSignIn, input.signInProviders.join(', '), 'Enable Sign in with Apple when third-party login providers are offered on iOS.');
  add('privacy-manifest', 'Privacy manifest', input.hasPrivacyManifest, 'PrivacyInfo.xcprivacy included', 'Add PrivacyInfo.xcprivacy and required reasons declarations.');
  add('app-privacy', 'App Privacy answers', input.hasAppPrivacyAnswers, 'App Store Connect data declarations', 'Complete App Privacy in App Store Connect.');
  add('export-compliance', 'Export compliance', input.exportComplianceConfigured, 'Encryption declaration', 'Answer export compliance in App Store Connect or app configuration.');

  return checks;
}

export function appStoreDefaults(): AppStoreInputs {
  return {
    bundleIdentifier: 'com.app.rarelymobile',
    version: '1.0.0',
    buildNumber: '1',
    privacyUrl: APP_STORE.privacyPolicyUrl,
    supportUrl: APP_STORE.supportUrl,
    termsUrl: 'https://example.com/terms',
    accountCreation: true,
    inAppPurchases: true,
    signInProviders: [],
    hasAppleSignIn: false,
    hasDeleteAccount: true,
    hasRestorePurchases: true,
    hasStoreKitProducts: true,
    hasPrivacyManifest: true,
    hasAppPrivacyAnswers: false,
    exportComplianceConfigured: true,
  };
}
