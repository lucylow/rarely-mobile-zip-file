export interface StartupSnapshot {
  appVersion: string;
  buildNumber: string;
  environment: string;
  coldStart: boolean;
  durationMs: number;
  storageRecovered: boolean;
  sessionRestored: boolean;
  firstRoute: string;
}

export function makeStartupSnapshot(input: Omit<StartupSnapshot, 'durationMs'> & { startedAt: number; endedAt: number }): StartupSnapshot {
  return {
    appVersion: input.appVersion,
    buildNumber: input.buildNumber,
    environment: input.environment,
    coldStart: input.coldStart,
    durationMs: Math.max(0, input.endedAt - input.startedAt),
    storageRecovered: input.storageRecovered,
    sessionRestored: input.sessionRestored,
    firstRoute: input.firstRoute,
  };
}
