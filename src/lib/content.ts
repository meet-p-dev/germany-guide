import { cache } from "react";
import { createContentClient } from "@/lib/supabase/content-client";
import type { Tables } from "@/lib/supabase/types";

export type Phase = Tables<"phases">;
export type Step = Tables<"steps">;
export type City = Tables<"cities">;
export type CityStep = Tables<"city_steps">;
export type GlossaryTerm = Tables<"glossary_terms">;
export type Problem = Tables<"problems">;
export type Letter = Tables<"letters">;
export type Update = Tables<"updates">;
export type CityFact = Tables<"city_facts">;

/** The city-hub sections, in the order they should render. */
export const CITY_FACT_CATEGORIES = [
  "first_days",
  "housing",
  "insurance",
  "banking",
  "while_waiting",
] as const;
export type CityFactCategory = (typeof CITY_FACT_CATEGORIES)[number];

export const CITY_FACT_LABELS: Record<CityFactCategory, string> = {
  first_days: "Your first days",
  housing: "Housing & rent",
  insurance: "Health insurance",
  banking: "Banking",
  while_waiting: "While you wait",
};

export type Persona = "student" | "worker";
export type Stage = "exploring" | "applied" | "moving" | "arrived";

export interface StepDocument {
  name: string;
  note?: string;
}

export interface StepLink {
  label: string;
  url: string;
}

export interface PhaseWithSteps extends Phase {
  steps: Step[];
}

/**
 * "Understand your two main paths" is orientation, not a checklist item — it
 * belongs to choosing student vs worker in the plan wizard, so it stays out of
 * the journey/process listings. The page itself remains live at /guide/….
 */
export const PATHS_EXPLAINER_SLUG = "understand-your-paths";

export const getPhasesWithSteps = cache(async (): Promise<PhaseWithSteps[]> => {
  const supabase = createContentClient();
  const [phasesRes, stepsRes] = await Promise.all([
    supabase.from("phases").select("*").order("sort_order"),
    supabase.from("steps").select("*").order("sort_order"),
  ]);
  if (phasesRes.error) throw phasesRes.error;
  if (stepsRes.error) throw stepsRes.error;
  return phasesRes.data.map((phase) => ({
    ...phase,
    steps: stepsRes.data.filter(
      (step) =>
        step.phase_id === phase.id && step.slug !== PATHS_EXPLAINER_SLUG,
    ),
  }));
});

export const getStepBySlug = cache(async (slug: string) => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("steps")
    .select("*, phases(*), city_steps(*, cities(*))")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
});

export const getAllStepSlugs = cache(async () => {
  const supabase = createContentClient();
  const { data, error } = await supabase.from("steps").select("slug");
  if (error) throw error;
  return data.map((row) => row.slug);
});

export interface StepGraphNode {
  slug: string;
  title: string;
  depends_on: string[];
}

/** Lightweight slug → {title, prerequisites} map for rendering dependencies. */
export const getStepGraph = cache(async (): Promise<StepGraphNode[]> => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("steps")
    .select("slug, title, depends_on");
  if (error) throw error;
  return data;
});

export const getCityStepPairs = cache(async () => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("city_steps")
    .select("cities(slug), steps(slug)");
  if (error) throw error;
  return data
    .filter((row) => row.cities && row.steps)
    .map((row) => ({ city: row.cities!.slug, step: row.steps!.slug }));
});

export const getCities = cache(async (): Promise<City[]> => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
});

export const getCityBySlug = cache(async (slug: string) => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*, city_steps(*, steps(*, phases(*)))")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
});

/** Per-city reference facts (housing/rent, dorms, offices…), grouped for the hub. */
export const getCityFacts = cache(
  async (citySlug: string): Promise<CityFact[]> => {
    const supabase = createContentClient();
    const { data, error } = await supabase
      .from("city_facts")
      .select("*, cities!inner(slug)")
      .eq("cities.slug", citySlug)
      .order("sort_order");
    if (error) throw error;
    // Drop the joined `cities` shape so callers get plain CityFact rows.
    return data.map((row) => {
      const rec = { ...row } as Record<string, unknown>;
      delete rec.cities;
      return rec as unknown as CityFact;
    });
  },
);

export const getGlossaryTerms = cache(async (): Promise<GlossaryTerm[]> => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select("*")
    .order("term");
  if (error) throw error;
  return data;
});

export const getProblems = cache(async (): Promise<Problem[]> => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
});

export const getProblemBySlug = cache(async (slug: string) => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
});

export const getLetters = cache(async (): Promise<Letter[]> => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data;
});

export const getLetterBySlug = cache(async (slug: string) => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
});

export const getUpdates = cache(async (): Promise<Update[]> => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("updates")
    .select("*")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
});

export const getLatestUpdate = cache(async (): Promise<Update | null> => {
  const supabase = createContentClient();
  const { data, error } = await supabase
    .from("updates")
    .select("*")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
});

/** Which steps apply to a persona ("both" always applies; unknown persona sees all). */
export function stepAppliesTo(step: Step, persona: Persona | null): boolean {
  if (!persona) return true;
  return step.applies_to === "both" || step.applies_to === persona;
}

export const PERSONA_LABELS: Record<Persona, string> = {
  student: "student",
  worker: "skilled worker",
};

/**
 * Fill a hand-written `quick_action` template with the visitor's real figures.
 * One template per step serves all 36 cities: `{operator}` / `{cost}` / etc.
 * resolve from the city variant + persona; any blank we can't fill is dropped
 * (never shown as a literal `{token}`), and leftover punctuation is tidied.
 */
export function renderQuickAction(
  template: string,
  tokens: Record<string, string | null | undefined>,
): string {
  const has = (key: string) => {
    const v = tokens[key];
    return typeof v === "string" && v.trim().length > 0;
  };
  let out = template;
  // Drop any (parenthetical) that leans on a blank we can't fill.
  out = out.replace(/\s*\([^()]*\{(\w+)\}[^()]*\)/g, (m, key: string) =>
    has(key) ? m : "",
  );
  // Substitute remaining tokens; an unfillable one takes its leading
  // connector (" - ", " . ", " , ") with it so no orphan punctuation is left.
  out = out.replace(/(\s*[-.,;:]?\s*)\{(\w+)\}/g, (_m, lead: string, key: string) => {
    if (!has(key)) return "";
    return `${lead}${tokens[key]!.trim()}`;
  });
  out = out
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
  return out;
}

/** The phase a visitor at a given stage should start at. */
export function startPhaseForStage(stage: Stage | null): string {
  switch (stage) {
    case "applied":
      return "prepare";
    case "moving":
      return "prepare";
    case "arrived":
      return "arrive";
    default:
      return "decide";
  }
}

export function parseDocuments(json: unknown): StepDocument[] {
  return Array.isArray(json) ? (json as StepDocument[]) : [];
}

export function parseLinks(json: unknown): StepLink[] {
  return Array.isArray(json) ? (json as StepLink[]) : [];
}

export function parseTips(json: unknown): string[] {
  return Array.isArray(json) ? (json as string[]) : [];
}

export interface PersonaPoints {
  student: string[];
  worker: string[];
}

/** Compact per-path bullets; null when the step has none for either path. */
export function parsePersonaPoints(json: unknown): PersonaPoints | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const obj = json as Record<string, unknown>;
  const list = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const student = list(obj.student);
  const worker = list(obj.worker);
  if (student.length === 0 && worker.length === 0) return null;
  return { student, worker };
}

export type CostType =
  | "one_time"
  | "monthly"
  | "deposit"
  | "proof_of_funds"
  | "none";

/** Cost/timing that a city variant can override on top of the base step. */
export interface StepMeta {
  costCents: number | null;
  costType: CostType | null;
  costNote: string | null;
  deadlineRule: string | null;
  deadlineUrgency: "hard" | "soft" | null;
  leadTime: string | null;
}

/** Merge a step's base cost/timing with a city override (city wins per field). */
export function resolveStepMeta(
  step: Pick<
    Step,
    | "cost_cents"
    | "cost_type"
    | "cost_note"
    | "deadline_rule"
    | "deadline_urgency"
    | "lead_time"
  >,
  city?: Pick<
    CityStep,
    | "cost_cents"
    | "cost_type"
    | "cost_note"
    | "deadline_rule"
    | "deadline_urgency"
    | "lead_time"
  > | null,
): StepMeta {
  const pick = <T>(c: T | null | undefined, s: T | null): T | null =>
    c !== null && c !== undefined ? c : s;
  return {
    costCents: pick(city?.cost_cents, step.cost_cents),
    costType: pick(city?.cost_type, step.cost_type) as CostType | null,
    costNote: pick(city?.cost_note, step.cost_note),
    deadlineRule: pick(city?.deadline_rule, step.deadline_rule),
    deadlineUrgency: pick(city?.deadline_urgency, step.deadline_urgency) as
      | "hard"
      | "soft"
      | null,
    leadTime: pick(city?.lead_time, step.lead_time),
  };
}

const EURO = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

/** "€100", "€18.36 / mo", "€11,904 to show" — null when there's nothing to say. */
export function formatCost(
  cents: number | null,
  type: CostType | null,
): string | null {
  if (type === "none") return "Free";
  if (cents === null || cents === undefined) return null;
  const amount = EURO.format(cents / 100).replace(/\.00$/, "");
  switch (type) {
    case "monthly":
      return `${amount} / mo`;
    case "proof_of_funds":
      return `${amount} to show`;
    case "deposit":
      return `${amount} deposit`;
    default:
      return amount;
  }
}

/** Only genuine one-off fees count toward the "fees you'll pay" total. */
export function isPayableFee(type: CostType | null): boolean {
  return type === "one_time" || type === "deposit";
}
