import { daysBetween, stableHash } from "./ids";
import type { ActivityEvent } from "./types";

export interface SearchDocument {
  id: string;
  title: string;
  body: string;
  date: string;
  tags: string[];
  kind: ActivityEvent["kind"] | "memory";
  private: boolean;
}

export interface SearchQuery {
  text: string;
  tags?: string[];
  kinds?: SearchDocument["kind"][];
  from?: string;
  until?: string;
  includePrivate?: boolean;
}

export interface SearchResult extends SearchDocument {
  score: number;
  highlights: string[];
}

export function createSearchDocuments(events: ActivityEvent[]): SearchDocument[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title ?? titleForKind(event.kind),
    body: bodyForEvent(event),
    date: event.occurredAt,
    tags: Array.isArray(event.metadata.tags)
      ? event.metadata.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 12)
      : [],
    kind: event.kind,
    private: event.privacy === "private-journal",
  }));
}

export function searchScrapbook(documents: SearchDocument[], query: SearchQuery): SearchResult[] {
  const tokens = tokenize(query.text);
  return documents
    .filter((document) => query.includePrivate || !document.private)
    .filter((document) => !query.kinds?.length || query.kinds.includes(document.kind))
    .filter((document) => !query.tags?.length || query.tags.every((tag) => document.tags.includes(tag)))
    .filter((document) => !query.from || document.date >= query.from)
    .filter((document) => !query.until || document.date <= query.until)
    .map((document) => scoreDocument(document, tokens))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || b.date.localeCompare(a.date))
    .slice(0, 50);
}

export function searchSuggestions(documents: SearchDocument[], limit = 8): string[] {
  const tokens = new Map<string, number>();
  for (const document of documents) {
    for (const token of tokenize(`${document.title} ${document.body} ${document.tags.join(" ")}`)) {
      if (token.length < 4) continue;
      tokens.set(token, (tokens.get(token) ?? 0) + 1);
    }
  }
  return [...tokens.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([token]) => token);
}

export function searchKey(query: SearchQuery): string {
  return stableHash(JSON.stringify({ ...query, text: query.text.trim().toLowerCase() }));
}

function scoreDocument(document: SearchDocument, tokens: string[]): SearchResult {
  const title = tokenize(document.title);
  const body = tokenize(document.body);
  const tags = tokenize(document.tags.join(" "));
  let score = 0;
  const highlights: string[] = [];
  for (const token of tokens) {
    if (title.includes(token)) { score += 4; highlights.push(`title:${token}`); }
    if (tags.includes(token)) { score += 3; highlights.push(`tag:${token}`); }
    if (body.includes(token)) { score += 1; highlights.push(`body:${token}`); }
  }
  score *= Math.exp(-daysBetween(document.date, new Date().toISOString()) / 365);
  return { ...document, score: Number(score.toFixed(4)), highlights: [...new Set(highlights)] };
}

function tokenize(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9\s_-]/g, " ").split(/\s+/).filter(Boolean).filter((token) => token.length > 1);
}

function bodyForEvent(event: ActivityEvent): string {
  return Object.entries(event.metadata)
    .filter(([key]) => !["text", "body", "content", "imageUri", "imageUris"].includes(key))
    .map(([key, value]) => `${key} ${stringifyValue(value)}`)
    .join(" ");
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringifyValue).join(" ");
  return "";
}

function titleForKind(kind: ActivityEvent["kind"]): string {
  return kind.replace(/\./g, " ").replace(/(^|\s)\S/g, (character) => character.toUpperCase());
}
