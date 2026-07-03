import { createStaticClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Problem = Tables<"problems">;
export type Solution = Tables<"solutions"> & {
  cities: Pick<Tables<"cities">, "slug" | "name_en"> | null;
};

export async function getProblems() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*, task_categories(slug, name_en)")
    .order("severity", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getProblemBySlug(slug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("problems")
    .select("*, task_categories(slug, name_en), solutions(*, cities(slug, name_en))")
    .eq("slug", slug)
    .maybeSingle();
  if (data) {
    data.solutions.sort((a, b) => a.sort_order - b.sort_order);
  }
  return data;
}

export async function getTasksByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("tasks")
    .select("slug, title_en, title_de")
    .in("id", ids);
  return data ?? [];
}

export async function getLetters() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("letters")
    .select("*")
    .order("urgency", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getLetterBySlug(slug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("letters")
    .select("*, tasks(slug, title_en)")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getGlossaryTerms() {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("glossary_terms")
    .select("*")
    .order("term_de");
  if (error) throw error;
  return data ?? [];
}

export async function getGlossaryTermBySlug(slug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("glossary_terms")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export type PartnerOffer = Tables<"partner_offers">;

// Offers ("recommended services") shown on a task page: affiliate providers
// plus our own apps. Only published rows are visible (RLS), so unfilled slots
// simply don't render.
export async function getPartnerOffers(taskSlug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("partner_offers")
    .select("*")
    .contains("task_slugs", [taskSlug])
    .order("sort_order", { ascending: true });
  return (data ?? []) as PartnerOffer[];
}

// Related problems + glossary terms for a task, for the "Related" section on
// guide pages (internal linking + helps users find more).
export async function getRelatedContent(taskId: string) {
  const supabase = createStaticClient();
  const [problems, glossary] = await Promise.all([
    supabase
      .from("problems")
      .select("slug, title_en")
      .contains("related_task_ids", [taskId])
      .limit(6),
    supabase
      .from("glossary_terms")
      .select("slug, term_de, term_en")
      .contains("related_task_ids", [taskId])
      .limit(8),
  ]);
  return { problems: problems.data ?? [], glossary: glossary.data ?? [] };
}

export type CommuterArea = Tables<"commuter_areas">;

// Nearby towns you could live in and commute from — the unique "where to
// actually afford to live near [city]" data, shown on each city page.
export async function getCommuterAreas(cityId: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("commuter_areas")
    .select("*")
    .eq("city_id", cityId)
    .order("sort_order", { ascending: true });
  return (data ?? []) as CommuterArea[];
}

export async function searchContent(q: string) {
  const supabase = createStaticClient();
  const { data, error } = await supabase.rpc("search_content", { q });
  if (error) throw error;
  return data ?? [];
}
