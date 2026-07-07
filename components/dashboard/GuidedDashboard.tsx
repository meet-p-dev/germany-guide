"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ListChecks } from "lucide-react";
import { Button, ProgressBar, StepCard } from "@/components/ds";
import { NextStepCard } from "./NextStepCard";
import {
  assemblePlan,
  isUnfilteredPersona,
  Q1_PERSONA,
  type QuizAnswers,
} from "@/lib/quiz";
import {
  clampCursor,
  flattenPlan,
  percentSettled,
  progressKey,
  seedCursor,
  type FlatStep,
} from "@/lib/dashboard";
import type { GlossaryEntry } from "@/lib/auto-gloss";

type Task = {
  slug: string;
  title_en: string;
  title_de: string;
  summary: string | null;
  audience: string[] | null;
};
type Category = { id: string; slug: string; name_en: string; tasks: Task[] };

const QUIZ_KEY = "gg-quiz-v1"; // written by the quiz (Increment 3)
const PROGRESS_KEY = "gg-progress-v1"; // guided-mode cursor (Increment 4)

// How many locked steps to reveal beneath the current one. The rest stay
// summarized as "+N more later" — the whole mountain is never shown at once.
const LOCKED_PREVIEW = 2;

export function GuidedDashboard({
  categories,
  cities,
  glossary,
}: {
  categories: Category[];
  cities: { slug: string; label: string }[];
  glossary: GlossaryEntry[];
}) {
  const [answers, setAnswers] = React.useState<QuizAnswers | null>(null);
  const [cursor, setCursor] = React.useState(0);
  const [hydrated, setHydrated] = React.useState(false);

  // Read the plan the quiz saved (session-only), then restore any saved
  // guided-mode progress; otherwise seed the cursor from "where are you now".
  React.useEffect(() => {
    let a: QuizAnswers | null = null;
    try {
      const raw = sessionStorage.getItem(QUIZ_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved?.answers?.persona) a = saved.answers as QuizAnswers;
    } catch {}

    if (a) {
      const steps = flattenPlan(assemblePlan(categories, a));
      let c = seedCursor(steps, a.stage ?? 1);
      try {
        const rawP = localStorage.getItem(PROGRESS_KEY);
        const p = rawP ? JSON.parse(rawP) : null;
        if (p?.key === progressKey(a) && typeof p.cursor === "number") {
          c = clampCursor(p.cursor, steps.length);
        }
      } catch {}
      setCursor(c);
    }

    setAnswers(a);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the cursor whenever it moves.
  React.useEffect(() => {
    if (!hydrated || !answers) return;
    try {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ key: progressKey(answers), cursor })
      );
    } catch {}
  }, [cursor, hydrated, answers]);

  const steps = React.useMemo<FlatStep<Task>[]>(
    () => (answers ? flattenPlan(assemblePlan(categories, answers)) : []),
    [answers, categories]
  );

  // Avoid a flash of the empty state before sessionStorage is read.
  if (!hydrated) {
    return <div className="min-h-[60vh]" aria-hidden="true" />;
  }

  // No plan yet → one calm invitation to build one (the sign-up hinge).
  if (!answers) {
    return <NoPlan />;
  }

  const total = steps.length;
  const clamped = clampCursor(cursor, total);
  const done = steps.slice(0, clamped);
  const current = clamped < total ? steps[clamped] : null;
  const locked = steps.slice(clamped + 1);
  const stageNow = current?.stageIndex ?? 6;

  const personaLabel =
    Q1_PERSONA.find((o) => o.value === answers.persona)?.label ?? "newcomer";
  const cityLabel = answers.city
    ? cities.find((c) => c.slug === answers.city)?.label ?? null
    : null;

  const markDone = () => setCursor((c) => Math.min(c + 1, total));

  return (
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
          {cityLabel ? ` in ${cityLabel}` : ""} — just this one thing, then the
          next.
        </p>
      </header>

      <div className="mb-7">
        <ProgressBar
          stage={stageNow}
          total={6}
          percent={percentSettled(clamped, total)}
        />
      </div>

      {isUnfilteredPersona(answers.persona) && (
        <p className="gg-body-sm mb-6 rounded-[14px] border border-gg-border bg-gg-card p-4 text-gg-muted">
          We’re showing every step for now — we don’t yet tailor this path to
          your exact situation, so treat anything that doesn’t apply as done.
        </p>
      )}

      {/* DONE — folded to quiet single rows (Rule 2: completed steps collapse). */}
      {done.length > 0 && (
        <section className="mb-6">
          <h2 className="gg-caption mb-2 flex items-center gap-1.5 font-semibold uppercase tracking-wide text-gg-muted">
            <ListChecks className="size-3.5" aria-hidden="true" /> Done (
            {done.length})
          </h2>
          <div className="space-y-2">
            {done.map((s) => (
              <StepCard
                key={s.task.slug}
                state="completed"
                index={0}
                title={s.task.title_de}
                gloss={s.task.title_en}
              />
            ))}
          </div>
        </section>
      )}

      {/* NOW — the single dominant, lit card (Rule 1: one primary action). */}
      {current ? (
        <section className="mb-6">
          <NextStepCard
            index={clamped + 1}
            titleDe={current.task.title_de}
            titleEn={current.task.title_en}
            summary={current.task.summary}
            taskSlug={current.task.slug}
            citySlug={answers.city ?? null}
            glossary={glossary}
            onMarkDone={markDone}
          />
        </section>
      ) : (
        <section className="mb-6 rounded-[14px] border border-gg-border bg-gg-card p-6 text-center">
          <p className="gg-body text-gg-ink">
            You’ve worked through every step in your plan — nicely done.
          </p>
        </section>
      )}

      {/* NEXT — visibly locked, and never the whole mountain at once (Rule 2). */}
      {locked.length > 0 && (
        <section>
          <h2 className="gg-caption mb-2 font-semibold uppercase tracking-wide text-gg-muted">
            Later
          </h2>
          <div className="space-y-2">
            {locked.slice(0, LOCKED_PREVIEW).map((s) => (
              <StepCard
                key={s.task.slug}
                state="locked"
                index={0}
                title={s.task.title_de}
                gloss={s.task.title_en}
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
          href="/quiz"
          className="gg-body-sm font-medium text-gg-muted underline-offset-4 hover:text-gg-ink hover:underline"
        >
          Start a new plan
        </Link>
      </div>
    </div>
  );
}

function NoPlan() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="gg-h1 text-gg-ink">Your guided plan lives here</h1>
      <p className="gg-body mt-3 text-gg-muted">
        Answer five quick questions and we’ll turn the whole German-bureaucracy
        map into one next step at a time — just for your situation.
      </p>
      <div className="mt-7">
        <Button asChild variant="primary">
          <Link href="/quiz">Build my personal plan →</Link>
        </Button>
      </div>
    </div>
  );
}
