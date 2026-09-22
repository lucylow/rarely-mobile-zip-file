export type KillSwitch = { key: string; enabled: boolean; reason: string; changedAt: number };
export function isDisabled(switches: KillSwitch[], key: string): boolean { return switches.some((x) => x.key === key && !x.enabled); }
export function safest<T>(value: T, switches: KillSwitch[], key: string, fallback: T): T { return isDisabled(switches, key) ? fallback : value; }
