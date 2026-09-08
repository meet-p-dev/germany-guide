"use client";

import { useState } from "react";
import { Briefcase, Check, Eye, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PersonaPoints } from "@/lib/content";
import type { Persona } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/utils";

/**
 * The "half of this isn't for you" problem, solved: the step compressed into
 * scannable path cards. A visitor who hasn't chosen yet can pick right here —
 * the choice saves to their profile. A visitor who HAS chosen sees only their
 * own path and is never asked again; the other path stays one tap away as a
 * read-only peek, and changing paths lives in the header switcher instead.
 */
export function PersonaCompare({ points }: { points: PersonaPoints }) {
  const { ready, profile, setProfile } = useVisitorProfile();
  const persona = ready ? profile.persona : null;
  const [peeking, setPeeking] = useState(false);

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

  // The visitor's own path comes first; without a peek it stands alone.
  const sorted = persona
    ? [...cards].sort((a, b) =>
        a.key === persona ? -1 : b.key === persona ? 1 : 0,
      )
    : cards;
  const visible =
    persona && !peeking
      ? sorted.filter((card) => card.key === persona)
      : sorted;
  const hasOther = persona !== null && cards.some((c) => c.key !== persona);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Kicker>
          {persona ? "The short version, for your path" : "The short version, by path"}
        </Kicker>
        {hasOther && (
          <button
            type="button"
            onClick={() => setPeeking((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {peeking ? "Hide the other path" : "Peek at the other path"}
          </button>
        )}
      </div>

      {!persona && cards.length > 1 && (
        <p className="mt-2 text-sm text-muted">
          Which one are you? Pick your path once and the whole site tailors
          itself to it, and you can change it anytime from the switcher in the
          header.
        </p>
      )}

      <div
        className={cn("mt-4 grid gap-4", visible.length > 1 && "sm:grid-cols-2")}
      >
        {visible.map((card) => (
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

      {undecided && (
        <button
          type="button"
          onClick={onChoose}
          className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          This is me
        </button>
      )}
    </div>
  );
}
