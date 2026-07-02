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

export async function searchContent(q: string) {
  const supabase = createStaticClient();
  const { data, error } = await supabase.rpc("search_content", { q });
  if (error) throw error;
  return data ?? [];
}
