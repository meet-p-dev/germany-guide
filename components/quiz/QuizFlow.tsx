"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ProgressBar } from "@/components/ds";
import { PlanResult } from "./PlanResult";
import {
  Q1_PERSONA,
  Q3_FAMILY,
  Q4_TIMELINE,
  assemblePlan,
  isUnfilteredPersona,
  type Option,
  type QuizAnswers,
} from "@/lib/quiz";
import type { GlossaryEntry } from "@/lib/auto-gloss";

type Task = {
  slug: string;
  title_en: string;
  title_de: string;
  summary: string | null;
  audience: string[] | null;
};
type Category = { id: string; slug: string; name_en: string; tasks: Task[] };

const STORE_KEY = "gg-quiz-v1";
const TOTAL = 5;

export function QuizFlow({
  categories,
  cities,
  glossary,
  personaPrefill,
}: {
  categories: Category[];
  cities: { slug: string; label: string }[];
  glossary: GlossaryEntry[];
  personaPrefill?: string;
}) {
  const cityOptions: Option[] = [
    ...cities.map((c) => ({ value: c.slug, label: c.label })),
    { value: "__none__", label: "Not decided yet" },
  ];
  const stageOptions: Option[] = [
    ...categories.map((c, i) => ({ value: String(i + 1), label: c.name_en })),
    { value: "7", label: "Mostly settled" },
  ];

  const QUESTIONS = [
    {
      key: "persona" as const,
      title: "Which best describes your situation?",
      subtitle: "This shapes which steps you actually need.",
      options: Q1_PERSONA,
    },
    {
      key: "city" as const,
      title: "Which city are you headed to — or already in?",
      subtitle: "We’ll use it to add local detail to your steps.",
      options: cityOptions,
    },
    {
      key: "family" as const,
      title: "Who’s coming with you?",
      subtitle: "",
      options: Q3_FAMILY,
    },
    {
      key: "timeline" as const,
      title: "When did you — or will you — arrive?",
      subtitle: "",
      options: Q4_TIMELINE,
    },
    {
      key: "stage" as const,
      title: "Where are you right now?",
      subtitle: "So we can start you in the right place.",
      options: stageOptions,
    },
  ];

  const [state, setState] = React.useState<{
    step: number;
    answers: QuizAnswers;
  }>(() => {
    const persona =
      personaPrefill && Q1_PERSONA.some((o) => o.value === personaPrefill)
        ? personaPrefill
        : undefined;
    return { step: persona ? 1 : 0, answers: persona ? { persona } : {} };
  });

  // Restore in-progress answers (session-only) once, then persist on change.
  const hydrated = React.useRef(false);
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved.step === "number") setState(saved);
      }
    } catch {}
    hydrated.current = true;
  }, []);
  React.useEffect(() => {
    if (!hydrated.current) return;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const { step, answers } = state;

  function selectedFor(key: (typeof QUESTIONS)[number]["key"]): string | undefined {
    switch (key) {
      case "persona":
        return answers.persona;
      case "city":
        return answers.city === undefined
          ? undefined
          : answers.city === null
          ? "__none__"
          : answers.city;
      case "family":
        return answers.family;
      case "timeline":
        return answers.timeline;
      case "stage":
        return answers.stage === undefined ? undefined : String(answers.stage);
    }
  }

  function select(key: (typeof QUESTIONS)[number]["key"], value: string) {
    setState((s) => {
      const a: QuizAnswers = { ...s.answers };
      if (key === "persona") a.persona = value;
      else if (key === "city") a.city = value === "__none__" ? null : value;
      else if (key === "family") a.family = value;
      else if (key === "timeline") a.timeline = value;
      else if (key === "stage") a.stage = Number(value);
      return { ...s, answers: a };
    });
  }

  const startOver = () => {
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch {}
    setState({ step: 0, answers: {} });
  };

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-gg-surface px-6 py-12 font-sans text-gg-ink">
      {step < TOTAL ? (
        (() => {
          const q = QUESTIONS[step];
          const selected = selectedFor(q.key);
          return (
            <div className="mx-auto max-w-xl">
              <div className="mb-7">
                <p className="gg-body-sm mb-2 font-semibold text-gg-ink">
                  Question {step + 1} of {TOTAL}
                </p>
                <ProgressBar stage={step + 1} total={TOTAL} showLabel={false} />
              </div>

              <h1 className="gg-h1 text-gg-ink">{q.title}</h1>
              {q.subtitle && (
                <p className="gg-body mt-2 text-gg-muted">{q.subtitle}</p>
              )}

              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {q.options.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => select(q.key, o.value)}
                    aria-pressed={selected === o.value}
                    className={cn(
                      "gg-body rounded-[12px] border px-4 py-3 text-left font-medium transition-[filter] outline-none focus-visible:ring-2 focus-visible:ring-gg-brand focus-visible:ring-offset-2 focus-visible:ring-offset-gg-surface",
                      selected === o.value
                        ? "border-gg-brand bg-gg-brand-soft text-gg-brand-ink ring-1 ring-gg-brand"
                        : "border-gg-border bg-gg-card text-gg-ink hover:brightness-[0.98]"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Button
                  variant="primary"
                  onClick={() =>
                    setState((s) => ({ ...s, step: s.step + 1 }))
                  }
                  disabled={selected === undefined}
                >
                  Continue
                </Button>
                {step > 0 && (
                  <button
                    onClick={() =>
                      setState((s) => ({ ...s, step: Math.max(0, s.step - 1) }))
                    }
                    className="gg-body-sm text-gg-muted underline-offset-4 hover:text-gg-ink hover:underline"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        <PlanResult
          plan={assemblePlan(categories, answers).map((s) => ({
            ...s,
            tasks: s.tasks.map((t) => ({
              slug: t.slug,
              title_en: t.title_en,
              title_de: t.title_de,
              summary: t.summary,
            })),
          }))}
          glossary={glossary}
          personaLabel={
            Q1_PERSONA.find((o) => o.value === answers.persona)?.label ?? "newcomer"
          }
          cityLabel={
            answers.city
              ? cities.find((c) => c.slug === answers.city)?.label ?? null
              : null
          }
          familyLabel={Q3_FAMILY.find((o) => o.value === answers.family)?.label}
          timelineLabel={
            Q4_TIMELINE.find((o) => o.value === answers.timeline)?.label
          }
          stage={answers.stage ?? 1}
          unfiltered={isUnfilteredPersona(answers.persona)}
          onStartOver={startOver}
        />
      )}
    </div>
  );
}
