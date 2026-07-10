"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ListChecks, ListTree } from "lucide-react";
import { ProgressBar, StepCard } from "@/components/ds";
import { NextStepCard } from "@/components/dashboard/NextStepCard";
import { usePlanProgress } from "@/components/plan/usePlanProgress";
import { planKey } from "@/lib/plan-progress";
import { flattenPhases, type PlanPhase } from "@/lib/plan";
import type { GlossaryEntry } from "@/lib/auto-gloss";

// How many upcoming steps to reveal beneath the current one; the rest stay
// summarized as "+N more" so the whole list is never dumped at once.
const LOCKED_PREVIEW = 2;

/**
 * Guided view of the shared plan: the current step lit, done steps folded away,
 * the next couple visible-but-locked. Reads the SAME persona+city plan and the
 * SAME progress store as the full roadmap — a toggle switches between the two
 * views with no re-asking and no lost progress.
 */
export function GuidedPlan({
  persona,
  personaLabel,
  city,
  phases,
  glossary,
}: {
  persona: string;
  personaLabel: string;
  city: { slug: string; name: string } | null;
  phases: PlanPhase[];
  glossary: GlossaryEntry[];
}) {
  const steps = React.useMemo(() => flattenPhases(phases), [phases]);
  const phaseIndexBySlug = React.useMemo(() => {
    const m = new Map<string, number>();
    phases.forEach((p, i) => p.steps.forEach((s) => m.set(s.slug, i + 1)));
    return m;
  }, [phases]);

  const key = planKey(persona, city?.slug);
  const { completed, hydrated, markDone } = usePlanProgress(key);

  const roadmapHref = `/roadmap?persona=${persona}${city ? `&city=${city.slug}` : ""}`;

  // Avoid a flash of "step 1" before localStorage is read.
  if (!hydrated) return <div className="min-h-[60vh]" aria-hidden="true" />;

  const total = steps.length;
  const doneSteps = steps.filter((s) => completed.has(s.slug));
  const current = steps.find((s) => !completed.has(s.slug)) ?? null;
  const currentIdx = current ? steps.indexOf(current) : total;
  const locked = steps.filter(
    (s, i) => i > currentIdx && !completed.has(s.slug)
  );

  const totalStages = phases.length || 1;
  const stageNow = current ? phaseIndexBySlug.get(current.slug) ?? totalStages : totalStages;
  const percent = total ? Math.round((doneSteps.length / total) * 100) : 0;

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-gg-surface px-6 py-12 font-sans text-gg-ink">
      <div className="mx-auto max-w-2xl">
        <header className="mb-5">
          <span className="gg-caption inline-flex items-center gap-1.5 rounded-full bg-gg-brand-soft px-3 py-1 font-semibold text-gg-brand-ink">
            <Sparkles className="size-3.5" aria-hidden="true" /> Your plan
          </span>
          <h1 className="gg-display mt-4 text-gg-ink">
            {current ? "Your next step" : "You’re all caught up"}
          </h1>
          <p className="gg-body-lg mt-2 text-gg-muted">
            As a {personaLabel.toLowerCase()}
            {city ? ` in ${city.name}` : ""} — just this one thing, then the next.
          </p>
        </header>

        <div className="mb-4">
          <ProgressBar stage={stageNow} total={totalStages} percent={percent} />
        </div>

        {/* Same plan, other view — no questionnaire, progress carries over. */}
        <div className="mb-7">
          <Link
            href={roadmapHref}
            className="gg-body-sm inline-flex items-center gap-1.5 font-medium text-gg-muted underline-offset-4 hover:text-gg-ink hover:underline"
          >
            <ListTree className="size-4" aria-hidden="true" /> See the full roadmap
          </Link>
        </div>

        {doneSteps.length > 0 && (
          <section className="mb-6">
            <h2 className="gg-caption mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-gg-muted">
              <ListChecks className="size-3.5" aria-hidden="true" /> Done (
              {doneSteps.length})
            </h2>
            <div className="space-y-2">
              {doneSteps.map((s) => (
                <StepCard
                  key={s.slug}
                  state="completed"
                  index={0}
                  title={s.titleDe}
                  gloss={s.titleEn}
                />
              ))}
            </div>
          </section>
        )}

        {current ? (
          <section className="mb-6">
            <NextStepCard
              index={currentIdx + 1}
              titleDe={current.titleDe}
              titleEn={current.titleEn}
              summary={current.summary}
              taskSlug={current.slug}
              citySlug={city?.slug ?? null}
              glossary={glossary}
              onMarkDone={() => markDone(current.slug)}
            />
          </section>
        ) : (
          <section className="mb-6 rounded-[14px] border border-gg-border bg-gg-card p-6 text-center">
            <p className="gg-body text-gg-ink">
              You’ve worked through every step in your plan — nicely done.
            </p>
          </section>
        )}

        {locked.length > 0 && (
          <section>
            <h2 className="gg-caption mb-2 font-semibold uppercase tracking-wide text-gg-muted">
              Later
            </h2>
            <div className="space-y-2">
              {locked.slice(0, LOCKED_PREVIEW).map((s) => (
                <StepCard
                  key={s.slug}
                  state="locked"
                  index={0}
                  title={s.titleDe}
                  gloss={s.titleEn}
                />
              ))}
            </div>
            {locked.length > LOCKED_PREVIEW && (
              <p className="gg-body-sm mt-3 text-center text-gg-muted">
                +{locked.length - LOCKED_PREVIEW} more, one at a time as you go.
              </p>
            )}
          </section>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/explore"
            className="gg-body-sm font-medium text-gg-muted underline-offset-4 hover:text-gg-ink hover:underline"
          >
            Start a new plan
          </Link>
        </div>
      </div>
    </div>
  );
}
