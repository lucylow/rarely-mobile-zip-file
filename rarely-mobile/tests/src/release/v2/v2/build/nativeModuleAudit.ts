export interface NativeDependency { name: string; version: string; hasConfigPlugin: boolean; privacyManifestRequired: boolean; notes: string; }
export function auditNativeDependencies(deps: readonly NativeDependency[]): { blockers: string[]; warnings: string[] } {
  const blockers: string[] = [];
  const warnings: string[] = [];
  for (const dep of deps) {
    if (!dep.hasConfigPlugin) warnings.push(`${dep.name}: verify native configuration manually`);
    if (dep.privacyManifestRequired) warnings.push(`${dep.name}: verify bundled privacy manifest and required-reason declarations`);
    if (!dep.version) blockers.push(`${dep.name}: version missing`);
  }
  return { blockers, warnings };
}
