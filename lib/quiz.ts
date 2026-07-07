/**
 * The hinge quiz (Increment 3). Five questions capture visa type, city, family
 * situation, arrival timeline, and current stage; the final screen assembles a
 * read-only plan from the SAME tasks/audience data the explore pages use.
 *
 * Honest scope (confirmed): persona (Q1) filters the six stages; current stage
 * (Q5) marks "you are here". City (Q2) is recorded + linked (city-specific rule
 * injection is Increment 4). Family (Q3) + timeline (Q4) are captured but do
 * NOT drive the task list yet (family needs the `family` audience tag; deadline
 * logic is Increment 6) — shown as recorded, never faked.
 */

export type CityOption = { slug: string; label: string };
export type StageOption = { value: number; label: string };

export type QuizAnswers = {
  persona?: string; // Q1 slug
  city?: string | null; // Q2 city slug, or null = not decided
  family?: string; // Q3
  timeline?: string; // Q4
  stage?: number; // Q5: current stage 1..6, or 7 = mostly settled
};

export type Option = { value: string; label: string };

/** Q1 persona → the tasks.audience tag we can actually filter on today. */
const PERSONA_TAG: Record<string, string | null> = {
  student: "student",
  "skilled-worker": "worker",
  "eu-citizen": "eu",
  refugee: "refugee",
  "joining-family": "family", // no rows carry this tag yet → treated as unfiltered
  other: null,
};

/** Tags that actually exist in the content today. */
const SUPPORTED_TAGS = new Set(["student", "worker", "eu", "refugee"]);

export function personaTag(persona?: string): string | null {
  const tag = persona ? PERSONA_TAG[persona] : null;
  return tag && SUPPORTED_TAGS.has(tag) ? tag : null;
}

/** True when Q1 has a persona we can't yet filter on (joining-family / other). */
export function isUnfilteredPersona(persona?: string): boolean {
  return !!persona && personaTag(persona) === null;
}

// Static question option sets (Q2 cities and Q5 stages are built at runtime
// from the DB, so they live in the flow, not here).
export const Q1_PERSONA: Option[] = [
  { value: "student", label: "Student" },
  { value: "skilled-worker", label: "Skilled worker" },
  { value: "eu-citizen", label: "EU citizen" },
  { value: "refugee", label: "Refugee" },
  { value: "joining-family", label: "Joining family" },
  { value: "other", label: "Other / not sure" },
];

export const Q3_FAMILY: Option[] = [
  { value: "alone", label: "Just me" },
  { value: "partner", label: "With a partner" },
  { value: "children", label: "With children" },
  { value: "partner-children", label: "A partner and children" },
];

export const Q4_TIMELINE: Option[] = [
  { value: "planning", label: "Still planning my move" },
  { value: "weeks", label: "In the next few weeks" },
  { value: "recent", label: "I arrived recently" },
  { value: "settled-in", label: "I've been here a while" },
];

// ── Plan assembly ────────────────────────────────────────────────────────
export type PlanStage<T> = {
  id: string;
  slug: string;
  name_en: string;
  tasks: T[];
  status: "done" | "now" | "upcoming";
};

type CategoryLike<T> = {
  id: string;
  slug: string;
  name_en: string;
  tasks: T[];
};
type TaskLike = { audience: string[] | null };

/**
 * Filter each stage's tasks by the persona tag (unfiltered for
 * joining-family / other) and mark done/now/upcoming from the current stage.
 */
export function assemblePlan<T extends TaskLike>(
  categories: CategoryLike<T>[],
  answers: QuizAnswers
): PlanStage<T>[] {
  const tag = personaTag(answers.persona);
  const current = answers.stage ?? 1; // 1..6, or 7 = settled
  return categories.map((c, i) => {
    const index = i + 1;
    const tasks = tag
      ? c.tasks.filter((t) => (t.audience ?? []).includes(tag))
      : c.tasks;
    const status: PlanStage<T>["status"] =
      index < current ? "done" : index === current ? "now" : "upcoming";
    return { id: c.id, slug: c.slug, name_en: c.name_en, tasks, status };
  });
}
