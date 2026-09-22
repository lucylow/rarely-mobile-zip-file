export interface Backpressure { pending: number; maxPending: number; }
export function shouldPauseSync(state: Backpressure): boolean { return state.pending >= state.maxPending; }
export function nextBackpressure(state: Backpressure, added: number, processed: number): Backpressure { return { ...state, pending: Math.max(0, state.pending + added - processed) }; }
