export interface AiUsageWindow {
  count: number;
  startedAt: number;
  windowMs: number;
  limit: number;
}

export function canUseAi(window: AiUsageWindow, now = Date.now()): boolean {
  if (now - window.startedAt >= window.windowMs) return true;
  return window.count < window.limit;
}

export function recordAiUse(window: AiUsageWindow, now = Date.now()): AiUsageWindow {
  if (now - window.startedAt >= window.windowMs) return { ...window, count: 1, startedAt: now };
  return { ...window, count: window.count + 1 };
}
