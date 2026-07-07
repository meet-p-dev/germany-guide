import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTasksByCategory } from "@/lib/queries/guide";
import { getGlossaryTerms, getSupportResources } from "@/lib/queries/content";
import { STAGE_FRAMING } from "@/lib/journey-copy";
import { PERSONAS, PERSONA_BY_SLUG } from "@/lib/persona-copy";
import { StageCard } from "@/components/journey/StageCard";
import { PersonaSwitcher } from "@/components/journey/PersonaSwitcher";
import { SupportResources } from "@/components/journey/SupportResources";
import { Button } from "@/components/ds";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return PERSONAS.map((p) => ({ persona: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ persona: string }>;
}): Promise<Metadata> {
  const { persona: slug } = await params;
  const persona = PERSONA_BY_SLUG[slug];
  if (!persona) return {};
  return { title: persona.title, description: persona.description };
}

export default async function PersonaJourneyPage({
  params,
}: {
  params: Promise<{ persona: string }>;
}) {
  const { persona: slug } = await params;
  const persona = PERSONA_BY_SLUG[slug];
  if (!persona) notFound();

  const [categories, glossaryTerms, supportResources] = await Promise.all([
    getTasksByCategory(),
    getGlossaryTerms(),
    // Only the supportive (refugee) path renders the verified resource list.
    persona.supportive ? getSupportResources() : Promise.resolve([]),
  ]);
  const glossary = glossaryTerms.map((g) => ({
    term_de: g.term_de,
    term_en: g.term_en,
  }));

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-gg-surface px-6 py-12 font-sans text-gg-ink">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <span className="gg-caption inline-flex items-center rounded-full bg-gg-brand-soft px-3 py-1 font-semibold text-gg-brand-ink">
            Your path · six stages
          </span>
          <h1 className="gg-display mt-4 text-gg-ink">{persona.heading}</h1>
          <p className="gg-body-lg mt-3 text-gg-muted">{persona.intro}</p>

          {/* Refugee: supportive, honest. Verified resources render below in
              their own section (SupportResources), sourced from the DB. */}
          {persona.supportive && (
            <div className="mt-5 rounded-[14px] border border-gg-border bg-gg-card p-4">
              <p className="gg-body-sm text-gg-ink">
                You&apos;ll find free, verified support services below, and the
                same six stages walk you through the rest — gently, at your own
                pace.
              </p>
            </div>
          )}

          <div className="mt-6">
            <Button asChild variant="primary">
              <Link href={`/quiz?persona=${persona.slug}`}>
                Build my personal plan
              </Link>
            </Button>
          </div>

          <div className="mt-6">
            <PersonaSwitcher current={persona.slug} />
          </div>
        </header>

        {persona.supportive && <SupportResources resources={supportResources} />}

        <ol className="relative mt-10 space-y-3">
          <span
            className="absolute bottom-6 left-[17px] top-6 w-px bg-gg-border"
            aria-hidden="true"
          />
          {categories.map((category, i) => {
            const tasks = category.tasks
              .filter((t) => (t.audience ?? []).includes(persona.tag))
              .map((t) => ({
                slug: t.slug,
                title_en: t.title_en,
                title_de: t.title_de,
                summary: t.summary,
              }));
            return (
              <StageCard
                key={category.id}
                index={i + 1}
                name={category.name_en}
                framing={STAGE_FRAMING[category.slug] ?? ""}
                tasks={tasks}
                glossary={glossary}
                emptyNote="Nothing in this stage applies to your situation — you can skip ahead."
              />
            );
          })}
        </ol>

        <div className="mt-10 rounded-[14px] border border-gg-border bg-gg-card p-6 text-center">
          <p className="gg-body text-gg-muted">
            Seen the shape of it? Turn this map into a plan that folds away
            everything except your next step.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="primary">
              <Link href={`/quiz?persona=${persona.slug}`}>
                Build my personal plan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
