import type { UpgradeStorage } from "./storage";
import { ActivityStore } from "./eventStore";
import { DEFAULT_PRIVACY_SETTINGS, PrivacyCenter, type PrivacySettings } from "./privacyCenter";
import { MemoryEngine } from "./memory";
import { SyncQueue } from "./sync";
import { DEFAULT_FEATURE_FLAGS, FeatureFlagService } from "./featureFlags";
import { MemoryTelemetrySink, TelemetryBuffer } from "./telemetry";
import { SessionTracker } from "./session";
import { UpgradeActivityRecorder } from "./activityRecorder";
import type { FeatureFlag } from "./types";

export interface UpgradeServiceOptions {
  storage: UpgradeStorage;
  privacy?: PrivacySettings;
  featureFlags?: FeatureFlag[];
  telemetryEnabled?: boolean;
}

export function createUpgradeService(options: UpgradeServiceOptions) {
  const privacy = new PrivacyCenter(options.privacy ?? DEFAULT_PRIVACY_SETTINGS);
  const activity = new ActivityStore(options.storage, { privacy });
  const memories = new MemoryEngine(options.storage);
  const sync = new SyncQueue(options.storage, privacy);
  const flags = new FeatureFlagService(options.featureFlags ?? DEFAULT_FEATURE_FLAGS);
  const telemetrySink = new MemoryTelemetrySink();
  const telemetry = new TelemetryBuffer({ enabled: options.telemetryEnabled ?? false, allowIdentifiers: false, maxQueueSize: 100 }, telemetrySink);
  const session = new SessionTracker();
  const recorder = new UpgradeActivityRecorder(activity, sync, telemetry, session);
  return { privacy, activity, memories, sync, flags, telemetry, telemetrySink, session, recorder };
}

export async function hydrateUpgradeService(service: ReturnType<typeof createUpgradeService>) {
  const activity = await service.activity.hydrate();
  await service.sync.hydrate();
  await service.memories.hydrate();
  return activity;
}
