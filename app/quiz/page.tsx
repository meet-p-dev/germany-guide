import type { Metadata } from "next";
import { getStatesWithCities, getTasksByCategory } from "@/lib/queries/guide";
import { getGlossaryTerms } from "@/lib/queries/content";
import { QuizFlow } from "@/components/quiz/QuizFlow";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Build your personal plan",
  description:
    "Five quick questions turn the whole German-bureaucracy map into a plan that shows just your next step.",
};

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>;
}) {
  const { persona } = await searchParams;

  const [categories, states, glossaryTerms] = await Promise.all([
    getTasksByCategory(),
    getStatesWithCities(),
    getGlossaryTerms(),
  ]);

  const cats = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name_en: c.name_en,
    tasks: c.tasks.map((t) => ({
      slug: t.slug,
      title_en: t.title_en,
      title_de: t.title_de,
      summary: t.summary,
      audience: t.audience,
    })),
  }));

  const cities = states
    .flatMap((s) => s.cities.filter((c) => c.is_published))
    .map((c) => ({ slug: c.slug, label: c.name_en }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const glossary = glossaryTerms.map((g) => ({
    term_de: g.term_de,
    term_en: g.term_en,
  }));

  return (
    <QuizFlow
      categories={cats}
      cities={cities}
      glossary={glossary}
      personaPrefill={persona}
    />
  );
}
