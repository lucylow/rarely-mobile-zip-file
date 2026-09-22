export type BuildProfileName = 'development' | 'preview' | 'production';

export interface BuildProfilePolicy {
  name: BuildProfileName;
  developmentClient: boolean;
  distribution: 'internal' | 'store';
  allowMockPurchases: boolean;
  allowDebugMenu: boolean;
  channel: string;
}

export const BUILD_PROFILES: Record<BuildProfileName, BuildProfilePolicy> = {
  development: {
    name: 'development',
    developmentClient: true,
    distribution: 'internal',
    allowMockPurchases: true,
    allowDebugMenu: true,
    channel: 'development',
  },
  preview: {
    name: 'preview',
    developmentClient: false,
    distribution: 'internal',
    allowMockPurchases: true,
    allowDebugMenu: true,
    channel: 'preview',
  },
  production: {
    name: 'production',
    developmentClient: false,
    distribution: 'store',
    allowMockPurchases: false,
    allowDebugMenu: false,
    channel: 'production',
  },
};

export function assertProfileCanShip(profile: BuildProfileName): void {
  const policy = BUILD_PROFILES[profile];
  if (policy.distribution !== 'store') throw new Error('Only the production profile can ship to the App Store.');
  if (policy.allowMockPurchases || policy.allowDebugMenu) throw new Error('Production profile cannot contain mocks or debug menus.');
}
