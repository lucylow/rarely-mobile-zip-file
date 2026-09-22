type PreferencesStorage = {
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export type PersonalizationResetResult = {
  preferencesSaved: boolean;
  starterPathCleared: boolean;
  lastMoodCleared: boolean;
};

export async function resetPersonalizationBestEffort(
  storage: PreferencesStorage,
  serializedPreferences: string,
): Promise<PersonalizationResetResult> {
  const result: PersonalizationResetResult = {
    preferencesSaved: false,
    starterPathCleared: false,
    lastMoodCleared: false,
  };

  try {
    await storage.setItem("rarely.preferences", serializedPreferences);
    result.preferencesSaved = true;
  } catch {
    return result;
  }

  try {
    await storage.removeItem("rarely.starterPath");
    result.starterPathCleared = true;
  } catch {
    // Continue so the remembered mood has an independent chance to clear.
  }

  try {
    await storage.removeItem("rarely.lastMood");
    result.lastMoodCleared = true;
  } catch {
    // The caller can surface a partial-reset message without losing the new preferences.
  }

  return result;
}
