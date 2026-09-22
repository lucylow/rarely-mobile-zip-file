export interface ScheduledNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  fireAt: number;
  data?: Record<string, string>;
}

export function buildRoutineReminder(input: { routineId: string; title: string; fireAt: number }): ScheduledNotification {
  return {
    id: `routine:${input.routineId}:${input.fireAt}`,
    kind: 'routine',
    title: input.title,
    body: 'A small ritual is waiting for you.',
    fireAt: input.fireAt,
    data: { route: `/routine/${encodeURIComponent(input.routineId)}` },
  };
}

export function dedupeNotifications(items: ScheduledNotification[]): ScheduledNotification[] {
  const map = new Map<string, ScheduledNotification>();
  for (const item of items) map.set(item.id, item);
  return [...map.values()].sort((a, b) => a.fireAt - b.fireAt);
}
