export interface HealthDependency { id: string; check(): Promise<void>; }
export interface HealthReport { status: "ok" | "degraded"; checks: Record<string, "ok" | "failed">; }

export async function healthReport(dependencies: HealthDependency[]): Promise<HealthReport> {
  const checks: Record<string, "ok" | "failed"> = {};
  for (const dependency of dependencies) {
    try { await dependency.check(); checks[dependency.id] = "ok"; }
    catch { checks[dependency.id] = "failed"; }
  }
  return { status: Object.values(checks).includes("failed") ? "degraded" : "ok", checks };
}
