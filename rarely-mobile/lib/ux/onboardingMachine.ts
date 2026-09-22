export type OnboardingState = "welcome" | "intent" | "permissions" | "personalize" | "done";
export type OnboardingEvent = { type: "NEXT" | "BACK" | "SKIP" | "COMPLETE" };

const nextState: Record<OnboardingState, OnboardingState> = {
  welcome: "intent",
  intent: "permissions",
  permissions: "personalize",
  personalize: "done",
  done: "done",
};

const previousState: Record<OnboardingState, OnboardingState> = {
  welcome: "welcome",
  intent: "welcome",
  permissions: "intent",
  personalize: "permissions",
  done: "personalize",
};

export function transition(state: OnboardingState, event: OnboardingEvent): OnboardingState {
  if (event.type === "BACK") return previousState[state];
  if (event.type === "SKIP" || event.type === "COMPLETE") return "done";
  return nextState[state];
}

export const onboardingProgress = (state: OnboardingState) =>
  ({ welcome: 0.2, intent: 0.4, permissions: 0.6, personalize: 0.8, done: 1 })[state];

const ONBOARDING_COMPLETED_KEY = "rarely.onboarding.completed";

type StorageReader = {
  getItem(key: string): Promise<string | null>;
};

/**
 * Returns whether the onboarding route should be shown. If local storage is
 * unavailable, keep the current route rather than creating an unhandled
 * rejection or forcing a potentially surprising redirect.
 */
export async function shouldShowOnboarding(storage: StorageReader): Promise<boolean> {
  try {
    return !(await storage.getItem(ONBOARDING_COMPLETED_KEY));
  } catch {
    return false;
  }
}
