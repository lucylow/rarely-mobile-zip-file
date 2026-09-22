export interface AuthProviderConfig {
  apple: boolean;
  email: boolean;
  google: boolean;
  github: boolean;
}

export function requiresAppleWhenThirdPartyAuthEnabled(config: AuthProviderConfig): boolean {
  return config.google || config.github;
}

export function validateProviderPolicy(config: AuthProviderConfig): string[] {
  const issues: string[] = [];
  if (requiresAppleWhenThirdPartyAuthEnabled(config) && !config.apple) {
    issues.push('Apple Sign In should be enabled on iOS when third-party login is offered.');
  }
  if (!config.email && !config.apple && !config.google && !config.github) {
    issues.push('At least one authentication path must be enabled.');
  }
  return issues;
}
