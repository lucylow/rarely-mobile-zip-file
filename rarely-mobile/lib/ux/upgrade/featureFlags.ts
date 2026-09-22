import { stableHash } from "./ids";
import type { FeatureFlag, FeatureFlagSnapshot } from "./types";

export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  { key: "upgrade_hub", enabled: true },
  { key: "personal_memory", enabled: true },
  { key: "daily_brief", enabled: true },
  { key: "smart_insights", enabled: true },
  { key: "selective_sync", enabled: false },
  { key: "ai_companion", enabled: false },
  { key: "community_moderation", enabled: true },
  { key: "backup_restore", enabled: true },
  { key: "enhanced_search", enabled: true },
];

export class FeatureFlagService {
  private readonly flags = new Map<string, FeatureFlag>();

  constructor(flags: FeatureFlag[] = DEFAULT_FEATURE_FLAGS) {
    for (const flag of flags) this.flags.set(flag.key, { ...flag });
  }

  isEnabled(key: string, userKey: string): boolean {
    const flag = this.flags.get(key);
    if (!flag || flag.killSwitch || !flag.enabled) return false;
    if (flag.rollout === undefined || flag.rollout >= 1) return true;
    if (flag.rollout <= 0) return false;
    return bucketFor(`${key}:${userKey}`) < flag.rollout;
  }

  snapshot(userKey: string, now = new Date()): FeatureFlagSnapshot {
    return { userKey, generatedAt: now.toISOString(), flags: Object.fromEntries([...this.flags.keys()].map((key) => [key, this.isEnabled(key, userKey)])) };
  }

  setLocalOverride(key: string, enabled: boolean): void {
    this.flags.set(key, { ...(this.flags.get(key) ?? { key }), key, enabled, rollout: 1, killSwitch: false });
  }

  disable(key: string): void {
    this.flags.set(key, { ...(this.flags.get(key) ?? { key }), key, enabled: false, killSwitch: true });
  }

  list(): FeatureFlag[] { return [...this.flags.values()].map((flag) => ({ ...flag })); }
}

function bucketFor(input: string): number {
  return parseInt(stableHash(input).slice(0, 8), 16) / 0xffffffff;
}
