"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Compass,
  ExternalLink,
  GraduationCap,
  RotateCcw,
  Route,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface QuizResult {
  title: string;
  paragraph: string;
  bullets: string[];
  officialUrl: string;
  officialLabel: string;
}

const RESULTS: Record<string, QuizResult> = {
  student: {
    title: "The study route fits you",
    paragraph:
      "University admission is your door into Germany — the visa follows the admission letter.",
    bullets: [
      "Student visa (§16b) with a blocked account as proof of funds",
      "No tuition at public universities — just the semester fee",
      "18 months to find a job after graduating",
    ],
    officialUrl: "https://www.daad.de/en/studying-in-germany/",
    officialLabel: "DAAD — official study portal",
  },
  blue_card: {
    title: "You look like an EU Blue Card case",
    paragraph:
      "A qualifying offer plus a recognised degree is the fastest, most privileged work route.",
    bullets: [
      "Blue Card (§18g) from €50,700 gross — €45,934.20 in shortage professions",
      "Family joins easily; spouses may work without restriction",
      "Permanent residence after as little as 21 months",
    ],
    officialUrl:
      "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card",
    officialLabel: "Make it in Germany — EU Blue Card",
  },
  work_visa: {
    title: "The standard work visa is your route",
    paragraph:
      "With a job offer and a recognised qualification you qualify for the skilled-worker visa.",
    bullets: [
      "Work visa (§18a/b) — no fixed salary floor like the Blue Card",
      "Your qualification must be recognised — start with anabin",
      "Your employer can fast-track the process (~€411)",
    ],
    officialUrl:
      "https://www.make-it-in-germany.com/en/visa-residence/types/work-qualified-professionals",
    officialLabel: "Make it in Germany — skilled workers",
  },
  chancenkarte: {
    title: "Consider the Chancenkarte",
    paragraph:
      "No offer yet, but qualified? The points-based Opportunity Card lets you come and search from inside Germany.",
    bullets: [
      "Up to one year in Germany to look for a job",
      "Points for qualifications, German/English, age and experience",
      "Part-time work (20 h/week) allowed while you search",
    ],
    officialUrl:
      "https://www.make-it-in-germany.com/en/visa-residence/types/chancenkarte",
    officialLabel: "Make it in Germany — Chancenkarte",
  },
  ausbildung: {
    title: "Look at Ausbildung — paid vocational training",
    paragraph:
      "Without a degree, Germany's dual training system is a real, official route — you earn while you learn.",
    bullets: [
      "2–3 years of paid, structured training with a company",
      "Leads to a recognised qualification and a work permit",
      "German at roughly B1 level is usually expected",
    ],
    officialUrl:
      "https://www.make-it-in-germany.com/en/study-training/training-in-germany",
    officialLabel: "Make it in Germany — vocational training",
  },
};

type Screen =
  | { kind: "q"; id: "purpose" | "offer" | "salary" | "degree" }
  | { kind: "result"; id: keyof typeof RESULTS };

/** Five taps max from "why Germany?" to a named visa route. */
export function VisaQuiz() {
  const [screen, setScreen] = useState<Screen>({ kind: "q", id: "purpose" });

  const restart = () => setScreen({ kind: "q", id: "purpose" });

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6">
      <p className="flex items-center gap-2 font-display text-xl font-bold">
        <Route className="h-5 w-5 text-primary" />
        Which route is yours? Find out in five taps.
      </p>

      <motion.div
        key={screen.kind === "q" ? screen.id : `r-${screen.id}`}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mt-5"
      >
        {screen.kind === "q" && screen.id === "purpose" && (
          <QuizQuestion prompt="What brings you to Germany?">
            <QuizOption
              icon={GraduationCap}
              label="I want to study"
              onSelect={() => setScreen({ kind: "result", id: "student" })}
            />
            <QuizOption
              icon={Briefcase}
              label="I want to work"
              onSelect={() => setScreen({ kind: "q", id: "offer" })}
            />
            <QuizOption
              icon={Compass}
              label="Honestly, not sure yet"
              onSelect={() => setScreen({ kind: "q", id: "degree" })}
            />
          </QuizQuestion>
        )}

        {screen.kind === "q" && screen.id === "offer" && (
          <QuizQuestion prompt="Do you already have a job offer from a German employer?">
            <QuizOption
              label="Yes, offer in hand"
              onSelect={() => setScreen({ kind: "q", id: "salary" })}
            />
            <QuizOption
              label="Not yet"
              onSelect={() => setScreen({ kind: "q", id: "degree" })}
            />
          </QuizQuestion>
        )}

        {screen.kind === "q" && screen.id === "salary" && (
          <QuizQuestion prompt="Is the gross salary at least €50,700 (or €45,934 in IT, engineering, medicine and other shortage fields)?">
            <QuizOption
              label="Yes, it clears the bar"
              onSelect={() => setScreen({ kind: "result", id: "blue_card" })}
            />
            <QuizOption
              label="No / below the threshold"
              onSelect={() => setScreen({ kind: "result", id: "work_visa" })}
            />
          </QuizQuestion>
        )}

        {screen.kind === "q" && screen.id === "degree" && (
          <QuizQuestion prompt="Do you hold a university degree or at least two years of vocational training?">
            <QuizOption
              label="Yes"
              onSelect={() => setScreen({ kind: "result", id: "chancenkarte" })}
            />
            <QuizOption
              label="No"
              onSelect={() => setScreen({ kind: "result", id: "ausbildung" })}
            />
          </QuizQuestion>
        )}

        {screen.kind === "result" && (
          <QuizResultCard result={RESULTS[screen.id]} onRestart={restart} />
        )}
      </motion.div>
    </section>
  );
}

function QuizQuestion({
  prompt,
  children,
}: {
  prompt: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-medium leading-relaxed">{prompt}</p>
      <div className="mt-4 grid gap-2.5">{children}</div>
    </div>
  );
}

function QuizOption({
  icon: Icon,
  label,
  onSelect,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left text-[15px] font-medium",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md",
      )}
    >
      {Icon && <Icon className="h-4.5 w-4.5 shrink-0 text-primary" />}
      {label}
    </motion.button>
  );
}

function QuizResultCard({
  result,
  onRestart,
}: {
  result: QuizResult;
  onRestart: () => void;
}) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary-soft/40 p-5">
      <p className="font-display text-lg font-bold">{result.title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {result.paragraph}
      </p>
      <ul className="mt-4 space-y-2">
        {result.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {bullet}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <ButtonLink href="/plan" size="sm">
          Build my plan around this
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <a
          href={result.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-foreground/25"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {result.officialLabel}
        </a>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start over
        </button>
      </div>
      <p className="mt-4 text-xs text-muted">
        A quick orientation, not an eligibility decision — verify with the
        official source.
      </p>
    </div>
  );
}
