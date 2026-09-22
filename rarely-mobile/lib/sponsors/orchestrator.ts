import { makeId, resetDemoSequence, sleep } from "./mock";
import { perfectCorp } from "./perfectCorp";
import { serpApi } from "./serpApi";
import { xano } from "./xano";
import { nameCom } from "./nameCom";
import { nutrient } from "./nutrient";
import { foxit } from "./foxit";
import { doctavian } from "./doctavian";
import { rankProducts } from "../personalization/engine";
import type { SponsorEvent, StyleBrief, UserProfile, SponsorPipelineResult } from "./types";

export type PipelineStepId = "personalize" | "visual" | "discover" | "match" | "remember" | "identity" | "documents";
export type PipelineStepStatus = "idle" | "running" | "complete" | "cancelled" | "error";

export type PipelineStageUpdate = {
  id: PipelineStepId;
  status: PipelineStepStatus;
  message: string;
  durationMs?: number;
};

export type SponsorPipelineOptions = {
  onStage?: (update: PipelineStageUpdate) => void;
  shouldCancel?: () => boolean;
};

export class SponsorPipelineCancelled extends Error {
  constructor() {
    super("Sponsor demo cancelled");
    this.name = "SponsorPipelineCancelled";
  }
}

export function buildShoppingQuery(brief: StyleBrief): string {
  return [brief.vibe, brief.occasion, ...brief.preferences, brief.intent].filter(Boolean).join(" ").trim();
}

function notify(options: SponsorPipelineOptions, update: PipelineStageUpdate) {
  options.onStage?.(update);
}

function throwIfCancelled(options: SponsorPipelineOptions) {
  if (options.shouldCancel?.()) throw new SponsorPipelineCancelled();
}

export async function runSponsorPipeline(
  brief: StyleBrief,
  options: SponsorPipelineOptions = {},
): Promise<SponsorPipelineResult> {
  const startedAt = Date.now();
  const stageStartedAt = new Map<PipelineStepId, number>();
  const begin = (id: PipelineStepId, message: string) => {
    stageStartedAt.set(id, Date.now());
    notify(options, { id, status: "running", message });
  };
  const complete = (id: PipelineStepId, message: string) => {
    notify(options, { id, status: "complete", message, durationMs: Date.now() - (stageStartedAt.get(id) ?? startedAt) });
  };
  const event = (type: string, sponsor: SponsorEvent["sponsor"], metadata?: Record<string, unknown>): SponsorEvent => ({
    id: makeId("event"),
    type,
    sponsor,
    timestamp: new Date().toISOString(),
    metadata: { ...metadata, mode: "mock" },
  });

  throwIfCancelled(options);
  begin("personalize", "Preparing your RARELY profile — DEMO");
  const profile = await xano.getProfile("demo-user");
  throwIfCancelled(options);
  await xano.recordEvent(event("pipeline.started", "xano", { intent: brief.intent }));
  complete("personalize", "Personalization ready — DEMO");

  begin("visual", "Perfect Corp is rendering a demo concept");
  begin("discover", "SerpApi is searching the offline catalog");
  const [visual, shopping] = await Promise.all([
    perfectCorp.createVisualExperience(brief),
    serpApi.searchShopping(buildShoppingQuery(brief)),
  ]);
  throwIfCancelled(options);
  complete("visual", "Perfect Corp visual complete — MOCK");
  complete("discover", `${shopping.products.length} demo products normalized — MOCK`);

  begin("match", "RARELY Match is comparing preference compatibility");
  await sleep(220);
  const ranked = rankProducts(shopping.products, profile, brief);
  throwIfCancelled(options);
  complete("match", `${ranked.length} explainable recommendations ready`);

  begin("remember", "Xano is saving demo activity locally");
  await xano.recordEvent(event("recommendation.generated", "xano", { resultCount: ranked.length }));
  throwIfCancelled(options);
  complete("remember", "Demo profile synchronized — MOCK");

  begin("identity", "name.com is preparing a synthetic identity preview");
  const domain = await nameCom.checkDomain(`rarely-${brief.vibe}-studio.example`);
  throwIfCancelled(options);
  complete("identity", "Identity preview ready — no registration performed");

  begin("documents", "Nutrient, Foxit, and Doctavian are structuring demo outputs");
  const report = await nutrient.createStyleBook({ brief, visual, products: shopping.products, ranked });
  throwIfCancelled(options);
  const foxitJob = await foxit.buildPdfWorkflow({ report, ranked });
  throwIfCancelled(options);
  const doctavianJob = await doctavian.generateStructuredDocument({ brief, reportId: report.id });
  throwIfCancelled(options);
  complete("documents", "Style book, review workflow, and report complete — MOCK");

  await xano.recordEvent(event("pipeline.completed", "xano", { visualId: visual.id, resultCount: ranked.length }));
  return { profile, visual, shopping, ranked, domain, report, foxitJob, doctavianJob };
}

export function resetSponsorDemoSession(): void {
  resetDemoSequence();
  perfectCorp.reset();
  xano.reset();
}

export function explainProfile(profile: UserProfile): string[] {
  return [
    `Interests: ${profile.interests.join(", ")}`,
    `Preferences: ${profile.preferences.join(", ")}`,
    `Saved signals: ${profile.savedProductIds.length}`,
    `Recent events: ${profile.recentEvents.length}`,
  ];
}
