export type RecoveryAction = 'retry'|'reload'|'sign-in'|'restore-purchase'|'open-settings'|'continue-offline';
export function actionsFor(code: string): RecoveryAction[] { const table: Record<string,RecoveryAction[]> = { offline:['continue-offline','retry'], timeout:['retry'], unauthorized:['sign-in'], purchase_pending:['restore-purchase','retry'], permission_denied:['open-settings'], startup_failed:['reload'] }; return table[code] ?? ['retry']; }
export function primaryAction(code: string): RecoveryAction { return actionsFor(code)[0] ?? 'retry'; }
