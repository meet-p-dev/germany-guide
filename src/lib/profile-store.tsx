"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { Persona, Stage } from "@/lib/content";
import { getBrowserClient } from "@/lib/supabase/browser-client";

export interface VisitorProfile {
  persona: Persona | null;
  citySlug: string | null;
  stage: Stage | null;
}

export type ProgressMap = Record<string, "done" | "skipped">;

const PROFILE_KEY = "gg.profile.v1";
const PROGRESS_KEY = "gg.progress.v1";

/**
 * Session flag set by the plan wizard after it pre-ticks steps that lie
 * behind the visitor's stage; the journey reads it once and asks the
 * visitor to verify those ticks.
 */
export const REVIEW_BEHIND_KEY = "gg.review-behind.v1";

const EMPTY_PROFILE: VisitorProfile = {
  persona: null,
  citySlug: null,
  stage: null,
};

interface ProfileContextValue {
  /** False until localStorage has been read — render neutral UI before that. */
  ready: boolean;
  profile: VisitorProfile;
  progress: ProgressMap;
  session: Session | null;
  setProfile: (patch: Partial<VisitorProfile>) => void;
  toggleStep: (stepSlug: string) => void;
  /** Bulk-tick steps as done; already-ticked slugs are left untouched. */
  markStepsDone: (stepSlugs: string[]) => void;
  resetProgress: () => void;
  signOut: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<VisitorProfile>(EMPTY_PROFILE);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [session, setSession] = useState<Session | null>(null);
  /** slug → step UUID, loaded lazily on first remote write. */
  const stepIdsRef = useRef<Map<string, string> | null>(null);
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    // Hydration-safe localStorage init: the server render must not read
    // browser storage, so the one-time post-mount sync is intentional here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileState(readJson(PROFILE_KEY, EMPTY_PROFILE));
    setProgress(readJson(PROGRESS_KEY, {}));
    setReady(true);

    const supabase = getBrowserClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  const getStepIds = useCallback(async () => {
    if (!stepIdsRef.current) {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.from("steps").select("id, slug");
      if (error) throw error;
      stepIdsRef.current = new Map(data.map((row) => [row.slug, row.id]));
    }
    return stepIdsRef.current;
  }, []);

  /**
   * One-time merge when a signed-in user appears: local wins for fields set on
   * this device, remote fills the gaps, progress is the union of both.
   */
  useEffect(() => {
    const userId = session?.user.id;
    if (!ready || !userId || syncedUserRef.current === userId) return;
    syncedUserRef.current = userId;

    const supabase = getBrowserClient();
    (async () => {
      try {
        const [profileRes, progressRes, stepIds] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("user_progress").select("step_id, status"),
          getStepIds(),
        ]);

        const idToSlug = new Map(
          [...stepIds.entries()].map(([slug, id]) => [id, slug]),
        );

        // ----- profile merge -----
        const remote = profileRes.data;
        const merged: VisitorProfile = {
          persona:
            profile.persona ?? ((remote?.persona as Persona | null) ?? null),
          citySlug: profile.citySlug ?? remote?.city_slug ?? null,
          stage: profile.stage ?? ((remote?.stage as Stage | null) ?? null),
        };
        setProfileState(merged);
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
        await supabase.from("profiles").upsert({
          id: userId,
          persona: merged.persona,
          city_slug: merged.citySlug,
          stage: merged.stage,
        });

        // ----- progress union -----
        const remoteProgress: ProgressMap = {};
        for (const row of progressRes.data ?? []) {
          const slug = idToSlug.get(row.step_id);
          if (slug) remoteProgress[slug] = row.status as "done" | "skipped";
        }
        const localOnly = Object.entries(progress).filter(
          ([slug]) => !remoteProgress[slug],
        );
        const union: ProgressMap = { ...remoteProgress, ...progress };
        setProgress(union);
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(union));
        if (localOnly.length > 0) {
          const rows = localOnly
            .map(([slug, status]) => {
              const stepId = stepIds.get(slug);
              return stepId
                ? { user_id: userId, step_id: stepId, status }
                : null;
            })
            .filter((row) => row !== null);
          if (rows.length > 0) {
            await supabase.from("user_progress").upsert(rows);
          }
        }
      } catch (error) {
        console.error("Progress sync failed:", error);
        syncedUserRef.current = null; // allow retry on next auth event
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session, getStepIds]);

  const setProfile = useCallback(
    (patch: Partial<VisitorProfile>) => {
      setProfileState((prev) => {
        const next = { ...prev, ...patch };
        window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
        const userId = session?.user.id;
        if (userId) {
          getBrowserClient()
            .from("profiles")
            .upsert({
              id: userId,
              persona: next.persona,
              city_slug: next.citySlug,
              stage: next.stage,
            })
            .then(({ error }) => {
              if (error) console.error("Profile sync failed:", error);
            });
        }
        return next;
      });
    },
    [session],
  );

  const toggleStep = useCallback(
    (stepSlug: string) => {
      setProgress((prev) => {
        const next: ProgressMap = { ...prev };
        const nowDone = !next[stepSlug];
        if (nowDone) {
          next[stepSlug] = "done";
        } else {
          delete next[stepSlug];
        }
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));

        const userId = session?.user.id;
        if (userId) {
          getStepIds()
            .then(async (stepIds) => {
              const stepId = stepIds.get(stepSlug);
              if (!stepId) return;
              const supabase = getBrowserClient();
              if (nowDone) {
                await supabase.from("user_progress").upsert({
                  user_id: userId,
                  step_id: stepId,
                  status: "done",
                });
              } else {
                await supabase
                  .from("user_progress")
                  .delete()
                  .eq("user_id", userId)
                  .eq("step_id", stepId);
              }
            })
            .catch((error) => console.error("Progress sync failed:", error));
        }
        return next;
      });
    },
    [session, getStepIds],
  );

  const markStepsDone = useCallback(
    (stepSlugs: string[]) => {
      setProgress((prev) => {
        const fresh = stepSlugs.filter((slug) => !prev[slug]);
        if (fresh.length === 0) return prev;
        const next: ProgressMap = { ...prev };
        for (const slug of fresh) next[slug] = "done";
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));

        const userId = session?.user.id;
        if (userId) {
          getStepIds()
            .then(async (stepIds) => {
              const rows = fresh
                .map((slug) => {
                  const stepId = stepIds.get(slug);
                  return stepId
                    ? {
                        user_id: userId,
                        step_id: stepId,
                        status: "done" as const,
                      }
                    : null;
                })
                .filter((row) => row !== null);
              if (rows.length > 0) {
                await getBrowserClient().from("user_progress").upsert(rows);
              }
            })
            .catch((error) => console.error("Progress sync failed:", error));
        }
        return next;
      });
    },
    [session, getStepIds],
  );

  const resetProgress = useCallback(() => {
    setProgress({});
    window.localStorage.removeItem(PROGRESS_KEY);
    const userId = session?.user.id;
    if (userId) {
      getBrowserClient()
        .from("user_progress")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error("Progress reset sync failed:", error);
        });
    }
  }, [session]);

  const signOut = useCallback(async () => {
    await getBrowserClient().auth.signOut();
    syncedUserRef.current = null;
  }, []);

  const value = useMemo(
    () => ({
      ready,
      profile,
      progress,
      session,
      setProfile,
      toggleStep,
      markStepsDone,
      resetProgress,
      signOut,
    }),
    [
      ready,
      profile,
      progress,
      session,
      setProfile,
      toggleStep,
      markStepsDone,
      resetProgress,
      signOut,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useVisitorProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useVisitorProfile must be used inside <ProfileProvider>");
  }
  return ctx;
}
