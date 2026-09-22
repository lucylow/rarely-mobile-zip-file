import { clamp01, isoDate } from "./ids";
import type { ActivityEvent, Insight } from "./types";

export interface InsightSummary {
  completedMoments: number;
  creativeCompletions: number;
  journalSaves: number;
  routineCompletions: number;
  circleContributions: number;
  activeDays: number;
  longestStreak: number;
  currentStreak: number;
}

export function buildInsights(events: ActivityEvent[], now = new Date(), windowDays = 28): Insight[] {
  const current = filterWindow(events, now, windowDays);
  const previous = filterWindow(events, new Date(now.getTime() - windowDays * 86_400_000), windowDays);
  const currentSummary = summarize(current, now);
  const previousSummary = summarize(previous, new Date(now.getTime() - windowDays * 86_400_000));
  return [
    completionInsight(currentSummary, previousSummary),
    creativeInsight(currentSummary, previousSummary),
    reflectionInsight(currentSummary),
    routineInsight(currentSummary),
    communityInsight(currentSummary),
    streakInsight(currentSummary),
  ].filter((insight): insight is Insight => Boolean(insight));
}

export function summarize(events: ActivityEvent[], now = new Date()): InsightSummary {
  const dates = uniqueDates(events);
  return {
    completedMoments: count(events, "moment.completed"),
    creativeCompletions: count(events, "create.completed"),
    journalSaves: count(events, "journal.saved"),
    routineCompletions: count(events, "routine.completed"),
    circleContributions: count(events, "circle.posted") + count(events, "circle.reacted"),
    activeDays: dates.size,
    longestStreak: calculateLongestStreak(dates),
    currentStreak: calculateCurrentStreak(dates, isoDate(now)),
  };
}

export function weeklyDelta(current: number, previous: number): { delta: number; direction: "up" | "down" | "same" } {
  const delta = current - previous;
  return { delta, direction: delta > 0 ? "up" : delta < 0 ? "down" : "same" };
}

export function calculateLongestStreak(dateStrings: Set<string> | string[]): number {
  const dates = [...new Set([...dateStrings])].sort();
  if (!dates.length) return 0;
  let best = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    const before = Date.parse(`${dates[index - 1]}T00:00:00.000Z`);
    const current = Date.parse(`${dates[index]}T00:00:00.000Z`);
    if (current - before === 86_400_000) {
      run += 1;
      best = Math.max(best, run);
    } else run = 1;
  }
  return best;
}

export function calculateCurrentStreak(dateStrings: Set<string> | string[], today: string): number {
  const dates = new Set(dateStrings);
  let cursor = new Date(`${today}T00:00:00.000Z`);
  if (!dates.has(today)) cursor = new Date(cursor.getTime() - 86_400_000);
  let countDays = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    countDays += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return countDays;
}

function completionInsight(current: InsightSummary, previous: InsightSummary): Insight | null {
  if (!current.completedMoments && !previous.completedMoments) return null;
  const delta = weeklyDelta(current.completedMoments, previous.completedMoments);
  return {
    id: "moments-completed",
    title: "You made room for moments",
    summary: `You completed ${current.completedMoments} Rare Moment${current.completedMoments === 1 ? "" : "s"} in this period.`,
    metric: current.completedMoments,
    unit: "moments",
    periodLabel: "last 28 days",
    evidence: [`${delta.delta >= 0 ? "+" : ""}${delta.delta} vs previous period`, `${current.activeDays} active day${current.activeDays === 1 ? "" : "s"}`],
    action: { label: "Find a moment", kind: "moment" },
  };
}

function creativeInsight(current: InsightSummary, previous: InsightSummary): Insight | null {
  if (!current.creativeCompletions && !previous.creativeCompletions) return null;
  const delta = current.creativeCompletions - previous.creativeCompletions;
  return {
    id: "creative-output",
    title: "Your creative side showed up",
    summary: `You finished ${current.creativeCompletions} creative session${current.creativeCompletions === 1 ? "" : "s"}.`,
    metric: current.creativeCompletions,
    unit: "creative sessions",
    periodLabel: "last 28 days",
    evidence: [`${delta >= 0 ? "+" : ""}${delta} vs previous period`],
    action: { label: "Create something", kind: "journal" },
  };
}

function reflectionInsight(current: InsightSummary): Insight | null {
  if (!current.journalSaves) return null;
  return {
    id: "reflection",
    title: "You kept a record of yourself",
    summary: `${current.journalSaves} saved reflection${current.journalSaves === 1 ? "" : "s"} made it into your private journal.`,
    metric: current.journalSaves,
    unit: "entries",
    periodLabel: "last 28 days",
    evidence: ["Journal content stays outside the aggregate insight model."],
    action: { label: "Write a little", kind: "journal" },
  };
}

function routineInsight(current: InsightSummary): Insight {
  return {
    id: "rituals",
    title: "Rituals are becoming rituals",
    summary: `${current.routineCompletions} routine completion${current.routineCompletions === 1 ? "" : "s"} recorded.`,
    metric: current.routineCompletions,
    unit: "completions",
    periodLabel: "last 28 days",
    evidence: [`${current.currentStreak}-day current streak`, `${current.longestStreak}-day longest streak`],
    action: { label: "Open Studio", kind: "routine" },
  };
}

function communityInsight(current: InsightSummary): Insight {
  return {
    id: "community",
    title: "You added something to the room",
    summary: `${current.circleContributions} community contribution${current.circleContributions === 1 ? "" : "s"} recorded.`,
    metric: current.circleContributions,
    unit: "contributions",
    periodLabel: "last 28 days",
    evidence: ["Includes posts and lightweight reactions.", "Does not count passive browsing."],
    action: { label: "Visit a circle", kind: "circle" },
  };
}

function streakInsight(current: InsightSummary): Insight {
  return {
    id: "streak",
    title: current.currentStreak ? "A gentle streak is growing" : "A new streak can start anytime",
    summary: current.currentStreak ? `${current.currentStreak} consecutive active day${current.currentStreak === 1 ? "" : "s"}.` : "Try one small activity today.",
    metric: clamp01(Math.min(1, current.currentStreak / 7)),
    unit: "streak progress",
    periodLabel: "today",
    evidence: [`Longest streak: ${current.longestStreak} days`],
    action: { label: "Choose one small thing", kind: "moment" },
  };
}

function filterWindow(events: ActivityEvent[], end: Date, days: number): ActivityEvent[] {
  const start = new Date(end.getTime() - days * 86_400_000);
  return events.filter((event) => {
    const time = Date.parse(event.occurredAt);
    return time >= start.getTime() && time <= end.getTime();
  });
}

function count(events: ActivityEvent[], kind: ActivityEvent["kind"]): number {
  return events.filter((event) => event.kind === kind).length;
}

function uniqueDates(events: ActivityEvent[]): Set<string> {
  return new Set(events.map((event) => event.occurredAt.slice(0, 10)));
}
