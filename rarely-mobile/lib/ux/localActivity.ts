import AsyncStorage from "@react-native-async-storage/async-storage";
import { safeJsonParse } from "../utils";
import { parseActivityRecords, type LocalActivityRecord } from "./localStorage";

export const LOCAL_ACTIVITY_KEYS = {
  journal: "rarely.journalEntries",
  moments: "rarely.completedMoments",
  circles: "rarely.joinedCircles",
  routines: "rarely.completedRoutines",
} as const;

type JournalRecord = { text: string; date: string };

export type LocalActivitySnapshot = {
  journal: JournalRecord[];
  moments: LocalActivityRecord[];
  circles: LocalActivityRecord[];
  routines: LocalActivityRecord[];
  unavailableKeys: string[];
};

export async function loadLocalActivitySnapshot(
  storage: Pick<typeof AsyncStorage, "getItem"> = AsyncStorage,
): Promise<LocalActivitySnapshot> {
  const entries = await Promise.allSettled(
    Object.values(LOCAL_ACTIVITY_KEYS).map((key) => storage.getItem(key)),
  );
  const valueAt = (index: number) => {
    const result = entries[index];
    return result?.status === "fulfilled" ? result.value : null;
  };
  const unavailableKeys = entries.flatMap((result, index) =>
    result.status === "rejected" ? [Object.values(LOCAL_ACTIVITY_KEYS)[index]!] : [],
  );
  const journal = safeJsonParse<unknown>(valueAt(0), []);
  return {
    journal: Array.isArray(journal)
      ? journal.filter((item): item is JournalRecord =>
          typeof item === "object" && item !== null &&
          typeof (item as JournalRecord).text === "string" &&
          typeof (item as JournalRecord).date === "string",
        )
      : [],
    moments: parseActivityRecords(valueAt(1)),
    circles: parseActivityRecords(valueAt(2)),
    routines: parseActivityRecords(valueAt(3)),
    unavailableKeys,
  };
}
