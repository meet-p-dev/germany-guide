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
    steps: stepsRes.data.filter((step) => step.phase_id === phase.id),
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

/** Which steps apply to a persona ("both" always applies; unknown persona sees all). */
export function stepAppliesTo(step: Step, persona: Persona | null): boolean {
  if (!persona) return true;
  return step.applies_to === "both" || step.applies_to === persona;
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
