import { makeId, sleep } from "./mock";
import type { StyleBrief, VisualArtifact } from "./types";

export interface PerfectCorpPort { createVisualExperience(brief: StyleBrief): Promise<VisualArtifact>; }

const CONCEPTS = ["Quiet Forms", "Soft Contrast", "Everyday Edit", "Polished Ease"];

export class MockPerfectCorpAdapter implements PerfectCorpPort {
  private conceptIndex = 0;
  reset(): void { this.conceptIndex = 0; }
  async createVisualExperience(brief: StyleBrief): Promise<VisualArtifact> {
    const started = Date.now();
    await sleep(650);
    const concept = CONCEPTS[this.conceptIndex++ % CONCEPTS.length];
    return {
      id: makeId("perfect"),
      status: "complete",
      imageUrl: "mock://perfectcorp-visual",
      title: `${concept} · ${brief.vibe} ${brief.occasion}`,
      engine: "Perfect Corp · offline mock adapter",
      disclaimer: "MOCK VISUAL · bundled concept image · no live rendering request was made.",
      meta: { provider: "perfect-corp", mode: "mock", requestId: `demo-perfect-${String(this.conceptIndex).padStart(3, "0")}`, durationMs: Date.now() - started, status: "complete" },
    };
  }
}
export const perfectCorp = new MockPerfectCorpAdapter();
