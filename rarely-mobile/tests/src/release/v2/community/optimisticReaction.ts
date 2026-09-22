export interface ReactionState { liked: boolean; count: number; pending: boolean; }
export function toggleReaction(state: ReactionState): ReactionState { return { liked: !state.liked, count: Math.max(0, state.count + (state.liked ? -1 : 1)), pending: true }; }
export function settleReaction(state: ReactionState, success: boolean): ReactionState { return success ? { ...state, pending: false } : { ...state, liked: !state.liked, count: Math.max(0, state.count + (state.liked ? 1 : -1)), pending: false }; }
