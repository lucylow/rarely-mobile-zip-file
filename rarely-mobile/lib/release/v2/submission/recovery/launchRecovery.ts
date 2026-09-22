export type LaunchMarker = { version: string; startedAt: number; completedAt?: number; attempt: number; fatal?: string };
export function markStart(previous: LaunchMarker | null, version: string, now = Date.now()): LaunchMarker { return { version, startedAt: now, attempt: (previous?.attempt ?? 0) + 1 }; }
export function markCompleted(marker: LaunchMarker, now = Date.now()): LaunchMarker { return { ...marker, completedAt: now }; }
export function crashedDuringLaunch(marker: LaunchMarker): boolean { return !marker.completedAt; }
export function shouldSafeMode(marker: LaunchMarker, now = Date.now(), thresholdMs = 45_000): boolean { return crashedDuringLaunch(marker) && now - marker.startedAt <= thresholdMs && marker.attempt >= 2; }
export function safeModeReasons(marker: LaunchMarker): string[] { return shouldSafeMode(marker) ? ['repeated-startup-failure','disable-nonessential-effects','show-recovery-ui'] : []; }
