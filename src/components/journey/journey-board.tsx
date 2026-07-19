"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  Coins,
  FileText,
  Lock,
  MapPin,
  PencilLine,
  Sparkles,
} from "lucide-react";
import type { City, PhaseWithSteps, Step } from "@/lib/content";
import {
  formatCost,
  isPayableFee,
  parseDocuments,
  startPhaseForStage,
  stepAppliesTo,
  type CostType,
} from "@/lib/content";
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
  const { ready, profile, progress, toggleStep, session } = useVisitorProfile();
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

  // Aggregate the numbers people actually worry about — total fees, money to
  // show, recurring costs, deadlines — and the paperwork to gather up front.
  const insights = useMemo(() => {
    const all = visiblePhases.flatMap((phase) => phase.steps);
    let feeCents = 0;
    let proofCents = 0;
    let monthlyCents = 0;
    let hardDeadlines = 0;
    let bookAhead = 0;
    for (const step of all) {
      const type = step.cost_type as CostType | null;
      if (isPayableFee(type) && step.cost_cents) feeCents += step.cost_cents;
      if (type === "proof_of_funds" && step.cost_cents)
        proofCents += step.cost_cents;
      if (type === "monthly" && step.cost_cents) monthlyCents += step.cost_cents;
      if (step.deadline_urgency === "hard") hardDeadlines += 1;
      if (step.lead_time) bookAhead += 1;
    }

    // Documents worth gathering: from steps still ahead and not yet ticked.
    const seen = new Set<string>();
    const documents: { name: string; note?: string; stepTitle: string }[] = [];
    visiblePhases.forEach((phase, phaseIndex) => {
      if (phaseIndex < startIndex) return;
      for (const step of phase.steps) {
        if (progress[step.slug]) continue;
        for (const doc of parseDocuments(step.documents)) {
          const key = doc.name.trim().toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          documents.push({ ...doc, stepTitle: step.title });
        }
      }
    });

    return {
      feeCents,
      proofCents,
      monthlyCents,
      hardDeadlines,
      bookAhead,
      documents,
    };
  }, [visiblePhases, startIndex, progress]);

  // The single most useful thing on the page: what to do right now.
  // Left un-memoized on purpose — the React Compiler auto-memoizes it.
  let nextStep: { phase: PhaseWithSteps; step: Step } | null = null;
  for (let i = startIndex; i < visiblePhases.length; i += 1) {
    const phase = visiblePhases[i];
    const step = phase.steps.find((s) => !progress[s.slug]);
    if (step) {
      nextStep = { phase, step };
      break;
    }
  }

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

  // The wizard is free for everyone; the personalised plan is the account
  // benefit. Signed-out visitors see their answers acknowledged and one clear
  // unlock action — plus an open door to the generic process pages.
  if (!session) {
    return (
      <UnlockJourney
        stageLabel={profile.stage ? STAGE_LABELS[profile.stage] : null}
        persona={profile.persona}
        cityName={city?.name ?? null}
      />
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

      {hasPlan &&
        (insights.feeCents > 0 || insights.hardDeadlines > 0) && (
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {insights.feeCents > 0 && (
              <span>
                <span className="font-semibold text-foreground">
                  ≈ {formatCost(insights.feeCents, "one_time")}
                </span>{" "}
                in official fees
              </span>
            )}
            {insights.hardDeadlines > 0 && (
              <>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    {insights.hardDeadlines}
                  </span>{" "}
                  hard {insights.hardDeadlines === 1 ? "deadline" : "deadlines"}
                </span>
              </>
            )}
            {insights.bookAhead > 0 && (
              <>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <span>
                  <span className="font-semibold text-foreground">
                    {insights.bookAhead}
                  </span>{" "}
                  to book ahead
                </span>
              </>
            )}
          </p>
        )}

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

      {/* Do this now — one clear action instead of the whole tree. */}
      {hasPlan && nextStep && (
        <Link
          href={
            nextStep.step.city_variable && profile.citySlug
              ? `/cities/${profile.citySlug}/${nextStep.step.slug}`
              : `/guide/${nextStep.step.slug}`
          }
          className="mt-6 flex items-center gap-4 rounded-3xl border border-primary/30 bg-primary-soft p-6 transition-all hover:shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ArrowRight className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              Your next step
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 font-display text-lg font-bold">
              {nextStep.step.title}
              {nextStep.step.deadline_urgency === "hard" && (
                <AlertTriangle className="h-4 w-4 shrink-0 text-primary" />
              )}
            </span>
            {nextStep.step.deadline_rule ? (
              <span className="mt-0.5 block text-sm text-muted">
                {nextStep.step.deadline_rule}
              </span>
            ) : (
              nextStep.step.summary && (
                <span className="mt-0.5 block text-sm text-muted">
                  {nextStep.step.summary}
                </span>
              )
            )}
          </span>
        </Link>
      )}

      {/* Money at a glance — fees you pay, funds to show, monthly running cost. */}
      {hasPlan &&
        (insights.feeCents > 0 ||
          insights.proofCents > 0 ||
          insights.monthlyCents > 0) && (
          <div className="mt-4 rounded-3xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 font-display text-lg font-bold">
              <Coins className="h-5 w-5 text-gold" />
              What this journey costs
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {insights.feeCents > 0 && (
                <CostStat
                  value={formatCost(insights.feeCents, "one_time")!}
                  label="in one-off official fees"
                />
              )}
              {insights.proofCents > 0 && (
                <CostStat
                  value={formatCost(insights.proofCents, "one_time")!}
                  label="to show as proof of funds (your own money)"
                />
              )}
              {insights.monthlyCents > 0 && (
                <CostStat
                  value={`${formatCost(insights.monthlyCents, "one_time")!}/mo`}
                  label="rough recurring costs (insurance, fees, SIM)"
                />
              )}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Estimates that adapt to your path — check each step for the exact,
              locally-verified figure.
            </p>
          </div>
        )}

      {/* Gather these now — every document across the road ahead, in one list. */}
      {hasPlan && insights.documents.length > 0 && (
        <details className="group mt-4 rounded-3xl border border-border bg-card p-6 [&_summary]:cursor-pointer">
          <summary className="flex items-center gap-3 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
            <FileText className="h-5 w-5 text-primary" />
            <span className="flex-1">
              Get these documents ready
              <span className="ml-2 text-sm font-normal text-muted">
                {insights.documents.length} to gather
              </span>
            </span>
            <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Everything the road ahead asks for, pulled into one place — prepare
            these before the appointment maze begins.
          </p>
          <ul className="mt-4 space-y-3">
            {insights.documents.map((doc) => (
              <li
                key={doc.name}
                className="flex items-start gap-3 text-[15px]"
              >
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                />
                <span>
                  <span className="font-medium">{doc.name}</span>
                  {doc.note && <span className="text-muted"> — {doc.note}</span>}
                  <span className="mt-0.5 block text-xs text-muted">
                    for “{doc.stepTitle}”
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

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

function UnlockJourney({
  stageLabel,
  persona,
  cityName,
}: {
  stageLabel: string | null;
  persona: string | null;
  cityName: string | null;
}) {
  const answered = stageLabel !== null || persona !== null || cityName !== null;
  return (
    <div>
      <Kicker>My journey</Kicker>
      <h1 className="mt-3 font-display text-4xl font-bold">
        {answered ? "Your plan is ready." : "Your plan lives here."}
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-muted">
        {answered
          ? "One step left: create your free account and your personalised roadmap — with progress that follows you across devices — unlocks instantly."
          : "Answer three quick questions, create a free account, and get a roadmap shaped around your stage, your path and your city."}
      </p>

      {answered && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          {stageLabel && (
            <span className="rounded-full border border-border bg-card px-3 py-1">
              {stageLabel}
            </span>
          )}
          {persona && (
            <span className="rounded-full border border-border bg-card px-3 py-1 capitalize">
              {persona}
            </span>
          )}
          {cityName && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {cityName}
            </span>
          )}
        </div>
      )}

      <div className="mt-8 flex items-start gap-4 rounded-3xl border border-primary/30 bg-primary-soft p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display font-bold">
            Free account, real benefits.
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              Your checklist, costs and deadlines — synced everywhere
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              Move-in date countdown so the 14-day Anmeldung never surprises you
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              A private vault for reference numbers and appointment notes
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ButtonLink href="/signin" size="sm">
              Unlock my plan — free
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            {!answered && (
              <ButtonLink href="/plan" variant="secondary" size="sm">
                Answer the questions first
              </ButtonLink>
            )}
          </div>
          <p className="mt-3 text-xs text-muted">
            Sign up in seconds with your email or Google.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        Prefer to browse without an account? The full Germany-wide guide stays
        open to everyone on{" "}
        <Link href="/process" className="font-medium text-primary hover:underline">
          The process
        </Link>
        .
      </p>
    </div>
  );
}

function CostStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card-muted/60 p-4">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm leading-snug text-muted">{label}</p>
    </div>
  );
}
