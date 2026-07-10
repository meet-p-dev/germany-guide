import Link from "next/link";
import type { Metadata } from "next";
import { getCityBySlug, getTasksByCategory } from "@/lib/queries/guide";
import { getGlossaryTerms } from "@/lib/queries/content";
import { PERSONA_BY_SLUG } from "@/lib/persona-copy";
import { buildPersonaPhases } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { GuidedPlan } from "@/components/plan/GuidedPlan";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Your plan — one step at a time",
  description:
    "Your personal plan, guided: the current step lit, done steps folded away, the rest waiting their turn.",
  robots: { index: false, follow: false }, // personal view
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; city?: string }>;
}) {
  const { persona: personaSlug, city: citySlug } = await searchParams;

  // No plan chosen yet → one calm invitation into the single funnel.
  if (!personaSlug) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Your guided plan lives here
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tell us your situation and city, and we’ll turn the whole
          German-bureaucracy map into one next step at a time.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full font-semibold">
          <Link href="/explore">Build my plan</Link>
        </Button>
      </div>
    );
  }

  // Known persona → filter by its audience tag; unknown (e.g. "other") →
  // unfiltered (show every step), same as the quiz's "not sure" path.
  const persona = PERSONA_BY_SLUG[personaSlug];
  const personaTag = persona ? persona.tag : null;
  const personaLabel = persona ? persona.label : "newcomer";

  const [categories, city, glossaryTerms] = await Promise.all([
    getTasksByCategory(),
    citySlug ? getCityBySlug(citySlug) : Promise.resolve(null),
    getGlossaryTerms(),
  ]);

  const cats = categories.map((c) => ({
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

  const phases = buildPersonaPhases(cats, personaTag);
  const guidedCity = city ? { slug: city.slug, name: city.name_en } : null;
  const glossary = glossaryTerms.map((g) => ({
    term_de: g.term_de,
    term_en: g.term_en,
  }));

  return (
    <GuidedPlan
      persona={personaSlug}
      personaLabel={personaLabel}
      city={guidedCity}
      phases={phases}
      glossary={glossary}
    />
  );
}
