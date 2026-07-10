import Link from "next/link";
import type { Metadata } from "next";
import { getTasksByCategory, getCityBySlug } from "@/lib/queries/guide";
import { PERSONA_BY_SLUG } from "@/lib/persona-copy";
import { PERSONA_UI, FALLBACK_PERSONA_ICON } from "@/lib/persona-ui";
import { buildPersonaPhases } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { RoadmapView, type RoadmapCity } from "@/components/RoadmapView";

// Personalised tool, not a content page — keep it out of the index.
export const metadata: Metadata = {
  title: "My roadmap",
  robots: { index: false, follow: false },
};

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; city?: string }>;
}) {
  const { persona: personaSlug, city: citySlug } = await searchParams;
  const persona = personaSlug ? PERSONA_BY_SLUG[personaSlug] : undefined;

  // No / unknown persona → gentle prompt back into the wizard.
  if (!persona) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Let&apos;s set up your roadmap
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tell us your situation and city, and we&apos;ll build a personalised,
          step-by-step plan.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full font-semibold">
          <Link href="/explore">Build my plan</Link>
        </Button>
      </div>
    );
  }

  const [categories, city] = await Promise.all([
    getTasksByCategory(),
    citySlug ? getCityBySlug(citySlug) : Promise.resolve(null),
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
  const phases = buildPersonaPhases(cats, persona.tag);

  const roadmapCity: RoadmapCity = city
    ? { slug: city.slug, name: city.name_en, state: city.states?.name_en ?? "" }
    : null;

  const Icon = PERSONA_UI[persona.slug]?.icon ?? FALLBACK_PERSONA_ICON;

  return (
    <div className="space-y-8">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Your relocation roadmap
        </span>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {roadmapCity ? `${roadmapCity.name} · ` : ""}
            {persona.label}
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">{persona.intro}</p>
        {roadmapCity && (
          <Link
            href={`/germany/${roadmapCity.slug}`}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            See the full {roadmapCity.name} city guide →
          </Link>
        )}
      </header>

      <RoadmapView
        persona={persona.slug}
        personaLabel={persona.label}
        city={roadmapCity}
        phases={phases}
      />
    </div>
  );
}
