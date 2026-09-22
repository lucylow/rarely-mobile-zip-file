import { checksum } from "../storage/checksum";
import { redactObject } from "./redact";

export interface ExportBundle {
  schemaVersion: 1;
  createdAt: string;
  journal: unknown[];
  activity: unknown[];
  preferences: unknown;
}

export function buildExportBundle(input: Omit<ExportBundle, "schemaVersion" | "createdAt">): ExportBundle {
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    journal: input.journal,
    activity: input.activity,
    preferences: redactObject(input.preferences),
  };
}

export function serializeExport(bundle: ExportBundle): { json: string; checksum: string } {
  const json = JSON.stringify(bundle, null, 2);
  return { json, checksum: checksum(json) };
}
