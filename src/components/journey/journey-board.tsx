"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  MapPin,
  PencilLine,
  Sparkles,
} from "lucide-react";
import type { City, PhaseWithSteps, Step } from "@/lib/content";
import { startPhaseForStage, stepAppliesTo } from "@/lib/content";
import { REVIEW_BEHIND_KEY, useVisitorProfile } from "@/lib/profile-store";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const STAGE_LABELS: Record<string, string> = {
  exploring: "Just exploring",
  applied: "Applied & waiting",
  moving: "Moving soon",
  arrived: "Already in Germany",
};

/** Mid-sentence versions of the stage labels ("Germany" keeps its capital). */
const STAGE_PHRASES: Record<string, string> = {
  exploring: "just exploring",
  applied: "applied & waiting",
  moving: "moving soon",
  arrived: "already in Germany",
};

export function JourneyBoard({
  phases,
  cities,
}: {
  phases: PhaseWithSteps[];
  cities: City[];
}) {
  const { ready, profile, progress, toggleStep } = useVisitorProfile();
  const celebratedPhases = useRef<Set<string>>(new Set());

  const visiblePhases = useMemo(
    () =>
      phases.map((phase) => ({
        ...phase,
        steps: phase.steps.filter((step) =>
          stepAppliesTo(step, profile.persona),
        ),
      })),
    [phases, profile.persona],
  );

  const startPhase = startPhaseForStage(profile.stage);
  const startIndex = Math.max(
    0,
    visiblePhases.findIndex((phase) => phase.slug === startPhase),
  );

  // Set by the plan wizard right after it pre-ticked the phases behind the
  // visitor's stage — we open those phases and ask for a quick review.
  const [reviewingBehind, setReviewingBehind] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(REVIEW_BEHIND_KEY) === "1";
    } catch {
      return false;
    }
  });
  const dismissReview = () => {
    try {
      window.sessionStorage.removeItem(REVIEW_BEHIND_KEY);
    } catch {
      // Nothing to clear when storage is unavailable.
    }
    setReviewingBehind(false);
  };

  // null = "no user interaction yet" → derive the default (start phase open)
  // instead of initialising via effect.
  const [toggledPhases, setToggledPhases] = useState<Set<string> | null>(null);
  const openPhases =
    toggledPhases ??
    (ready
      ? new Set(
          (reviewingBehind
            ? visiblePhases.slice(0, startIndex + 1).map((phase) => phase.slug)
            : [visiblePhases[startIndex]?.slug]
          ).filter((slug): slug is string => Boolean(slug)),
        )
      : new Set<string>());
  const togglePhase = (slug: string) => {
    setToggledPhases(() => {
      const next = new Set(openPhases);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const doneCount = (steps: Step[]) =>
    steps.filter((step) => progress[step.slug]).length;

  const totalSteps = visiblePhases.reduce(
    (sum, phase) => sum + phase.steps.length,
    0,
  );
  const totalDone = visiblePhases.reduce(
    (sum, phase) => sum + doneCount(phase.steps),
    0,
  );

  const city = cities.find((c) => c.slug === profile.citySlug) ?? null;
  const hasPlan =
    profile.stage !== null ||
    profile.persona !== null ||
    profile.citySlug !== null;
  const behindDone = visiblePhases
    .slice(0, startIndex)
    .reduce((sum, phase) => sum + doneCount(phase.steps), 0);

  const handleToggle = (phase: PhaseWithSteps, step: Step) => {
    const wasDone = Boolean(progress[step.slug]);
    toggleStep(step.slug);
    if (!wasDone) {
      const remaining = phase.steps.filter(
        (s) => s.slug !== step.slug && !progress[s.slug],
      );
      if (remaining.length === 0 && !celebratedPhases.current.has(phase.slug)) {
        celebratedPhases.current.add(phase.slug);
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#b42233", "#bc8a24", "#1a1a1a", "#faf9f4"],
          disableForReducedMotion: true,
        });
      }
    }
  };

  // The profile hydrates from localStorage after mount; rendering the board
  // before that flashes the generic Germany-wide plan at returning visitors.
  if (!ready) {
    return (
      <div aria-hidden className="animate-pulse">
        <div className="h-5 w-28 rounded-full bg-card-muted" />
        <div className="mt-4 h-10 w-2/3 rounded-2xl bg-card-muted" />
        <div className="mt-8 h-24 rounded-2xl bg-card-muted" />
        <div className="mt-10 space-y-4">
          <div className="h-24 rounded-3xl bg-card-muted" />
          <div className="h-24 rounded-3xl bg-card-muted" />
          <div className="h-24 rounded-3xl bg-card-muted" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Kicker>My journey</Kicker>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-bold">
          {city ? `Your road to ${city.name}.` : "Your road to Germany."}
        </h1>
        <ButtonLink href="/plan" variant="secondary" size="sm">
          <PencilLine className="h-4 w-4" />
          Edit my situation
        </ButtonLink>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        {profile.stage && (
          <span className="rounded-full border border-border bg-card px-3 py-1">
            {STAGE_LABELS[profile.stage]}
          </span>
        )}
        {profile.persona && (
          <span className="rounded-full border border-border bg-card px-3 py-1 capitalize">
            {profile.persona}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {city ? city.name : "No city yet — showing the Germany-wide guide"}
        </span>
      </div>

      {!hasPlan && (
        <div className="mt-8 flex items-start gap-4 rounded-3xl border border-primary/30 bg-primary-soft p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display font-bold">
              This is the full Germany-wide roadmap.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Answer up to three quick questions and this checklist reshapes
              itself around your stage, your path, and your city.
            </p>
            <ButtonLink href="/plan" size="sm" className="mt-4">
              Build my plan
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      )}

      {reviewingBehind && profile.stage && behindDone > 0 && (
        <div className="mt-8 flex items-start gap-4 rounded-3xl border border-gold/40 bg-gold-soft p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card text-gold">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display font-bold">
              Quick check — {behindDone} earlier{" "}
              {behindDone === 1 ? "step is" : "steps are"} ticked as done.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              You said you&apos;re {STAGE_PHRASES[profile.stage]},
              so everything before that point is marked done below. Skim the
              opened phases and untick anything you haven&apos;t actually
              finished.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={dismissReview}>
                Yes, all done
              </Button>
              <Button variant="ghost" size="sm" onClick={dismissReview}>
                I&apos;ll fix the ticks below
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* overall progress */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold">
            {totalDone} of {totalSteps} steps done
          </p>
          <p className="text-muted">
            {totalSteps === 0
              ? ""
              : `${Math.round((totalDone / totalSteps) * 100)}%`}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-card-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{
              width:
                totalSteps === 0
                  ? "0%"
                  : `${(totalDone / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      </div>

      <div className="mt-10 space-y-4">
        {visiblePhases.map((phase, phaseIndex) => {
          const done = doneCount(phase.steps);
          const complete = done === phase.steps.length && phase.steps.length > 0;
          const isPast = phaseIndex < startIndex;
          const open = openPhases.has(phase.slug);

          return (
            <section
              key={phase.slug}
              className={cn(
                "overflow-hidden rounded-3xl border bg-card transition-colors",
                complete ? "border-success/40" : "border-border",
              )}
            >
              <button
                type="button"
                onClick={() => togglePhase(phase.slug)}
                aria-expanded={open}
                className="flex w-full items-center gap-4 p-6 text-left"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-sm font-bold",
                    complete
                      ? "bg-success-soft text-success"
                      : "bg-primary-soft text-primary",
                  )}
                >
                  {complete ? <Check className="h-5 w-5" /> : phaseIndex + 1}
                </span>
                <span className="flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-xl font-bold">
                      {phase.title}
                    </span>
                    {isPast && !complete && (
                      <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Probably behind you
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {done}/{phase.steps.length} done
                    {phase.subtitle ? ` — ${phase.subtitle}` : ""}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted transition-transform duration-300",
                    open && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1 px-4 pb-5">
                      {phase.steps.map((step) => {
                        const isDone = Boolean(progress[step.slug]);
                        const href =
                          step.city_variable && profile.citySlug
                            ? `/cities/${profile.citySlug}/${step.slug}`
                            : `/guide/${step.slug}`;
                        return (
                          <li
                            key={step.slug}
                            className="flex items-start gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-card-muted/70"
                          >
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleToggle(phase, step)}
                              aria-label={
                                isDone
                                  ? `Mark "${step.title}" as not done`
                                  : `Mark "${step.title}" as done`
                              }
                              className={cn(
                                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                                isDone
                                  ? "border-success bg-success text-white"
                                  : "border-border bg-card hover:border-primary",
                              )}
                            >
                              <AnimatePresence>
                                {isDone && (
                                  <motion.span
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 25,
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </motion.button>
                            <Link href={href} className="group min-w-0 flex-1">
                              <span
                                className={cn(
                                  "flex items-center gap-1.5 font-medium",
                                  isDone && "text-muted line-through",
                                )}
                              >
                                {step.title}
                                {step.city_variable && (
                                  <MapPin
                                    className="h-3.5 w-3.5 shrink-0 text-primary"
                                    aria-label="differs by city"
                                  />
                                )}
                                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                              </span>
                              {step.summary && !isDone && (
                                <span className="mt-0.5 block text-sm text-muted">
                                  {step.summary}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>

      {!profile.citySlug && (
        <div className="mt-10 flex items-start gap-4 rounded-3xl border border-dashed border-border bg-card-muted/60 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display font-bold">
              Know your city? Unlock the local details.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Steps marked with a pin work differently from city to city. Set
              your city and this checklist fills in exactly how it works where
              you&apos;re going.
            </p>
            <ButtonLink href="/plan" size="sm" className="mt-4">
              Set my city
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
