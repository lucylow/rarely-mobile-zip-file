import type { UpgradeStorage } from "./storage";
import { safeStorageRead, safeStorageWrite } from "./storage";
import type { PrivacySettings } from "./privacyCenter";

const KEY = "rarely.upgrade.preferences";

export interface UpgradePreferences {
  version: 1;
  creativeTags: string[];
  preferredDuration: 3 | 5 | 10 | 15;
  favoriteToolIds: string[];
  favoriteCircleIds: string[];
  privacy: PrivacySettings;
  notifications: {
    enabled: boolean;
    dailyBriefHour: number;
    quietHours: { start: string; end: string };
  };
}

export const DEFAULT_UPGRADE_PREFERENCES: UpgradePreferences = {
  version: 1,
  creativeTags: [],
  preferredDuration: 10,
  favoriteToolIds: [],
  favoriteCircleIds: [],
  privacy: {
    syncPersonalEvents: true,
    syncPrivateJournals: false,
    diagnosticsEnabled: false,
    notificationsEnabled: true,
    aiConsent: false,
    communityPreflightEnabled: true,
    shareScrapbookByDefault: false,
  },
  notifications: {
    enabled: true,
    dailyBriefHour: 9,
    quietHours: { start: "22:00", end: "07:00" },
  },
};

export class PreferencesStore {
  private value: UpgradePreferences = structuredCloneSafe(DEFAULT_UPGRADE_PREFERENCES);

  constructor(private readonly storage: UpgradeStorage) {}

  async hydrate(): Promise<UpgradePreferences> {
    const result = await safeStorageRead<unknown>(this.storage, KEY);
    this.value = mergeDefaults(result.ok ? result.value : null);
    return this.get();
  }

  async patch(patch: DeepPartial<UpgradePreferences>): Promise<UpgradePreferences> {
    this.value = mergePreferenceValue(this.value, patch);
    await safeStorageWrite(this.storage, KEY, this.value);
    return this.get();
  }

  async reset(): Promise<void> {
    this.value = structuredCloneSafe(DEFAULT_UPGRADE_PREFERENCES);
    await this.storage.remove(KEY);
  }

  get(): UpgradePreferences { return structuredCloneSafe(this.value); }
}

type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

function mergeDefaults(value: unknown): UpgradePreferences {
  if (!value || typeof value !== "object") return structuredCloneSafe(DEFAULT_UPGRADE_PREFERENCES);
  return mergePreferenceValue(structuredCloneSafe(DEFAULT_UPGRADE_PREFERENCES), value as DeepPartial<UpgradePreferences>);
}

function mergePreferenceValue(base: UpgradePreferences, patch: DeepPartial<UpgradePreferences>): UpgradePreferences {
  const result = structuredCloneSafe(base);
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const current = result[key as keyof UpgradePreferences];
    if (typeof current === "object" && current !== null && !Array.isArray(current) && typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key as keyof UpgradePreferences] = { ...current, ...value } as never;
    } else if (key in result) {
      result[key as keyof UpgradePreferences] = value as never;
    }
  }
  result.creativeTags = result.creativeTags.filter((value): value is string => typeof value === "string").slice(0, 20);
  result.favoriteToolIds = result.favoriteToolIds.filter((value): value is string => typeof value === "string").slice(0, 20);
  result.favoriteCircleIds = result.favoriteCircleIds.filter((value): value is string => typeof value === "string").slice(0, 20);
  return result;
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
