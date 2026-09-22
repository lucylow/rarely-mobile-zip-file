export interface ConsentState {
  aiCreative: boolean;
  personalizedNotifications: boolean;
  optionalAnalytics: boolean;
  cloudSync: boolean;
}

export const DEFAULT_CONSENT: ConsentState = {
  aiCreative: false,
  personalizedNotifications: false,
  optionalAnalytics: false,
  cloudSync: false,
};

export function requiresAiConsent(state: ConsentState): boolean { return !state.aiCreative; }
export function canUploadPrivateContent(state: ConsentState): boolean { return state.cloudSync; }
