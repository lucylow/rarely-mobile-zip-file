export interface SubmissionState { busy: boolean; lastSubmittedAt?: number; error?: string; }
export function canSubmit(state: SubmissionState, now = Date.now(), cooldownMs = 800): boolean { return !state.busy && (!state.lastSubmittedAt || now - state.lastSubmittedAt >= cooldownMs); }
export async function submitOnce<T>(state: SubmissionState, setState: (next: SubmissionState) => void, task: () => Promise<T>, now = Date.now()): Promise<T | undefined> {
  if (!canSubmit(state, now)) return undefined;
  setState({ ...state, busy: true, error: undefined, lastSubmittedAt: now });
  try { return await task(); } catch (error) { setState({ ...state, busy: false, error: error instanceof Error ? error.message : 'submit-failed' }); throw error; } finally { setState({ ...state, busy: false }); }
}
