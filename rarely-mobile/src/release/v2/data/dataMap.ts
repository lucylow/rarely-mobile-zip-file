export interface DataMapEntry { name: string; storage: 'device' | 'server' | 'third-party'; content: string; retention: string; deletion: 'automatic' | 'user' | 'policy'; }
export const DATA_MAP: readonly DataMapEntry[] = [
  { name: 'journal drafts', storage: 'device', content: 'user-created text', retention: 'until deleted or replaced', deletion: 'user' },
  { name: 'journal entries', storage: 'device', content: 'user-created text', retention: 'until user deletion', deletion: 'user' },
  { name: 'preferences', storage: 'device', content: 'explicit settings', retention: 'until reset/deletion', deletion: 'user' },
  { name: 'subscription entitlement', storage: 'third-party', content: 'purchase status', retention: 'billing provider policy', deletion: 'policy' },
  { name: 'community reports', storage: 'server', content: 'moderation records', retention: 'policy-defined', deletion: 'policy' },
];
