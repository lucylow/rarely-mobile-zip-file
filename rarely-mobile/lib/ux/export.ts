export type JournalExportMode = "web-share" | "native-share" | "unavailable";

export type ExportableJournalEntry = {
  text?: unknown;
  date?: unknown;
};

export function getJournalExportMode(platform: string, sharingAvailable: boolean): JournalExportMode {
  if (platform === "web") return "web-share";
  return sharingAvailable ? "native-share" : "unavailable";
}

export type ExportableAiPrompt = {
  prompt?: unknown;
  mode?: unknown;
  feedback?: unknown;
  favorite?: unknown;
  at?: unknown;
};

export function prepareAiHistoryExportText(entries: readonly ExportableAiPrompt[]): string | null {
  const validEntries = entries.filter((entry): entry is { prompt: string; mode?: string; feedback?: string; favorite?: boolean; at?: string } => typeof entry.prompt === "string" && entry.prompt.trim().length > 0);
  if (!validEntries.length) return null;
  return [
    "RARELY — SAVED AI PROMPTS",
    "AI metadata only. Journal text and images are not included.",
    "",
    ...validEntries.map((entry) => {
      const date = typeof entry.at === "string" ? new Date(entry.at) : null;
      const dateLabel = date && Number.isFinite(date.getTime()) ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Unknown date";
      const modeLabel = typeof entry.mode === "string" ? entry.mode : "unknown mode";
      const feedbackLabel = typeof entry.feedback === "string" ? entry.feedback : "no feedback";
      return `${dateLabel} · ${modeLabel} · ${feedbackLabel}${entry.favorite === true ? " · favorite" : ""}\n${entry.prompt.trim()}\n`;
    }),
  ].join("\n");
}

export function prepareJournalExportText(entries: readonly ExportableJournalEntry[]): string | null {
  const validEntries = entries.filter(
    (entry): entry is { text: string; date?: string } =>
      typeof entry.text === "string" && entry.text.trim().length > 0,
  );
  if (!validEntries.length) return null;

  return [
    "RARELY — SAVED JOURNAL",
    "",
    ...validEntries.map((entry) => {
      const date = typeof entry.date === "string" ? new Date(entry.date) : null;
      const dateLabel = date && Number.isFinite(date.getTime())
        ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "Unknown date";
      return `${dateLabel}\n${entry.text.trim()}\n`;
    }),
  ].join("\n");
}
