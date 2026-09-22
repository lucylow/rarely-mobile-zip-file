export type PipelineStep = 'doctor'|'types'|'tests'|'secrets'|'privacy'|'iap'|'metadata'|'build'|'upload'|'testflight'|'archive';
export type PipelineResult = { step: PipelineStep; passed: boolean; blocking: boolean; message: string };
export const DEFAULT_PIPELINE: PipelineStep[] = ['doctor','types','tests','secrets','privacy','iap','metadata','build','upload','testflight','archive'];
export function summarizePipeline(results: PipelineResult[]): { passed: boolean; blockers: string[]; warnings: string[] } {
  const blockers = results.filter((r) => !r.passed && r.blocking).map((r) => `${r.step}:${r.message}`);
  const warnings = results.filter((r) => !r.passed && !r.blocking).map((r) => `${r.step}:${r.message}`);
  return { passed: blockers.length === 0, blockers, warnings };
}
export function nextStep(results: PipelineResult[]): PipelineStep | null {
  for (const step of DEFAULT_PIPELINE) { const result = results.find((r) => r.step === step); if (!result || !result.passed) return step; }
  return null;
}
