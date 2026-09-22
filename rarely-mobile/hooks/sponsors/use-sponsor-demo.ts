import { useCallback, useEffect, useRef, useState } from "react";

import {
  resetSponsorDemoSession,
  runSponsorPipeline,
  SponsorPipelineCancelled,
  type PipelineStageUpdate,
  type PipelineStepId,
} from "@/lib/sponsors/orchestrator";
import type { SponsorPipelineResult, StyleBrief } from "@/lib/sponsors/types";

type DemoStatus = "idle" | "running" | "complete" | "cancelled" | "error";

const STEP_IDS: PipelineStepId[] = [
  "personalize",
  "visual",
  "discover",
  "match",
  "remember",
  "identity",
  "documents",
];

function initialStages(): Record<PipelineStepId, PipelineStageUpdate> {
  return Object.fromEntries(
    STEP_IDS.map((id) => [id, { id, status: "idle", message: "" }]),
  ) as Record<PipelineStepId, PipelineStageUpdate>;
}

export function useSponsorDemo() {
  const mountedRef = useRef(true);
  const cancelledRef = useRef(false);
  const runningRef = useRef(false);
  const operationRef = useRef(0);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [result, setResult] = useState<SponsorPipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runNumber, setRunNumber] = useState(0);
  const [stages, setStages] = useState<Record<PipelineStepId, PipelineStageUpdate>>(initialStages);

  useEffect(() => () => {
    mountedRef.current = false;
    cancelledRef.current = true;
    operationRef.current += 1;
  }, []);

  const run = useCallback(async (brief: StyleBrief) => {
    if (!mountedRef.current || runningRef.current) return;

    const operation = operationRef.current + 1;
    operationRef.current = operation;
    runningRef.current = true;
    cancelledRef.current = false;
    setStatus("running");
    setError(null);
    setResult(null);
    setStages(initialStages());
    setRunNumber((current) => current + 1);

    try {
      const next = await runSponsorPipeline(brief, {
        onStage: (update) => {
          if (!mountedRef.current || operationRef.current !== operation) return;
          setStages((current) => ({ ...current, [update.id]: update }));
        },
        shouldCancel: () => cancelledRef.current || !mountedRef.current || operationRef.current !== operation,
      });

      if (!mountedRef.current || operationRef.current !== operation || cancelledRef.current) return;
      setResult(next);
      setStatus("complete");
    } catch (caught) {
      if (!mountedRef.current || operationRef.current !== operation) return;
      if (caught instanceof SponsorPipelineCancelled) {
        setStatus("cancelled");
        return;
      }

      setError(
        caught instanceof Error && caught.message.trim()
          ? caught.message
          : "The demo could not finish. Your core RARELY space is still available.",
      );
      setStatus("error");
    } finally {
      if (operationRef.current === operation) runningRef.current = false;
    }
  }, []);

  const cancel = useCallback(() => {
    if (!runningRef.current || !mountedRef.current) return;
    cancelledRef.current = true;
    operationRef.current += 1;
    runningRef.current = false;
    setStatus("cancelled");
    setStages((current) => Object.fromEntries(
      Object.entries(current).map(([id, stage]) => [
        id,
        stage.status === "running" ? { ...stage, status: "cancelled", message: "Demo cancelled" } : stage,
      ]),
    ) as Record<PipelineStepId, PipelineStageUpdate>);
  }, []);

  const reset = useCallback(() => {
    cancelledRef.current = true;
    operationRef.current += 1;
    runningRef.current = false;
    resetSponsorDemoSession();
    if (!mountedRef.current) return;
    cancelledRef.current = false;
    setStatus("idle");
    setResult(null);
    setError(null);
    setRunNumber(0);
    setStages(initialStages());
  }, []);

  return { status, result, error, runNumber, stages, run, cancel, reset };
}
