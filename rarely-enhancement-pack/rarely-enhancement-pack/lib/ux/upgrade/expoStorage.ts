import AsyncStorage from "@react-native-async-storage/async-storage";
import { createJsonStorage, type UpgradeStorage } from "./storage";

export function createExpoUpgradeStorage(): UpgradeStorage {
  return createJsonStorage({ getItem: AsyncStorage.getItem, setItem: AsyncStorage.setItem, removeItem: AsyncStorage.removeItem });
}

export const UPGRADE_STORAGE_KEYS = {
  events: "rarely.upgrade.events",
  device: "rarely.upgrade.device",
  session: "rarely.upgrade.session",
  memories: "rarely.upgrade.memories",
  syncOutbox: "rarely.upgrade.sync.outbox",
  syncCursor: "rarely.upgrade.sync.cursor",
} as const;
