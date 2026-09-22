export type PressGuard = { busy: boolean; disabled: boolean; lastPressedAt: number; minGapMs: number };
export function canPress(guard: PressGuard, now = Date.now()): boolean { return !guard.busy && !guard.disabled && now - guard.lastPressedAt >= guard.minGapMs; }
export function pressed(guard: PressGuard, now = Date.now()): PressGuard { return { ...guard, busy: true, lastPressedAt: now }; }
export function released(guard: PressGuard): PressGuard { return { ...guard, busy: false }; }
