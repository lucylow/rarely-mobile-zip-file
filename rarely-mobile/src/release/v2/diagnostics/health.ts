export interface HealthCheck {
  id: string;
  run(): Promise<{ ok: boolean; detail: string }>;
}

export interface HealthReport {
  generatedAt: string;
  checks: Array<{ id: string; ok: boolean; detail: string }>;
  ok: boolean;
}

export async function runHealthChecks(checks: HealthCheck[]): Promise<HealthReport> {
  const results = [] as HealthReport['checks'];
  for (const check of checks) {
    try {
      results.push({ id: check.id, ...(await check.run()) });
    } catch (error) {
      results.push({ id: check.id, ok: false, detail: error instanceof Error ? error.message : 'health-check-failed' });
    }
  }
  return { generatedAt: new Date().toISOString(), checks: results, ok: results.every((item) => item.ok) };
}
