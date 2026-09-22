export function newSessionId(now = Date.now(), randomFn: () => number = Math.random): string {
  return `s_${now.toString(36)}_${Math.floor(randomFn() * 1e8).toString(36)}`;
}
