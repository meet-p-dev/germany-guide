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
  MapPin,
  Plane,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { City, Persona, Stage } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const STAGES: { value: Stage; icon: LucideIcon; title: string; hint: string }[] = [
  {
    value: "exploring",
    icon: Sprout,
    title: "Just exploring",
    hint: "Germany is an idea — I want to understand what it takes.",
  },
  {
    value: "applied",
    icon: CalendarCheck,
    title: "Applied & waiting",
    hint: "Application or visa in progress — preparing for the yes.",
  },
  {
    value: "moving",
    icon: Plane,
    title: "Moving soon",
    hint: "Admission or contract in hand — departure is getting real.",
  },
  {
    value: "arrived",
    icon: Building2,
    title: "Already in Germany",
    hint: "I'm here — help me settle in properly.",
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
    hint: "Show me both paths.",
  },
];

/** City is only asked once the visitor's stage makes it answerable. */
function cityMatters(stage: Stage | null): boolean {
  return stage === "moving" || stage === "arrived";
}

export function PlanWizard({ cities }: { cities: City[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, setProfile } = useVisitorProfile();

  const initialPersona = (() => {
    const p = searchParams.get("persona");
    return p === "student" || p === "worker" ? (p as Persona) : null;
  })();

  const [stage, setStage] = useState<Stage | null>(profile.stage);
  const [persona, setPersona] = useState<Persona | null>(
    initialPersona ?? profile.persona,
  );
  const [citySlug, setCitySlug] = useState<string | null>(profile.citySlug);
  const [stepIndex, setStepIndex] = useState(0);

  const askCity = cityMatters(stage);
  const totalSteps = askCity ? 3 : 2;

  const finish = (overrides?: {
    stage?: Stage | null;
    persona?: Persona | null;
    citySlug?: string | null;
  }) => {
    setProfile({
      stage: overrides?.stage !== undefined ? overrides.stage : stage,
      persona: overrides?.persona !== undefined ? overrides.persona : persona,
      citySlug:
        overrides?.citySlug !== undefined ? overrides.citySlug : citySlug,
    });
    router.push("/journey");
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
              subtitle="We open your roadmap at the right chapter — no reading about visas you already have."
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
              subtitle="Students and workers walk different paths — we show you yours."
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
              subtitle="This is where it gets personal — the same paperwork works differently in every city."
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
                hint="You'll get the full Germany-wide guide — set your city anytime later."
                selected={citySlug === null && profile.citySlug === null}
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
        ) : (
          <span />
        )}
        <Button variant="ghost" size="sm" onClick={next}>
          Skip this question
          <ArrowRight className="h-4 w-4" />
        </Button>
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
