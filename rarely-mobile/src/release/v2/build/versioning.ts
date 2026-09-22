export interface VersionState {
  version: string;
  buildNumber: number;
}

export function parseVersion(version: string): [number, number, number] {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid version: ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  for (let i = 0; i < 3; i += 1) {
    if (va[i] !== vb[i]) return va[i] > vb[i] ? 1 : -1;
  }
  return 0;
}

export function nextBuild(current: VersionState): VersionState {
  return { version: current.version, buildNumber: current.buildNumber + 1 };
}

export function assertBuildMonotonic(previous: VersionState, next: VersionState): void {
  if (compareVersions(next.version, previous.version) < 0) throw new Error('Marketing version moved backwards.');
  if (compareVersions(next.version, previous.version) === 0 && next.buildNumber <= previous.buildNumber) {
    throw new Error('Build number must increase for the same marketing version.');
  }
}
