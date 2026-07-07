import Link from "next/link";
import type { Metadata } from "next";
import { getTasksByCategory } from "@/lib/queries/guide";
import { getGlossaryTerms } from "@/lib/queries/content";
import { STAGE_FRAMING } from "@/lib/journey-copy";
import { StageCard } from "@/components/journey/StageCard";
import { Button } from "@/components/ds";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The journey — the six stages of settling in Germany",
  description:
    "The whole path through German bureaucracy, laid out calmly in six stages. Explore the full map, then build a plan that shows just your next step.",
};

export default async function JourneyPage() {
  const [categories, glossaryTerms] = await Promise.all([
    getTasksByCategory(),
    getGlossaryTerms(),
  ]);
  // Compact term_de → term_en list for the auto-gloss helper (Rule 3).
  const glossary = glossaryTerms.map((g) => ({
    term_de: g.term_de,
    term_en: g.term_en,
  }));

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-gg-surface px-6 py-12 font-sans text-gg-ink">
      <div className="mx-auto max-w-2xl">
        {/* Header — calm orientation + finiteness (Rule 4) */}
        <header className="mb-8">
          <span className="gg-caption inline-flex items-center rounded-full bg-gg-brand-soft px-3 py-1 font-semibold text-gg-brand-ink">
            Six stages · the whole map
          </span>
          <h1 className="gg-display mt-4 text-gg-ink">
            Your path through German bureaucracy
          </h1>
          <p className="gg-body-lg mt-3 text-gg-muted">
            It’s a lot — but it’s finite. Six stages, laid out in order. Look
            through the whole map first, then build a plan that shows just your
            next step.
          </p>

          {/* The one primary action on the page (Rule 1) */}
          <div className="mt-6">
            <Button asChild variant="primary">
              <Link href="/quiz">Build my personal plan</Link>
            </Button>
          </div>
        </header>

        {/* The six-stage vertical stepper. The absolute line is the connector;
            each stage's numbered node sits on top of it. */}
        <ol className="relative space-y-3">
          <span
            className="absolute bottom-6 left-[17px] top-6 w-px bg-gg-border"
            aria-hidden="true"
          />
          {categories.map((category, i) => (
            <StageCard
              key={category.id}
              index={i + 1}
              name={category.name_en}
              framing={STAGE_FRAMING[category.slug] ?? ""}
              tasks={category.tasks.map((t) => ({
                slug: t.slug,
                title_en: t.title_en,
                title_de: t.title_de,
                summary: t.summary,
              }))}
              glossary={glossary}
            />
          ))}
        </ol>

        {/* Recurring soft invitation — same single action, closing the map */}
        <div className="mt-10 rounded-[14px] border border-gg-border bg-gg-card p-6 text-center">
          <p className="gg-body text-gg-muted">
            Seen the shape of it? Turn this map into a plan that folds away
            everything except your next step.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="primary">
              <Link href="/quiz">Build my personal plan</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
