import type { Mood } from "@/lib/ux/uxTypes";

export type Card = { id: string; kind: string; score: number; label?: string };

export function rankCards(cards: Card[], mood?: Mood) {
  const boost: Record<string, Mood[]> = {
    prompt: ["creative", "focused"],
    playlist: ["calm", "energized"],
    community: ["social"],
    reflection: ["tired", "calm"],
  };
  return [...cards]
    .map((card) => ({
      ...card,
      score: Number.isFinite(card.score) ? card.score : 0,
    }))
    .map((card) => ({
      ...card,
      score: card.score + (mood && boost[card.kind]?.includes(mood) ? 0.2 : 0),
    }))
    .sort((a, b) => b.score - a.score);
}

export function diversify(cards: Card[], limit = 8) {
  const safeLimit = Math.max(0, Math.floor(Number.isFinite(limit) ? limit : 0));
  if (safeLimit === 0 || cards.length === 0) return [];

  const seen = new Set<string>();
  const uniqueFirstPass: Card[] = [];
  const remainder: Card[] = [];
  for (const card of cards) {
    if (!seen.has(card.kind)) {
      seen.add(card.kind);
      uniqueFirstPass.push(card);
      continue;
    }
    remainder.push(card);
  }

  if (uniqueFirstPass.length >= safeLimit) {
    return uniqueFirstPass.slice(0, safeLimit);
  }
  return [...uniqueFirstPass, ...remainder].slice(0, safeLimit);
}

export function revealMore(current: number, total: number) {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safeTotal = Math.max(0, Number.isFinite(total) ? total : 0);
  return Math.min(Math.max(0, safeCurrent + 2), safeTotal);
}
