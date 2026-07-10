/**
 * The single plan model shared by BOTH plan views:
 *   - the full roadmap (/roadmap)      → every step as a checklist
 *   - the guided view  (/dashboard)    → one step at a time
 *
 * Both are built from the SAME ordered phase list here, so a step's order and
 * grouping are identical no matter which view you're in. Ordering = category
 * order from the DB, filtered to the persona's audience tag (null tag = show
 * everything, e.g. the "other / not sure" persona).
 */
import { STAGE_FRAMING } from "@/lib/journey-copy";

export type PlanStep = {
  slug: string;
  titleEn: string;
  titleDe: string;
  summary: string | null;
};
export type PlanPhase = {
  slug: string;
  name: string;
  framing: string;
  steps: PlanStep[];
};

export type PlanTaskInput = {
  slug: string;
  title_en: string;
  title_de: string;
  summary: string | null;
  audience: string[] | null;
};
export type PlanCategoryInput = {
  slug: string;
  name_en: string;
  tasks: PlanTaskInput[];
};

/** Ordered phases for a persona. `personaTag = null` → unfiltered (all tasks). */
export function buildPersonaPhases(
  categories: PlanCategoryInput[],
  personaTag: string | null
): PlanPhase[] {
  return categories
    .map((c) => ({
      slug: c.slug,
      name: c.name_en,
      framing: STAGE_FRAMING[c.slug] ?? "",
      steps: c.tasks
        .filter(
          (t) => personaTag === null || (t.audience ?? []).includes(personaTag)
        )
        .map((t) => ({
          slug: t.slug,
          titleEn: t.title_en,
          titleDe: t.title_de,
          summary: t.summary,
        })),
    }))
    .filter((p) => p.steps.length > 0);
}

/** Flat, ordered list of steps across all phases (the guided view walks this). */
export function flattenPhases(phases: PlanPhase[]): PlanStep[] {
  return phases.flatMap((p) => p.steps);
}
