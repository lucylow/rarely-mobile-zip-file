export type BetaBuild = { version: string; buildNumber: number; processing: 'waiting'|'processing'|'valid'|'invalid'; groups: string[] };
export function testFlightReady(build: BetaBuild): boolean { return build.processing === 'valid' && build.groups.length > 0; }
export function validateBetaBuild(build: BetaBuild): string[] {
  const errors: string[] = [];
  if (!/^\d+\.\d+\.\d+$/.test(build.version)) errors.push('version-invalid');
  if (build.buildNumber <= 0) errors.push('build-number-invalid');
  if (build.processing === 'invalid') errors.push('binary-invalid');
  if (!build.groups.length) errors.push('no-tester-group');
  return errors;
}
