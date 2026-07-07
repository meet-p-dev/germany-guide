"use client";

import Link from "next/link";
import { Users, CalendarClock } from "lucide-react";
import { Button, ProgressBar } from "@/components/ds";
import { StageCard } from "@/components/journey/StageCard";
import { STAGE_FRAMING } from "@/lib/journey-copy";
import type { GlossaryEntry } from "@/lib/auto-gloss";
import type { PlanStage } from "@/lib/quiz";

type PlanTask = {
  slug: string;
  title_en: string;
  title_de: string;
  summary: string | null;
};

export function PlanResult({
  plan,
  glossary,
  personaLabel,
  cityLabel,
  familyLabel,
  timelineLabel,
  stage,
  unfiltered,
  onStartOver,
}: {
  plan: PlanStage<PlanTask>[];
  glossary: GlossaryEntry[];
  personaLabel: string;
  cityLabel: string | null;
  familyLabel?: string;
  timelineLabel?: string;
  stage: number;
  unfiltered: boolean;
  onStartOver: () => void;
}) {
  const settled = stage >= 7;
  // First task of the current stage, or the next stage that has one.
  const nowIndex = plan.findIndex((s) => s.status === "now");
  let nextTask: PlanTask | undefined;
  for (let i = Math.max(0, nowIndex); i < plan.length; i++) {
    if (plan[i].tasks.length) {
      nextTask = plan[i].tasks[0];
      break;
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <span className="gg-caption inline-flex items-center rounded-full bg-gg-brand-soft px-3 py-1 font-semibold text-gg-brand-ink">
          Your plan
        </span>
        <h1 className="gg-display mt-4 text-gg-ink">Here’s your path</h1>
        <p className="gg-body-lg mt-3 text-gg-muted">
          As a {personaLabel.toLowerCase()}
          {cityLabel ? ` in ${cityLabel}` : ""} — your six stages, with where
          you are now.
        </p>
      </header>

      <div className="mb-6">
        <ProgressBar stage={Math.min(stage, 6)} total={6} percent={settled ? 100 : undefined} />
      </div>

      {/* Captured but not yet driving the plan — shown honestly. */}
      {(familyLabel || timelineLabel) && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {familyLabel && (
            <span className="gg-caption inline-flex items-center gap-1.5 rounded-full bg-gg-secondary px-2.5 py-1 text-gg-muted">
              <Users className="size-3.5" aria-hidden="true" /> {familyLabel}
            </span>
          )}
          {timelineLabel && (
            <span className="gg-caption inline-flex items-center gap-1.5 rounded-full bg-gg-secondary px-2.5 py-1 text-gg-muted">
              <CalendarClock className="size-3.5" aria-hidden="true" />{" "}
              {timelineLabel}
            </span>
          )}
          <span className="gg-caption text-gg-muted">
            — noted for your family-specific steps and reminders as those arrive.
          </span>
        </div>
      )}

      {unfiltered && (
        <p className="gg-body-sm mb-6 rounded-[14px] border border-gg-border bg-gg-card p-4 text-gg-muted">
          We’re showing every stage for now — we don’t yet tailor this path to
          your exact situation, so treat anything that doesn’t apply as skippable.
        </p>
      )}

      <ol className="relative space-y-3">
        <span
          className="absolute bottom-6 left-[17px] top-6 w-px bg-gg-border"
          aria-hidden="true"
        />
        {plan.map((s, i) => (
          <StageCard
            key={s.id}
            index={i + 1}
            name={s.name_en}
            framing={STAGE_FRAMING[s.slug] ?? ""}
            tasks={s.tasks}
            glossary={glossary}
            status={s.status}
            defaultOpen={s.status === "now"}
            emptyNote="Nothing in this stage applies to your situation — you can skip ahead."
          />
        ))}
      </ol>

      <div className="mt-8 flex flex-col items-center gap-3">
        {nextTask && !settled ? (
          <Button asChild variant="primary">
            <Link href={`/tasks/${nextTask.slug}`}>Start with your next step →</Link>
          </Button>
        ) : (
          <p className="gg-body text-gg-muted">
            You’ve worked through the map — nice.
          </p>
        )}
        <button
          onClick={onStartOver}
          className="gg-body-sm font-medium text-gg-muted underline-offset-4 hover:text-gg-ink hover:underline"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
