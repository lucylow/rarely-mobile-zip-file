import type { ReleaseCheck } from '../types';

export const APP_STORE = {
  name: 'RARELY — Be More You',
  subtitle: 'Small moments. More you.',
  primaryCategory: 'Lifestyle',
  secondaryCategory: 'Health & Fitness',
  privacyPolicyUrl: '',
  supportUrl: 'https://example.com/support',
  marketingUrl: 'https://example.com',
  copyright: '© 2026 RARELY',
} as const;

export const IAP_PRODUCTS = {
  monthly: 'rarely.premium.monthly',
  annual: 'rarely.premium.annual',
} as const;

export const APP_REVIEW = {
  reviewNotes: [
    'RARELY is a personal creative app built around mood check-ins, journaling, routines, and small creative moments.',
    'All premium digital features are unlocked through Apple In-App Purchase in production builds.',
    'The app includes an in-app account deletion path under Profile > Settings > Account > Delete Account.',
    'Restore Purchases is available from the Membership screen.',
    'Network failures degrade to local content where possible; no network is required for private journal drafting.',
  ],
  demoAccountRequired: false,
} as const;

export function catalogChecks(options: {
  configuredPrivacyUrl: string;
  configuredSupportUrl: string;
  configuredProducts: string[];
}): ReleaseCheck[] {
  return [
    {
      id: 'metadata.privacy-url',
      title: 'Privacy policy URL',
      severity: 'error',
      passed: /^https:\/\//.test(options.configuredPrivacyUrl),
      detail: options.configuredPrivacyUrl,
      fix: 'Set a public HTTPS privacy policy URL before App Store submission.',
    },
    {
      id: 'metadata.support-url',
      title: 'Support URL',
      severity: 'error',
      passed: /^https:\/\//.test(options.configuredSupportUrl),
      detail: options.configuredSupportUrl,
      fix: 'Set a public HTTPS support URL before submission.',
    },
    {
      id: 'monetization.products',
      title: 'IAP products',
      severity: 'error',
      passed: options.configuredProducts.includes(IAP_PRODUCTS.monthly) && options.configuredProducts.includes(IAP_PRODUCTS.annual),
      detail: options.configuredProducts.join(', '),
      fix: 'Create matching auto-renewable subscription products in App Store Connect.',
    },
  ];
}
