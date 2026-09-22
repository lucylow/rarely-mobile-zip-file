import type { NotificationKind } from "./types";

export interface NotificationSchedule {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  fireAt: Date;
  data: Record<string, string>;
}

export interface NotificationPermissionAdapter {
  request(): Promise<boolean>;
}

export interface NotificationSchedulerAdapter {
  cancelAll(): Promise<void>;
  schedule(input: { title: string; body: string; fireAt: Date; data: Record<string, string> }): Promise<string>;
}

export interface NotificationSettings {
  enabled: boolean;
  quietHours: { start: string; end: string };
  dailyBriefHour: number;
  dailyBriefMinute: number;
}

export class NotificationPlanner {
  constructor(private readonly settings: NotificationSettings) {}

  buildDaily(date: Date, theme: string): NotificationSchedule | null {
    if (!this.settings.enabled) return null;
    const fireAt = atLocalTime(date, this.settings.dailyBriefHour, this.settings.dailyBriefMinute);
    if (isInQuietHours(fireAt, this.settings.quietHours)) return null;
    return {
      id: `daily:${fireAt.toISOString().slice(0, 10)}`,
      kind: "daily-brief",
      title: "A little room for you",
      body: theme,
      fireAt,
      data: { route: "/upgrade-hub", kind: "daily-brief" },
    };
  }

  buildRitual(date: Date, ritualId: string, name: string, hour: number, minute: number): NotificationSchedule | null {
    if (!this.settings.enabled) return null;
    const fireAt = atLocalTime(date, hour, minute);
    if (isInQuietHours(fireAt, this.settings.quietHours)) return null;
    return {
      id: `ritual:${fireAt.toISOString().slice(0, 10)}:${ritualId}`,
      kind: "ritual",
      title: name,
      body: "Five or ten minutes is enough.",
      fireAt,
      data: { route: `/routine/${ritualId}`, kind: "ritual", ritualId },
    };
  }

  buildStreak(date: Date, streak: number): NotificationSchedule | null {
    if (!this.settings.enabled || streak < 2) return null;
    const fireAt = atLocalTime(date, 19, 0);
    if (isInQuietHours(fireAt, this.settings.quietHours)) return null;
    return {
      id: `streak:${fireAt.toISOString().slice(0, 10)}`,
      kind: "streak",
      title: `${streak} gentle days`,
      body: "One small moment can keep the rhythm going.",
      fireAt,
      data: { route: "/insights", kind: "streak" },
    };
  }
}

export async function schedulePlannedNotifications(
  permission: NotificationPermissionAdapter,
  scheduler: NotificationSchedulerAdapter,
  plans: Array<NotificationSchedule | null>,
): Promise<string[]> {
  if (!(await permission.request())) return [];
  const ids: string[] = [];
  const unique = new Map<string, NotificationSchedule>();
  for (const plan of plans) if (plan) unique.set(plan.id, plan);
  for (const plan of unique.values()) ids.push(await scheduler.schedule({ title: plan.title, body: plan.body, fireAt: plan.fireAt, data: plan.data }));
  return ids;
}

function atLocalTime(date: Date, hour: number, minute: number): Date {
  const copy = new Date(date);
  copy.setHours(hour, minute, 0, 0);
  return copy;
}

export function isInQuietHours(date: Date, quietHours: { start: string; end: string }): boolean {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const start = parseClock(quietHours.start);
  const end = parseClock(quietHours.end);
  if (start <= end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}

function parseClock(value: string): number {
  const parts = value.split(":").map(Number);
  const hour = Number.isFinite(parts[0]) ? Math.max(0, Math.min(23, parts[0])) : 0;
  const minute = Number.isFinite(parts[1]) ? Math.max(0, Math.min(59, parts[1])) : 0;
  return hour * 60 + minute;
}
