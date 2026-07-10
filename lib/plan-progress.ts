/**
 * ONE persistent progress store, shared by the roadmap and the guided view so
 * they can never disagree. Keyed by persona + city, saved in localStorage (not
 * sessionStorage), so a plan survives a refresh and a closed tab.
 *
 * Pure functions only — they touch localStorage lazily inside each call, so this
 * module is safe to import from anywhere; it just no-ops if storage is missing.
 */
const KEY = "gg-plan-progress-v1";

type Store = Record<string, string[]>;

/** Stable key for a (persona, city) plan. Cityless plans share one bucket. */
export function planKey(persona: string, citySlug?: string | null): string {
  return `${persona}:${citySlug ?? "generic"}`;
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable / full — progress just isn't persisted */
  }
}

/** Completed step slugs for a plan (empty if none / unavailable). */
export function loadCompleted(key: string): string[] {
  return read()[key] ?? [];
}

/** Overwrite the completed slugs for a plan. */
export function saveCompleted(key: string, slugs: string[]): void {
  const store = read();
  store[key] = slugs;
  write(store);
}
