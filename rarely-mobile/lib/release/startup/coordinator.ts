import type { DependencyResult, StartupDependency } from "./dependencies";

export interface StartupReport {
  startedAt: string;
  finishedAt: string;
  degraded: boolean;
  criticalFailure: boolean;
  dependencies: DependencyResult[];
}

export async function runStartup(dependencies: StartupDependency[], clock = () => Date.now()): Promise<StartupReport> {
  const started = clock();
  const results: DependencyResult[] = [];
  for (const dependency of dependencies) {
    const before = clock();
    try {
      await dependency.run();
      results.push({ id: dependency.id, status: "ready", durationMs: Math.max(0, clock() - before) });
    } catch (error) {
      results.push({ id: dependency.id, status: dependency.critical ? "failed" : "degraded", durationMs: Math.max(0, clock() - before), detail: error instanceof Error ? error.message : String(error) });
    }
  }
  return {
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(clock()).toISOString(),
    degraded: results.some((result) => result.status === "degraded"),
    criticalFailure: results.some((result) => result.status === "failed"),
    dependencies: results,
  };
}
