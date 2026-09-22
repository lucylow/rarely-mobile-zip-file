export type HealthSnapshot = { version: string; database: 'ok'|'degraded'|'down'; cache: 'ok'|'degraded'|'down'; ai: 'ok'|'degraded'|'down'; payments: 'ok'|'degraded'|'down'; checkedAt: number };
export function overall(snapshot: HealthSnapshot): 'ok'|'degraded'|'down' {
  const values = [snapshot.database, snapshot.cache, snapshot.ai, snapshot.payments];
  if (values.includes('down')) return 'down'; if (values.includes('degraded')) return 'degraded'; return 'ok';
}
export function publicHealth(snapshot: HealthSnapshot): Pick<HealthSnapshot,'version'|'checkedAt'> & { status: string } { return { version: snapshot.version, checkedAt: snapshot.checkedAt, status: overall(snapshot) }; }
