export type AppPhase = 'cold' | 'booting' | 'interactive' | 'background' | 'terminating';

export interface LifecycleState { phase: AppPhase; changedAt: number; generation: number; }

export function transitionLifecycle(state: LifecycleState, next: AppPhase, now = Date.now()): LifecycleState {
  if (state.phase === 'terminating') return state;
  if (next === 'cold' && state.phase !== 'cold') return { ...state, phase: 'cold', changedAt: now, generation: state.generation + 1 };
  return { ...state, phase: next, changedAt: now };
}

export function shouldRefreshOnResume(state: LifecycleState, now = Date.now(), minBackgroundMs = 30_000): boolean {
  return state.phase === 'interactive' && now - state.changedAt >= minBackgroundMs;
}
