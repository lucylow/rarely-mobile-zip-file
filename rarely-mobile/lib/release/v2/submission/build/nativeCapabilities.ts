export type NativeCapability = 'apple-auth'|'push'|'notifications'|'photos'|'camera'|'microphone'|'storekit'|'associated-domains'|'background-fetch';
export type CapabilityManifest = { enabled: NativeCapability[]; reasons: Partial<Record<NativeCapability, string>> };
export function validateCapabilities(manifest: CapabilityManifest): string[] {
  const errors: string[] = [];
  for (const capability of manifest.enabled) {
    if (capability !== 'storekit' && !manifest.reasons[capability]?.trim()) errors.push(`reason-required:${capability}`);
  }
  if (manifest.enabled.includes('apple-auth') && !manifest.enabled.includes('associated-domains') && manifest.reasons['apple-auth']?.includes('web')) errors.push('web-auth-needs-associated-domains-review');
  return errors;
}
export function hasCapability(manifest: CapabilityManifest, capability: NativeCapability): boolean { return manifest.enabled.includes(capability); }
