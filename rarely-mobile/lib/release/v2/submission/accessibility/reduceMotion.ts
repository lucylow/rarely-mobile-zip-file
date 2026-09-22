export type MotionPolicy = { reduceMotion: boolean; durationScale: number; haptics: 'full'|'reduced'|'off' };
export function policy(reduceMotion: boolean): MotionPolicy { return reduceMotion ? { reduceMotion: true, durationScale: 0, haptics: 'reduced' } : { reduceMotion: false, durationScale: 1, haptics: 'full' }; }
export function duration(baseMs: number, p: MotionPolicy): number { return Math.round(baseMs * p.durationScale); }
export function shouldAnimate(p: MotionPolicy): boolean { return !p.reduceMotion; }
