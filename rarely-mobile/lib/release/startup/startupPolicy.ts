import type { StartupReport } from "./coordinator";

export function canRenderApp(report: StartupReport): boolean {
  return !report.criticalFailure;
}

export function bannerForStartup(report: StartupReport): string | undefined {
  if (report.criticalFailure) return "RARELY could not finish starting. Retry or relaunch the app.";
  if (report.degraded) return "A few optional features are offline. Your local moments are still available.";
  return undefined;
}
