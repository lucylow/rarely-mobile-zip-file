export type Artifact = { path: string; bytes: number; sha256: string; platform: 'ios'|'android'|'web'; channel: 'dev'|'preview'|'production' };
export function validateArtifact(artifact: Artifact): string[] {
  const errors: string[] = [];
  if (!artifact.path.trim()) errors.push('path-required');
  if (artifact.bytes <= 0) errors.push('empty-artifact');
  if (!/^[a-f0-9]{64}$/.test(artifact.sha256)) errors.push('sha256-invalid');
  if (artifact.platform === 'ios' && !artifact.path.endsWith('.ipa')) errors.push('ios-ipa-required');
  if (artifact.channel === 'production' && !/production|release/i.test(artifact.path)) errors.push('production-name-required');
  return errors;
}
export function indexArtifacts(artifacts: Artifact[]): Map<string, Artifact> {
  return new Map(artifacts.map((artifact) => [artifact.sha256, artifact]));
}
