import { useFocusEffect } from "expo-router";
import { useCallback, type DependencyList } from "react";
import { reportNonFatalError } from "@/lib/non-fatal-error";

type IsActive = () => boolean;
type AsyncFocusEffectErrorHandler = (error: unknown) => void;

/**
 * Runs an async effect whenever the screen gains focus and
 * exposes a simple active guard to prevent stale state updates.
 */
export function useAsyncFocusEffect(
  effect: (isActive: IsActive) => Promise<void>,
  deps: DependencyList,
  onError?: AsyncFocusEffectErrorHandler,
) {
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const isActive = () => active;
      void effect(isActive).catch((error) => {
        if (onError) {
          onError(error);
          return;
        }
        reportNonFatalError("use-async-focus-effect", error);
      });
      return () => {
        active = false;
      };
    }, [...deps, onError]),
  );
}
