export interface Clock { now(): number; sleep(ms: number): Promise<void>; }
export const realClock: Clock = { now: () => Date.now(), sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)) };
export function fixedClock(start: number): Clock { let current = start; return { now: () => current, sleep: async (ms) => { current += ms; } }; }
