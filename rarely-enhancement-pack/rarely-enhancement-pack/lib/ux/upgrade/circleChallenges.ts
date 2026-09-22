import { stableHash, topN } from "./ids";
import type { ActivityEvent } from "./types";

export interface CircleChallenge {
  id: string;
  title: string;
  prompt: string;
  minutes: number;
  circleId: string;
  startsOn: string;
  endsOn: string;
}

export interface ChallengeProgress {
  challengeId: string;
  contributions: number;
  completed: boolean;
  lastContributionAt?: string;
}

export function buildChallenges(circleId: string, date = new Date()): CircleChallenge[] {
  const day = date.toISOString().slice(0, 10);
  const seeds = [
    ["Notice something ordinary", "Share one tiny detail you almost missed.", 5],
    ["Make a two-word moodboard", "Choose two words and connect them.", 10],
    ["Leave a generous reaction", "Tell someone what detail you enjoyed.", 3],
    ["Color hunt", "Post one color that changed your mood.", 7],
  ] as const;
  return seeds.map(([title, prompt, minutes], index) => ({
    id: `challenge_${stableHash(`${circleId}:${day}:${index}`).slice(0, 10)}`,
    title,
    prompt,
    minutes,
    circleId,
    startsOn: day,
    endsOn: addDays(day, 6),
  }));
}

export function progressForChallenges(events: ActivityEvent[], challenges: CircleChallenge[]): ChallengeProgress[] {
  return challenges.map((challenge) => {
    const matching = events.filter((event) => event.kind === "circle.posted" && String(event.metadata.challengeId ?? "") === challenge.id);
    return { challengeId: challenge.id, contributions: matching.length, completed: matching.length >= 1, lastContributionAt: matching.at(-1)?.occurredAt };
  });
}

export function topCommunityMoments(events: ActivityEvent[], limit = 8): Array<{ id: string; title: string; reactions: number }> {
  const rows = new Map<string, { id: string; title: string; reactions: number }>();
  for (const event of events) {
    if (event.kind === "circle.posted") {
      const id = String(event.metadata.postId ?? event.id);
      rows.set(id, { id, title: event.title ?? "Untitled thought", reactions: 0 });
    }
    if (event.kind === "circle.reacted") {
      const id = String(event.metadata.postId ?? "");
      const current = rows.get(id);
      if (current) current.reactions += 1;
    }
  }
  return topN([...rows.values()], (row) => row.reactions, limit);
}

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00.000Z`) + days * 86_400_000).toISOString().slice(0, 10);
}
