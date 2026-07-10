import { createStaticClient } from "@/lib/supabase/server";
import { getCityBySlug, getVariant, type City, type Variant } from "@/lib/queries/guide";
import type { Tables } from "@/lib/database.types";

/**
 * The phased chronological journey (Increment H) — the Emergent "GuideJourney".
 * Composes `journey_phases` + `journey_steps` with, for task-backed steps, the
 * verified task/guide content and (on a city page) the per-city office variant.
 * Standalone "life" steps (accommodation, SIM, learn German…) carry their own
 * copy and render as honest skeletons until the content pipeline fills them.
 */

export type JourneyStep = {
  id: string;
  title: string;
  titleDe: string | null;
  summary: string | null;
  icon: string | null;
  appliesLabel: string;
  citySpecific: boolean;
  isSkeleton: boolean;
  detailsMd: string | null;
  documents: string[];
  tips: string[];
  noteMd: string | null;
  cityInfo: Variant | null;
  fullGuideHref: string | null;
};

export type JourneyPhase = {
  slug: string;
  title: string;
  subtitle: string | null;
  steps: JourneyStep[];
};

// audience tag → plural label for the "who this applies to" chip.
const AUDIENCE_LABELS: Record<string, string> = {
  student: "Students",
  worker: "Workers",
  refugee: "Refugees",
  eu: "EU citizens",
  "non-eu": "Non-EU",
  family: "Family",
};
// The set that means "everyone" (non-eu is a modifier, not its own group).
const CORE_AUDIENCES = ["student", "worker", "refugee", "eu", "family"];

function appliesLabel(audience: string[]): string {
  const core = CORE_AUDIENCES.filter((a) => audience.includes(a));
  if (core.length === 0) return "Everyone";
  if (core.length >= CORE_AUDIENCES.length) return "Everyone";
  return core.map((a) => AUDIENCE_LABELS[a] ?? a).join(" · ");
}

type StepRow = Tables<"journey_steps"> & {
  task:
    | (Pick<Tables<"tasks">, "slug" | "title_en" | "title_de" | "summary" | "audience"> & {
        guides: (Pick<
          Tables<"guides">,
          "intro_md" | "documents_md" | "status"
        > & { checklist_steps: Pick<Tables<"checklist_steps">, "doc_names">[] })[];
      })
    | null;
};

export async function getJourney(
  persona = "student",
  citySlug?: string
): Promise<{ phases: JourneyPhase[]; city: City | null }> {
  const supabase = createStaticClient();

  const [{ data: phaseRows }, { data: stepRows }] = await Promise.all([
    supabase.from("journey_phases").select("*").order("sort_order"),
    supabase
      .from("journey_steps")
      .select(
        "*, task:tasks(slug,title_en,title_de,summary,audience,guides(intro_md,documents_md,status,checklist_steps(doc_names)))"
      )
      .eq("persona", persona)
      .eq("locale", "en")
      .order("phase_order"),
  ]);

  const city = citySlug ? await getCityBySlug(citySlug) : null;

  // Fetch the per-city office variant for each city-specific, task-backed step
  // (getVariant carries the ABH-office fallback for visa-conversion etc.).
  const steps = (stepRows ?? []) as StepRow[];
  const variantByStepId = new Map<string, Variant | null>();
  if (city) {
    await Promise.all(
      steps
        .filter((s) => s.city_specific && s.task_id)
        .map(async (s) => {
          variantByStepId.set(s.id, await getVariant(city.id, s.task_id!));
        })
    );
  }

  const byPhase = new Map<string, JourneyStep[]>();
  for (const s of steps) {
    const task = s.task;
    const guide = task?.guides?.find((g) => g.status === "published") ?? null;
    const documents = guide
      ? [...new Set(guide.checklist_steps.flatMap((c) => c.doc_names))]
      : s.documents;

    const step: JourneyStep = {
      id: s.slug,
      title: task?.title_en ?? s.title_en ?? s.slug,
      titleDe: task?.title_de ?? s.title_de,
      summary: task?.summary ?? s.summary,
      icon: s.icon,
      appliesLabel: appliesLabel(
        task?.audience && task.audience.length ? task.audience : s.applies_to
      ),
      citySpecific: s.city_specific,
      // Skeleton = a life step with no verified guide behind it yet.
      isSkeleton: !s.task_id && s.status !== "published",
      detailsMd: guide?.intro_md ?? s.details_md,
      documents,
      tips: s.tips,
      noteMd: s.note_md,
      cityInfo: variantByStepId.get(s.id) ?? null,
      fullGuideHref: task
        ? city
          ? `/germany/${city.slug}/${task.slug}`
          : `/tasks/${task.slug}`
        : null,
    };
    const list = byPhase.get(s.phase) ?? [];
    list.push(step);
    byPhase.set(s.phase, list);
  }

  const phases: JourneyPhase[] = (phaseRows ?? [])
    .map((p) => ({
      slug: p.slug,
      title: p.name_en,
      subtitle: p.subtitle_en,
      steps: byPhase.get(p.slug) ?? [],
    }))
    .filter((p) => p.steps.length > 0);

  return { phases, city };
}
