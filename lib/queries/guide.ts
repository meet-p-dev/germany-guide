import { createStaticClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type City = Tables<"cities"> & { states: Tables<"states"> | null };
export type Task = Tables<"tasks"> & {
  task_categories: Tables<"task_categories"> | null;
};
export type Guide = Tables<"guides"> & {
  checklist_steps: Tables<"checklist_steps">[];
};
export type Variant = Tables<"city_task_variants"> & {
  city_step_overrides: Tables<"city_step_overrides">[];
};

export type MergedStep = {
  /** checklist_steps.id for base/replaced steps, city_step_overrides.id for inserted ones */
  key: string;
  /** which progress column the key belongs to when syncing to user_task_progress */
  keyKind: "step" | "override";
  stepNo: number;
  title: string;
  body: string | null;
  docNames: string[];
  isOptional: boolean;
  isCitySpecific: boolean;
};

export async function getStatesWithCities() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("states")
    .select("*, cities(*)")
    .order("name_en");
  if (error) throw error;
  return (data ?? []).filter((s) => s.cities.length > 0);
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("cities")
    .select("*, states(*)")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getTasksByCategory() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("task_categories")
    .select("*, tasks(*)")
    .order("sort_order");
  if (error) throw error;
  return (data ?? [])
    .map((c) => ({
      ...c,
      tasks: c.tasks.sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter((c) => c.tasks.length > 0);
}

export async function getTaskWithGuide(
  taskSlug: string
): Promise<(Task & { guides: Guide[] }) | null> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("tasks")
    .select("*, task_categories(*), guides(*, checklist_steps(*))")
    .eq("slug", taskSlug)
    .maybeSingle();
  if (!data) return null;
  data.guides.forEach((g) =>
    g.checklist_steps.sort((a, b) => a.step_no - b.step_no)
  );
  return data;
}

export async function getVariant(
  cityId: string,
  taskId: string
): Promise<Variant | null> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("city_task_variants")
    .select("*, city_step_overrides(*)")
    .eq("city_id", cityId)
    .eq("task_id", taskId)
    .maybeSingle();
  return data;
}

/** Variants for a whole city keyed by task_id — powers the city dashboard badges. */
export async function getVariantsForCity(cityId: string) {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("city_task_variants")
    .select("*")
    .eq("city_id", cityId);
  if (error) throw error;
  return new Map((data ?? []).map((v) => [v.task_id, v]));
}

/**
 * The app's core algorithm: overlay a city's step overrides onto the generic
 * checklist. `replace`/`hide` target a base step by id; `insert` splices a
 * city-only step after the given base step number (0 = before everything).
 */
export function mergeSteps(
  steps: Tables<"checklist_steps">[],
  overrides: Tables<"city_step_overrides">[]
): MergedStep[] {
  const byBaseStep = new Map(
    overrides.filter((o) => o.base_step_id).map((o) => [o.base_step_id!, o])
  );

  const merged: MergedStep[] = [];
  for (const step of steps) {
    const override = byBaseStep.get(step.id);
    if (override?.action === "hide") continue;
    if (override?.action === "replace") {
      merged.push({
        key: step.id,
        keyKind: "step",
        stepNo: step.step_no,
        title: override.title_en ?? step.title_en,
        body: override.body_md ?? step.body_md,
        docNames: step.doc_names,
        isOptional: step.is_optional,
        isCitySpecific: true,
      });
    } else {
      merged.push({
        key: step.id,
        keyKind: "step",
        stepNo: step.step_no,
        title: step.title_en,
        body: step.body_md,
        docNames: step.doc_names,
        isOptional: step.is_optional,
        isCitySpecific: false,
      });
    }
  }

  const inserts = overrides
    .filter((o) => o.action === "insert")
    .sort((a, b) => (a.insert_after_step_no ?? 0) - (b.insert_after_step_no ?? 0));
  for (const ins of inserts) {
    const after = ins.insert_after_step_no ?? 0;
    const idx = merged.findLastIndex((s) => s.stepNo <= after);
    merged.splice(idx + 1, 0, {
      key: ins.id,
      keyKind: "override",
      stepNo: after,
      title: ins.title_en ?? "",
      body: ins.body_md,
      docNames: [],
      isOptional: true,
      isCitySpecific: true,
    });
  }

  return merged;
}
