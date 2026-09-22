export type SessionPolicy = { consent: boolean; appState: 'active'|'background'|'inactive'; anonymousId?: string; sessionId?: string };
export function canRecord(policy: SessionPolicy): boolean { return policy.consent && policy.appState === 'active'; }
export function ensureSession(policy: SessionPolicy, factory: () => string): SessionPolicy { return policy.sessionId ? policy : { ...policy, sessionId: factory() }; }
export function endSession(policy: SessionPolicy): SessionPolicy { return { ...policy, sessionId: undefined }; }
