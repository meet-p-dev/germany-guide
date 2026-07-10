"use client";

import { useCallback, useEffect, useState } from "react";
import { loadCompleted, saveCompleted } from "@/lib/plan-progress";

/**
 * React binding over the shared plan-progress store. Both the roadmap and the
 * guided view use this hook with the SAME key, so ticking a step in one is
 * instantly reflected in the other on next load, and persists across refreshes.
 *
 * Returns a Set for O(1) membership plus toggle/markDone helpers. `hydrated`
 * guards the first paint so we don't flash 0% before localStorage is read.
 */
export function usePlanProgress(key: string) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // localStorage can't be read during SSR, so hydrate on mount. This is the
  // standard SSR-safe pattern; the eslint rule doesn't account for it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompleted(new Set(loadCompleted(key)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, [key]);

  const persist = useCallback(
    (next: Set<string>) => {
      setCompleted(next);
      saveCompleted(key, [...next]);
    },
    [key]
  );

  const toggle = useCallback(
    (slug: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        saveCompleted(key, [...next]);
        return next;
      });
    },
    [key]
  );

  const markDone = useCallback(
    (slug: string) => {
      setCompleted((prev) => {
        if (prev.has(slug)) return prev;
        const next = new Set(prev);
        next.add(slug);
        saveCompleted(key, [...next]);
        return next;
      });
    },
    [key]
  );

  return { completed, hydrated, toggle, markDone, persist };
}
