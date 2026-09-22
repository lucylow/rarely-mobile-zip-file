type StorageWriter = {
  removeItem(key: string): Promise<void>;
};

type StorageReader = {
  getItem(key: string): Promise<string | null>;
};

export type JournalDraftRecord = {
  text: string;
  updatedAt?: string;
  prompt?: string;
  imageUri?: string;
};

export type JournalDraftLoadResult =
  | { status: "empty" }
  | { status: "loaded"; draft: JournalDraftRecord; attachmentSkipped: boolean }
  | { status: "malformed" }
  | { status: "unavailable" };

export const JOURNAL_DRAFT_KEY = "rarely.journalDraft";

export function isPrivateImageUri(value: unknown): value is string {
  return typeof value === "string" && /^(file|content|ph|blob|data:image)[:;]/i.test(value.trim());
}

export type PrivateImageReferenceStatus = "valid" | "missing" | "unavailable" | "invalid";

type FileInfoReader = {
  getInfoAsync(uri: string): Promise<{ exists: boolean }>;
};

export async function validatePrivateImageUri(
  value: unknown,
  fileSystem?: FileInfoReader,
): Promise<PrivateImageReferenceStatus> {
  if (!isPrivateImageUri(value)) return "invalid";
  const uri = value.trim();
  if (!uri.toLowerCase().startsWith("file:")) return "valid";
  if (!fileSystem) return "unavailable";
  try {
    const info = await fileSystem.getInfoAsync(uri);
    return info.exists ? "valid" : "missing";
  } catch {
    return "unavailable";
  }
}

export async function loadJournalDraftBestEffort(storage: StorageReader): Promise<JournalDraftLoadResult> {
  let value: string | null;
  try {
    value = await storage.getItem(JOURNAL_DRAFT_KEY);
  } catch {
    return { status: "unavailable" };
  }
  if (!value) return { status: "empty" };

  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || typeof (parsed as { text?: unknown }).text !== "string") {
      return { status: "malformed" };
    }
    const draft = parsed as Partial<JournalDraftRecord>;
    const text = typeof draft.text === "string" ? draft.text : "";
    const attachmentSkipped = draft.imageUri !== undefined && !isPrivateImageUri(draft.imageUri);
    return {
      status: "loaded",
      attachmentSkipped,
      draft: {
        text: text.trim() ? text : value,
        ...(typeof draft.updatedAt === "string" ? { updatedAt: draft.updatedAt } : {}),
        ...(typeof draft.prompt === "string" ? { prompt: draft.prompt } : {}),
        ...(isPrivateImageUri(draft.imageUri) ? { imageUri: draft.imageUri.trim() } : {}),
      },
    };
  } catch {
    return { status: "loaded", attachmentSkipped: false, draft: { text: value } };
  }
}

/**
 * Draft cleanup is secondary to saving the journal entry. Return whether the
 * cleanup succeeded so the UI can explain that the older draft remains local.
 */
export async function clearJournalDraftBestEffort(storage: StorageWriter): Promise<boolean> {
  try {
    await storage.removeItem(JOURNAL_DRAFT_KEY);
    return true;
  } catch {
    return false;
  }
}
