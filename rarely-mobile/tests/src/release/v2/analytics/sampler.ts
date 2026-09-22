export function sampleEvent(rate: number, random = Math.random): boolean { if (rate >= 1) return true; if (rate <= 0) return false; return random() < rate; }
