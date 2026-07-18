"use client";

import { Briefcase, Check, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PersonaPoints } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/utils";

/**
 * The page-long "half of this isn't for you" problem, solved: the same step
 * compressed into two scannable cards. If the visitor told us their path,
 * their card leads and is visually promoted; the other stays for comparison.
 */
export function PersonaCompare({ points }: { points: PersonaPoints }) {
  const { ready, profile } = useVisitorProfile();
  const persona = ready ? profile.persona : null;

  const cards = [
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
  ].filter((card) => card.bullets.length > 0);

  if (cards.length === 0) return null;

  // The visitor's own path comes first.
  if (persona) {
    cards.sort((a, b) =>
      a.key === persona ? -1 : b.key === persona ? 1 : 0,
    );
  }

  return (
    <section className="mt-10">
      <Kicker>The short version, by path</Kicker>
      <div
        className={cn(
          "mt-3 grid gap-4",
          cards.length > 1 && "sm:grid-cols-2",
        )}
      >
        {cards.map((card) => (
          <PathCard
            key={card.key}
            icon={card.icon}
            title={card.title}
            bullets={card.bullets}
            emphasis={persona === null || persona === card.key}
            yours={persona === card.key}
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
  emphasis,
  yours,
}: {
  icon: LucideIcon;
  title: string;
  bullets: string[];
  emphasis: boolean;
  yours: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-5 transition-colors",
        yours
          ? "border-primary/40 bg-primary-soft/40"
          : emphasis
            ? "border-border bg-card"
            : "border-border bg-card-muted/40",
      )}
    >
      <p className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            yours
              ? "bg-primary text-primary-foreground"
              : "bg-primary-soft text-primary",
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="font-display font-bold">{title}</span>
        {yours && (
          <span className="ml-auto rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
            Your path
          </span>
        )}
      </p>
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
                yours ? "text-primary" : "text-gold",
              )}
            />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}
