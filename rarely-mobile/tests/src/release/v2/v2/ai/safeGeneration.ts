import { deterministicFallback } from './fallbacks';
import { isOutputSafe } from './outputSafety';
import type { AiMode } from './policy';
export async function generateSafe(mode: AiMode, task: () => Promise<string>): Promise<string> { try { const result = await task(); if (!isOutputSafe(result)) return deterministicFallback(mode).body; return result; } catch { return deterministicFallback(mode).body; } }
