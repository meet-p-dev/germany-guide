"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { useVisitorProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";

export interface DeadlineStep {
  slug: string;
  title: string;
  dueOffsetDays: number;
  urgency: "hard" | "soft" | null;
  appliesTo: string;
  cityVariable: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse a yyyy-mm-dd as a local calendar date (no timezone drift). */
function parseLocalDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * One calm countdown to the single most-pressing deadline. Deadlines are real
 * dates computed from the visitor's move-in date + each step's due offset; we
 * surface only the soonest step they haven't ticked off. Nothing shows until
 * there's a move-in date to anchor to — no date, no nagging.
 */
export function DeadlineClock({ steps }: { steps: DeadlineStep[] }) {
  const { ready, profile, progress } = useVisitorProfile();
  if (!ready || !profile.moveInDate) return null;

  const moveIn = parseLocalDate(profile.moveInDate);
  if (!moveIn) return null;
  const today = startOfToday();

  const upcoming = steps
    .filter(
      (s) =>
        (s.appliesTo === "both" ||
          profile.persona === null ||
          s.appliesTo === profile.persona) &&
        !progress[s.slug],
    )
    .map((s) => {
      const due = new Date(moveIn.getTime() + s.dueOffsetDays * DAY_MS);
      const daysLeft = Math.round((due.getTime() - today.getTime()) / DAY_MS);
      return { ...s, due, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const next = upcoming[0];
  if (!next) return null;

  const href =
    next.cityVariable && profile.citySlug
      ? `/cities/${profile.citySlug}/${next.slug}`
      : `/guide/${next.slug}`;

  const overdue = next.daysLeft < 0;
  const urgent = overdue || next.daysLeft <= 7 || next.urgency === "hard";
  const Icon = overdue || next.urgency === "hard" ? AlertTriangle : CalendarClock;

  const countdown = overdue
    ? `Overdue by ${Math.abs(next.daysLeft)} ${plural(Math.abs(next.daysLeft), "day")}`
    : next.daysLeft === 0
      ? "Due today"
      : `Due in ${next.daysLeft} ${plural(next.daysLeft, "day")}`;

  const dateLabel = next.due.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border px-5 py-4 transition-colors",
        urgent
          ? "border-primary/30 bg-primary-soft/60 hover:bg-primary-soft"
          : "border-gold/30 bg-gold-soft/50 hover:bg-gold-soft",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          urgent ? "bg-primary/10 text-primary" : "bg-gold/15 text-gold",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
          Next deadline
        </span>
        <span className="block truncate font-display font-bold">
          {next.title}
        </span>
      </span>
      <span className="text-right">
        <span
          className={cn(
            "block font-display text-lg font-bold",
            urgent ? "text-primary" : "text-gold",
          )}
        >
          {countdown}
        </span>
        <span className="block text-xs text-muted">{dateLabel}</span>
      </span>
    </Link>
  );
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}
