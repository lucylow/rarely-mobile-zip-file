export interface ExpoSdkCompatibility { sdk: number; reactNative: string; minimumXcode: string; minimumIos: string; storeReady: boolean; }

export const SUPPORTED = [
  { sdk: 54, reactNative: '0.81', minimumXcode: '16.1', minimumIos: '15.1', storeReady: false },
  { sdk: 55, reactNative: '0.83', minimumXcode: '26.2', minimumIos: '15.1', storeReady: true },
  { sdk: 56, reactNative: '0.85', minimumXcode: '26.4', minimumIos: '16.4', storeReady: true },
  { sdk: 57, reactNative: '0.86', minimumXcode: '26.4', minimumIos: '16.4', storeReady: true },
] as const;

export function compatibilityForSdk(sdk: number): ExpoSdkCompatibility | undefined { return SUPPORTED.find((item) => item.sdk === sdk); }
export function assertAppleUploadCompatible(sdk: number): void { const entry = compatibilityForSdk(sdk); if (!entry) throw new Error(`Unknown Expo SDK ${sdk}`); if (!entry.storeReady) throw new Error(`Expo SDK ${sdk} is blocked by the current iOS store-build policy; upgrade to SDK 55+ and validate against current Expo/Apple requirements.`); }
