"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarCheck,
  Compass,
  GraduationCap,
  HelpCircle,
  ListChecks,
  MapPin,
  PencilLine,
  Plane,
  RotateCcw,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  startPhaseForStage,
  stepAppliesTo,
  type City,
  type Persona,
  type PhaseWithSteps,
  type Stage,
} from "@/lib/content";
import {
  REVIEW_BEHIND_KEY,
  useVisitorProfile,
  type VisitorProfile,
} from "@/lib/profile-store";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const STAGE_LABELS: Record<Stage, string> = {
  exploring: "Just exploring",
  applied: "Applied & waiting",
  moving: "Moving soon",
  arrived: "Already in Germany",
};

const PERSONA_LABELS: Record<Persona, string> = {
  student: "Student",
  worker: "Skilled worker",
};

const STAGES: { value: Stage; icon: LucideIcon; title: string; hint: string }[] = [
  {
    value: "exploring",
    icon: Sprout,
    title: "Just exploring",
    hint: "Germany is an idea. I want to understand what it takes.",
  },
  {
    value: "applied",
    icon: CalendarCheck,
    title: "Applied & waiting",
    hint: "Application or visa in progress. Preparing for the yes.",
  },
  {
    value: "moving",
    icon: Plane,
    title: "Moving soon",
    hint: "Admission or contract in hand. Departure is getting real.",
  },
  {
    value: "arrived",
    icon: Building2,
    title: "Already in Germany",
    hint: "I am here. Help me settle in properly.",
  },
];

const PERSONAS: {
  value: Persona | null;
  icon: LucideIcon;
  title: string;
  hint: string;
}[] = [
  {
    value: "student",
    icon: GraduationCap,
    title: "Student",
    hint: "Coming for a degree or exchange.",
  },
  {
    value: "worker",
    icon: Briefcase,
    title: "Skilled worker",
    hint: "Coming with (or for) a job.",
  },
  {
    value: null,
    icon: HelpCircle,
    title: "Not sure yet",
    hint: "Compare the two paths. A five-tap quiz points you to your route.",
  },
];

/**
 * City is asked once the visitor's stage makes it answerable — i.e. from
 * admission onward. Most people pick their city the moment they're admitted
 * (the "applied & waiting" stage), so we ask from there through arrival.
 * "Just exploring" stays city-free — that's the Explorer lane.
 */
function cityMatters(stage: Stage | null): boolean {
  return stage === "applied" || stage === "moving" || stage === "arrived";
}

export function PlanWizard({
  cities,
  phases,
}: {
  cities: City[];
  phases: PhaseWithSteps[];
}) {
  const { ready } = useVisitorProfile();

  // The saved profile hydrates from localStorage after mount; mounting the
  // flow before that would seed the wizard with an empty profile and lose
  // the visitor's previous answers.
  if (!ready) return <WizardSkeleton />;
  return <PlanFlow cities={cities} phases={phases} />;
}

function PlanFlow({
  cities,
  phases,
}: {
  cities: City[];
  phases: PhaseWithSteps[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, progress, setProfile, markStepsDone, resetProgress } =
    useVisitorProfile();

  const initialPersona = (() => {
    const p = searchParams.get("persona");
    return p === "student" || p === "worker" ? (p as Persona) : null;
  })();

  const hasSavedPlan =
    profile.stage !== null ||
    profile.persona !== null ||
    profile.citySlug !== null;
  const doneCount = Object.keys(progress).length;

  // Returning visitors resume their saved plan instead of re-answering
  // everything; an explicit ?persona= link means "rebuild", so it goes
  // straight into the wizard.
  const [mode, setMode] = useState<"resume" | "wizard">(
    hasSavedPlan && !initialPersona ? "resume" : "wizard",
  );

  const [stage, setStage] = useState<Stage | null>(profile.stage);
  const [persona, setPersona] = useState<Persona | null>(
    initialPersona ?? profile.persona,
  );
  const [citySlug, setCitySlug] = useState<string | null>(profile.citySlug);
  const [stepIndex, setStepIndex] = useState(0);

  /** Set when finishing would silently carry ticked steps across a persona switch. */
  const [pendingProfile, setPendingProfile] = useState<VisitorProfile | null>(
    null,
  );
  const [confirmingReset, setConfirmingReset] = useState(false);

  const askCity = cityMatters(stage);
  const totalSteps = askCity ? 3 : 2;

  const commit = (next: VisitorProfile) => {
    // A stage further along the journey means the phases before it are
    // behind the visitor: tick their steps and let the journey ask for a
    // quick review. Only on a stage change, so deliberate unticks survive
    // re-running the wizard.
    if (next.stage !== profile.stage) {
      const startIndex = phases.findIndex(
        (phase) => phase.slug === startPhaseForStage(next.stage),
      );
      const behind = phases
        .slice(0, Math.max(0, startIndex))
        .flatMap((phase) => phase.steps)
        .filter((step) => stepAppliesTo(step, next.persona))
        .map((step) => step.slug);
      if (behind.length > 0) {
        markStepsDone(behind);
        try {
          window.sessionStorage.setItem(REVIEW_BEHIND_KEY, "1");
        } catch {
          // Storage unavailable (private mode) — skip the review nudge.
        }
      }
    }
    setProfile(next);
    router.push("/journey");
  };

  const finish = (overrides?: Partial<VisitorProfile>) => {
    const next: VisitorProfile = {
      stage: overrides?.stage !== undefined ? overrides.stage : stage,
      persona: overrides?.persona !== undefined ? overrides.persona : persona,
      citySlug:
        overrides?.citySlug !== undefined ? overrides.citySlug : citySlug,
      // The wizard doesn't ask for a move-in date — preserve any saved one.
      moveInDate:
        overrides?.moveInDate !== undefined
          ? overrides.moveInDate
          : profile.moveInDate,
    };
    const switchingPersona =
      profile.persona !== null &&
      next.persona !== null &&
      next.persona !== profile.persona &&
      doneCount > 0;
    if (switchingPersona) {
      setPendingProfile(next);
      return;
    }
    commit(next);
  };

  const startOver = () => {
    resetProgress();
    setProfile({ stage: null, persona: null, citySlug: null, moveInDate: null });
    setStage(null);
    setPersona(null);
    setCitySlug(null);
    setStepIndex(0);
    setConfirmingReset(false);
    setMode("wizard");
  };

  const next = () => {
    if (stepIndex + 1 >= totalSteps) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const steps = useMemo(() => {
    const list: ("stage" | "persona" | "city")[] = ["stage", "persona"];
    if (askCity) list.push("city");
    return list;
  }, [askCity]);

  const current = steps[Math.min(stepIndex, steps.length - 1)];

  if (mode === "resume") {
    const city = cities.find((c) => c.slug === profile.citySlug) ?? null;
    return (
      <div>
        <Kicker>Build my plan</Kicker>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Welcome back. Your plan is saved.
          </h1>
          <p className="mt-3 leading-relaxed text-muted">
            Pick up where you left off, adjust your answers, or wipe the slate
            clean and start again.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            {profile.stage && (
              <span className="rounded-full border border-border bg-card px-3 py-1">
                {STAGE_LABELS[profile.stage]}
              </span>
            )}
            {profile.persona && (
              <span className="rounded-full border border-border bg-card px-3 py-1">
                {PERSONA_LABELS[profile.persona]}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {city ? city.name : "No city yet"}
            </span>
            {doneCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                <ListChecks className="h-3.5 w-3.5 text-success" />
                {doneCount} {doneCount === 1 ? "step" : "steps"} ticked
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={() => router.push("/journey")}>
              Continue my journey
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={() => setMode("wizard")}>
              <PencilLine className="h-4 w-4" />
              Change my answers
            </Button>
            <Button variant="ghost" onClick={() => setConfirmingReset(true)}>
              <RotateCcw className="h-4 w-4" />
              Start over
            </Button>
          </div>
        </motion.div>

        {confirmingReset && (
          <ConfirmDialog
            title="Start from scratch?"
            body={
              doneCount > 0
                ? `This clears your answers and the ${doneCount} ${
                    doneCount === 1 ? "step" : "steps"
                  } you've ticked so far. There's no undo.`
                : "This clears your saved answers so you can rebuild your plan from the beginning."
            }
            onClose={() => setConfirmingReset(false)}
            actions={
              <>
                <Button size="sm" onClick={startOver}>
                  Start over
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingReset(false)}
                >
                  Cancel
                </Button>
              </>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Kicker>Build my plan</Kicker>
        <p className="text-sm text-muted" aria-live="polite">
          {Math.min(stepIndex + 1, totalSteps)} / {totalSteps}
        </p>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-card-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{
            width: `${((stepIndex + 1) / totalSteps) * 100}%`,
          }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </div>

      {/* Enter-only animation: exit animations between wizard steps add latency
          (and can stall entirely under throttled rAF), so the old panel swaps
          out instantly and the new one slides in. */}
      <motion.div
        key={current}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="mt-10"
      >
          {current === "stage" && (
            <StepShell
              title="Where are you right now?"
              subtitle="We open your roadmap at the right chapter, so you skip the visas you already have."
            >
              {STAGES.map((option) => (
                <ChoiceCard
                  key={option.value}
                  icon={option.icon}
                  title={option.title}
                  hint={option.hint}
                  selected={stage === option.value}
                  onSelect={() => {
                    setStage(option.value);
                    setStepIndex((i) => i + 1);
                  }}
                />
              ))}
            </StepShell>
          )}

          {current === "persona" && (
            <StepShell
              title="What brings you to Germany?"
              subtitle="Students and workers walk different paths. We show you yours."
            >
              {PERSONAS.map((option) => (
                <ChoiceCard
                  key={option.title}
                  icon={option.icon}
                  title={option.title}
                  hint={option.hint}
                  selected={
                    option.value !== null && persona === option.value
                  }
                  onSelect={() => {
                    // "Not sure yet" hands over to the paths explainer: the
                    // quiz there ends in a "build my plan" link that returns
                    // here with the persona pre-selected. Stage is saved so
                    // that answer survives the round trip.
                    if (option.value === null) {
                      setProfile({ stage });
                      router.push("/guide/understand-your-paths");
                      return;
                    }
                    setPersona(option.value);
                    if (stepIndex + 1 >= totalSteps) {
                      finish({ persona: option.value });
                    } else {
                      setStepIndex((i) => i + 1);
                    }
                  }}
                />
              ))}
            </StepShell>
          )}

          {current === "city" && (
            <StepShell
              title="Which city are you headed to?"
              subtitle="This is where it gets personal: the same paperwork works differently in every city."
            >
              {cities
                .filter((city) => city.status === "live")
                .map((city) => (
                  <ChoiceCard
                    key={city.slug}
                    icon={MapPin}
                    title={city.name}
                    hint={city.tagline ?? city.state}
                    selected={citySlug === city.slug}
                    onSelect={() => {
                      setCitySlug(city.slug);
                      finish({ citySlug: city.slug });
                    }}
                  />
                ))}
              <ChoiceCard
                icon={Compass}
                title="Another city / don't know yet"
                hint="You will get the full Germany-wide guide. Set your city anytime later."
                selected={false}
                onSelect={() => finish({ citySlug: null })}
              />
            </StepShell>
          )}
        </motion.div>

      <div className="mt-10 flex items-center justify-between">
        {stepIndex > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : hasSavedPlan ? (
          <Button variant="ghost" size="sm" onClick={() => setMode("resume")}>
            <ArrowLeft className="h-4 w-4" />
            My saved plan
          </Button>
        ) : (
          <span />
        )}
        <Button variant="ghost" size="sm" onClick={next}>
          Skip this question
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {pendingProfile && (
        <ConfirmDialog
          title={`Switch to the ${
            PERSONA_LABELS[pendingProfile.persona as Persona].toLowerCase()
          } path?`}
          body={`You built this plan as a ${PERSONA_LABELS[
            profile.persona as Persona
          ].toLowerCase()} and have ${doneCount} ${
            doneCount === 1 ? "step" : "steps"
          } ticked. Some may belong to that path. Start the new path with a clean checklist, or keep your ticks if they still apply.`}
          onClose={() => setPendingProfile(null)}
          actions={
            <>
              <Button
                size="sm"
                onClick={() => {
                  resetProgress();
                  commit(pendingProfile);
                }}
              >
                Start fresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => commit(pendingProfile)}
              >
                Keep my progress
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingProfile(null)}
              >
                Go back
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}

function WizardSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-5 w-32 rounded-full bg-card-muted" />
      <div className="mt-3 h-1 rounded-full bg-card-muted" />
      <div className="mt-10 h-9 w-3/4 rounded-2xl bg-card-muted" />
      <div className="mt-4 h-5 w-2/3 rounded-2xl bg-card-muted" />
      <div className="mt-8 grid gap-3">
        <div className="h-20 rounded-2xl bg-card-muted" />
        <div className="h-20 rounded-2xl bg-card-muted" />
        <div className="h-20 rounded-2xl bg-card-muted" />
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-3 leading-relaxed text-muted">{subtitle}</p>
      <div className="mt-8 grid gap-3">{children}</div>
    </div>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  hint,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200",
        selected
          ? "border-primary bg-primary-soft shadow-sm"
          : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-primary-soft text-primary",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display font-bold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{hint}</span>
      </span>
    </motion.button>
  );
}
