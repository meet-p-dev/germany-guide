"use client";

import { Briefcase, Check, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PersonaPoints } from "@/lib/content";
import type { Persona } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/utils";

/**
 * The "half of this isn't for you" problem, solved: the step compressed into
 * two scannable cards. The visitor can pick their path right here — the choice
 * saves to their profile, so every other page instantly shows their path first
 * without asking again.
 */
export function PersonaCompare({ points }: { points: PersonaPoints }) {
  const { ready, profile, setProfile } = useVisitorProfile();
  const persona = ready ? profile.persona : null;

  const cards = (
    [
      {
        key: "student" as const,
        icon: GraduationCap,
        title: "As a student",
        bullets: points.student,
      },
      {
        key: "worker" as const,
        icon: Briefcase,
        title: "As a skilled worker",
        bullets: points.worker,
      },
    ] satisfies { key: Persona; icon: LucideIcon; title: string; bullets: string[] }[]
  ).filter((card) => card.bullets.length > 0);

  if (cards.length === 0) return null;

  // The visitor's own path comes first.
  if (persona) {
    cards.sort((a, b) => (a.key === persona ? -1 : b.key === persona ? 1 : 0));
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Kicker>The short version, by path</Kicker>
        {persona && (
          <button
            type="button"
            onClick={() => setProfile({ persona: null })}
            className="text-xs font-semibold text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Show both paths
          </button>
        )}
      </div>

      {!persona && cards.length > 1 && (
        <p className="mt-2 text-sm text-muted">
          Which one are you? Pick your path to tailor this — and the rest of the
          site — to you.
        </p>
      )}

      <div
        className={cn("mt-4 grid gap-4", cards.length > 1 && "sm:grid-cols-2")}
      >
        {cards.map((card) => (
          <PathCard
            key={card.key}
            icon={card.icon}
            title={card.title}
            bullets={card.bullets}
            chosen={persona === card.key}
            undecided={persona === null}
            onChoose={() => setProfile({ persona: card.key })}
          />
        ))}
      </div>
    </section>
  );
}

function PathCard({
  icon: Icon,
  title,
  bullets,
  chosen,
  undecided,
  onChoose,
}: {
  icon: LucideIcon;
  title: string;
  bullets: string[];
  chosen: boolean;
  undecided: boolean;
  onChoose: () => void;
}) {
  const emphasis = chosen || undecided;
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl border p-5 transition-colors",
        chosen
          ? "border-primary/40 bg-primary-soft/40"
          : undecided
            ? "border-border bg-card"
            : "border-border bg-card-muted/40",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            chosen ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="font-display font-bold">{title}</span>
        {chosen && (
          <span className="ml-auto rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
            Your path
          </span>
        )}
      </div>

      <ul className="mt-4 space-y-2.5">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className={cn(
              "flex items-start gap-2.5 text-sm leading-relaxed",
              emphasis ? "text-foreground/90" : "text-muted",
            )}
          >
            <Check
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                chosen ? "text-primary" : "text-gold",
              )}
            />
            {bullet}
          </li>
        ))}
      </ul>

      {!chosen && (
        <button
          type="button"
          onClick={onChoose}
          className={cn(
            "mt-4 inline-flex items-center justify-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
            undecided
              ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover"
              : "border-border bg-card text-foreground hover:border-foreground/30",
          )}
        >
          {undecided ? "This is me" : "I'm this instead"}
        </button>
      )}
    </div>
  );
}
