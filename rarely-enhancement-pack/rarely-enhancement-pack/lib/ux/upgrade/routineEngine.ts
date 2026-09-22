import { calculateCurrentStreak, calculateLongestStreak } from "./insights";
import type { ActivityEvent, RoutineDefinition, RoutineState } from "./types";

export const DEFAULT_ROUTINES: RoutineDefinition[] = [
  {
    id: "soft-focus",
    name: "Soft Focus",
    description: "Five minutes to notice what is already here.",
    days: [1, 3, 5],
    durationMinutes: 5,
    steps: ["Put the phone down for one minute.", "Notice three details.", "Write one line."],
    tags: ["gentle", "reset"],
  },
  {
    id: "color-play",
    name: "Color Play",
    description: "A tiny visual hunt for an interesting color.",
    days: [2, 4, 6],
    durationMinutes: 10,
    steps: ["Find one color.", "Take a photo.", "Give it a name."],
    tags: ["visual", "creative"],
  },
  {
    id: "reset",
    name: "The Reset",
    description: "A low-pressure reset for days that feel full.",
    days: [0, 1, 2, 3, 4, 5, 6],
    durationMinutes: 7,
    steps: ["Take three slow breaths.", "Clear one tiny surface.", "Choose one next thing."],
    tags: ["reset", "gentle"],
  },
];

export function buildRoutineStates(events: ActivityEvent[], routines: RoutineDefinition[] = DEFAULT_ROUTINES): RoutineState[] {
  return routines.map((routine) => {
    const relevant = events.filter((event) =>
      ["routine.started", "routine.completed", "routine.skipped"].includes(event.kind) &&
      String(event.metadata.routineId ?? "") === routine.id,
    );
    const starts = relevant.filter((event) => event.kind === "routine.started");
    const completes = relevant.filter((event) => event.kind === "routine.completed");
    const attemptedDates = new Set(relevant.filter((event) => event.kind !== "routine.skipped").map((event) => event.occurredAt.slice(0, 10)));
    return {
      routineId: routine.id,
      startedCount: starts.length,
      completedCount: completes.length,
      skippedCount: relevant.filter((event) => event.kind === "routine.skipped").length,
      lastStartedAt: starts.at(-1)?.occurredAt,
      lastCompletedAt: completes.at(-1)?.occurredAt,
      bestStreak: calculateLongestStreak(attemptedDates),
      currentStreak: calculateCurrentStreak(attemptedDates, new Date().toISOString().slice(0, 10)),
    };
  });
}

export function nextRoutineForDate(routines: RoutineDefinition[], events: ActivityEvent[], date = new Date()): RoutineDefinition | null {
  const day = date.getDay();
  const dateKey = date.toISOString().slice(0, 10);
  const completed = new Set(events.filter((event) => event.kind === "routine.completed" && event.occurredAt.slice(0, 10) === dateKey).map((event) => String(event.metadata.routineId ?? "")));
  return routines.find((routine) => routine.days.includes(day) && !completed.has(routine.id)) ?? null;
}

export function calculateCompletionRate(state: RoutineState): number {
  const attempted = state.completedCount + state.skippedCount;
  return attempted ? state.completedCount / attempted : 0;
}
