"use server";

import {
  getCityBySlug,
  getVariant,
  getTaskWithGuide,
} from "@/lib/queries/guide";

/** The compact city-specific payload the "now" card needs — nothing more. */
export type GuidedStepData = {
  taskSlug: string;
  cityName: string | null;
  /** true when this city has verified overrides for this task. */
  hasCityVariant: boolean;
  officeName: string | null;
  waitTime: string | null;
  /** City-specific rule text (markdown), injected into the current step. */
  cityNoteMd: string | null;
  /** Distinct documents across the guide's checklist, for the card's meta. */
  docCount: number | null;
  /** Where "show me how, step by step" navigates. */
  detailHref: string;
};

/**
 * Compose the city-specific facts for the ONE step the user is on. Read-only
 * over already-public content (no auth, no writes) — it re-uses the same
 * queries the city/task page uses, scoped to a single task+city so the
 * dashboard never preloads the whole plan's data. Called again only when the
 * user advances to the next step.
 */
export async function getGuidedStepData(
  taskSlug: string,
  citySlug: string | null
): Promise<GuidedStepData> {
  const task = await getTaskWithGuide(taskSlug);
  const guide = task?.guides?.[0] ?? null;
  const docCount = guide
    ? new Set(guide.checklist_steps.flatMap((s) => s.doc_names ?? [])).size ||
      null
    : null;

  // No city chosen ("not decided yet") → the generic nationwide guide.
  if (!citySlug || !task) {
    return {
      taskSlug,
      cityName: null,
      hasCityVariant: false,
      officeName: null,
      waitTime: null,
      cityNoteMd: null,
      docCount,
      detailHref: `/tasks/${taskSlug}`,
    };
  }

  const city = await getCityBySlug(citySlug);
  const variant = city ? await getVariant(city.id, task.id) : null;

  return {
    taskSlug,
    cityName: city?.name_en ?? null,
    hasCityVariant: !!variant,
    officeName: variant?.office_name ?? null,
    waitTime: variant?.typical_wait_time ?? null,
    cityNoteMd: variant?.city_notes_md ?? null,
    docCount,
    detailHref: city ? `/germany/${city.slug}/${taskSlug}` : `/tasks/${taskSlug}`,
  };
}
