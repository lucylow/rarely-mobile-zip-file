import type { MemoryItem } from "./types";
import type { MemoryEngine } from "./memory";

export interface MemoryEdit {
  label?: string;
  value?: string;
  explanation?: string;
}

export async function editMemory(engine: MemoryEngine, memoryId: string, edit: MemoryEdit): Promise<MemoryItem> {
  const existing = engine.getMemories().find((memory) => memory.id === memoryId);
  if (!existing) throw new Error("memory_not_found");
  if (!existing.editable) throw new Error("memory_not_editable");
  const next: MemoryItem = {
    ...existing,
    label: sanitize(edit.label ?? existing.label, 80),
    value: sanitize(edit.value ?? existing.value, 160),
    explanation: sanitize(edit.explanation ?? existing.explanation, 240),
  };
  await engine.remove(existing.id);
  await engine.accept({
    key: next.key,
    kind: next.kind,
    label: next.label,
    value: next.value,
    weight: next.confidence,
    evidence: next.evidence,
    explanation: next.explanation,
  });
  return engine.getMemories().find((memory) => memory.key === next.key) ?? next;
}

function sanitize(value: string, max: number): string {
  return value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}
