import type { Metadata } from "next";
import {
  getStatesWithCities,
  getStudentJourney,
  getTasksByCategory,
} from "@/lib/queries/guide";
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
  const [categories, states, glossaryTerms, journey] = await Promise.all([
    getTasksByCategory(),
    getStatesWithCities(),
    getGlossaryTerms(),
    getStudentJourney("student", "en"),
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

  // Build the chronological journey the client uses for the STUDENT persona.
  // runs_parallel_with is stored as task ids; resolve to slugs here (server side)
  // so the client can render honest "around the same time" hints by slug.
  const taskIdToSlug = new Map<string, string>();
  for (const c of categories)
    for (const t of c.tasks) taskIdToSlug.set(t.id, t.slug);

  const journeyPhases = journey.phases.map((p) => ({
    slug: p.slug,
    name_en: p.name_en,
    sort_order: p.sort_order,
  }));
  const journeySteps = journey.steps.map((s) => ({
    task: s.tasks
      ? {
          slug: s.tasks.slug,
          title_en: s.tasks.title_en,
          title_de: s.tasks.title_de,
          summary: s.tasks.summary,
          audience: s.tasks.audience,
        }
      : null,
    phase: s.phase,
    phase_order: s.phase_order,
    note_md: s.note_md,
    parallelSlugs: s.runs_parallel_with
      .map((id) => taskIdToSlug.get(id))
      .filter((v): v is string => !!v),
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
    <GuidedDashboard
      categories={cats}
      cities={cities}
      glossary={glossary}
      journeyPhases={journeyPhases}
      journeySteps={journeySteps}
    />
  );
}
