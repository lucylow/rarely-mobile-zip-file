import { isoDate, topN } from "./ids";
import type { ActivityEvent, DailyBrief, DailyBriefItem, MemoryItem, RoutineDefinition } from "./types";

export interface BriefContext {
  memories: MemoryItem[];
  routines: RoutineDefinition[];
  currentHour?: number;
}

export function buildDailyBrief(events: ActivityEvent[], context: BriefContext, now = new Date()): DailyBrief {
  const today = isoDate(now);
  const hour = context.currentHour ?? now.getHours();
  const recent = events.slice(-120);
  const items: DailyBriefItem[] = [];
  const routine = pickRoutine(context.routines, recent, today);
  if (routine) {
    items.push({
      id: `routine:${routine.id}`,
      title: routine.name,
      detail: routine.description,
      minutes: routine.durationMinutes,
      kind: "ritual",
      reason: "A ritual you have not completed yet today.",
    });
  }
  const creative = context.memories.find((memory) => memory.kind === "creative-medium");
  items.push(creative ? {
    id: `creative:${creative.id}`,
    title: `Make something with ${creative.value.toLowerCase()}`,
    detail: "One small creative action is enough.",
    minutes: 10,
    kind: "creative",
    reason: "Shaped around a creative medium you return to.",
  } : {
    id: "creative:starter",
    title: hour < 12 ? "Collect one interesting thing" : "Notice one interesting thing",
    detail: "A color, texture, line, sound, or tiny detail.",
    minutes: 5,
    kind: "creative",
    reason: "A low-pressure creative reset.",
  });
  if (!recent.some((event) => event.kind === "journal.saved" && event.occurredAt.slice(0, 10) === today)) {
    items.push({
      id: "reflection:one-line",
      title: "Write one honest line",
      detail: "Start with “Right now, I notice…”",
      minutes: 3,
      kind: "reflection",
      reason: "Reflection without a long-form commitment.",
    });
  }
  const community = pickCommunityCircle(recent);
  if (community) {
    items.push({
      id: `community:${community.id}`,
      title: `Return to ${community.name}`,
      detail: "Add a small thought or reaction.",
      minutes: 5,
      kind: "community",
      reason: "You have interacted with this circle recently.",
    });
  }
  return {
    date: today,
    greeting: greetingForHour(hour),
    theme: chooseTheme(context.memories),
    items: [...new Map(items.map((item) => [item.id, item])).values()].slice(0, 4),
    footer: "No need to finish everything. One meaningful moment is enough.",
  };
}

function greetingForHour(hour: number): string {
  if (hour < 5) return "A quiet hello";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function chooseTheme(memories: MemoryItem[]): string {
  const routine = memories.find((memory) => memory.kind === "routine");
  if (routine) return `A little ${routine.value.toLowerCase()}`;
  const community = memories.find((memory) => memory.kind === "community");
  if (community) return `Make room around ${community.value}`;
  const creative = memories.find((memory) => memory.kind === "creative-medium");
  if (creative) return `Play with ${creative.value.toLowerCase()}`;
  return "Make room for yourself";
}

function pickRoutine(routines: RoutineDefinition[], events: ActivityEvent[], today: string): RoutineDefinition | null {
  const weekday = new Date(`${today}T12:00:00.000Z`).getUTCDay();
  const completedIds = new Set(events.filter((event) => event.kind === "routine.completed" && event.occurredAt.slice(0, 10) === today).map((event) => String(event.metadata.routineId ?? "")));
  return routines.find((routine) => routine.days.includes(weekday) && !completedIds.has(routine.id)) ?? null;
}

function pickCommunityCircle(events: ActivityEvent[]): { id: string; name: string } | null {
  const counts = new Map<string, { name: string; count: number }>();
  for (const event of events) {
    if (!["circle.joined", "circle.posted", "circle.reacted"].includes(event.kind)) continue;
    const id = String(event.metadata.circleId ?? "");
    if (!id) continue;
    const name = String(event.metadata.circleName ?? id);
    const current = counts.get(id) ?? { name, count: 0 };
    counts.set(id, { name: current.name, count: current.count + 1 });
  }
  const row = topN([...counts.entries()], ([, value]) => value.count, 1)[0];
  return row ? { id: row[0], name: row[1].name } : null;
}
