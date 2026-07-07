import type { Metadata } from "next";
import { getStatesWithCities, getTasksByCategory } from "@/lib/queries/guide";
import { getGlossaryTerms } from "@/lib/queries/content";
import { GuidedDashboard } from "@/components/dashboard/GuidedDashboard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Your dashboard",
  description:
    "Your personal plan, one step at a time — the current step lit, done steps folded away, the rest waiting their turn.",
  robots: { index: false, follow: false }, // personal, session-only view
};

export default async function DashboardPage() {
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
    <GuidedDashboard categories={cats} cities={cities} glossary={glossary} />
  );
}
