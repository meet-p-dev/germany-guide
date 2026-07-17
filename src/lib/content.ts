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
