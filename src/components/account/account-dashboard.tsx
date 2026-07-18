"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  FileText,
  Hash,
  KeyRound,
  ListChecks,
  MapPin,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import type { City, PhaseWithSteps, Step } from "@/lib/content";
import { stepAppliesTo } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { Button, ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Steps where people most need to stash an official reference number. */
const RECORD_SLUGS = new Set([
  "anmeldung",
  "tax-id",
  "bank-account",
  "residence-permit",
  "national-visa",
  "blocked-account",
  "visa-extension",
]);

interface RecordEntry {
  note: string;
  reference_number: string;
}

function daysBetween(fromISO: string): { dueDate: Date; daysLeft: number } {
  const move = new Date(fromISO + "T00:00:00");
  const due = new Date(move);
  due.setDate(due.getDate() + 14);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  return { dueDate: due, daysLeft };
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AccountDashboard({
  phases,
  cities,
}: {
  phases: PhaseWithSteps[];
  cities: City[];
}) {
  const { ready, profile, progress, session, setProfile } = useVisitorProfile();
  const [records, setRecords] = useState<Record<string, RecordEntry>>({});
  // Mirror latest records into a ref so the blur handler saves current values
  // without stale closures — updated in an effect, never during render.
  const recordsRef = useRef(records);
  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  // Pull the visitor's saved notes / reference numbers once signed in.
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getBrowserClient()
      .from("user_notes")
      .select("step_id, note, reference_number")
      .then(({ data, error }) => {
        if (error || cancelled || !data) return;
        const next: Record<string, RecordEntry> = {};
        for (const row of data) {
          next[row.step_id] = {
            note: row.note ?? "",
            reference_number: row.reference_number ?? "",
          };
        }
        setRecords(next);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const persona = profile.persona;
  const visiblePhases = useMemo(
    () =>
      phases.map((phase) => ({
        ...phase,
        steps: phase.steps.filter((step) => stepAppliesTo(step, persona)),
      })),
    [phases, persona],
  );
  const allSteps = useMemo(
    () => visiblePhases.flatMap((phase) => phase.steps),
    [visiblePhases],
  );

  const totalSteps = allSteps.length;
  const totalDone = allSteps.filter((step) => progress[step.slug]).length;
  const nextStep = allSteps.find((step) => !progress[step.slug]) ?? null;
  const city = cities.find((c) => c.slug === profile.citySlug) ?? null;

  const deadlines = allSteps.filter((step) => step.deadline_rule);
  const recordSteps = allSteps.filter(
    (step) => step.deadline_urgency === "hard" || RECORD_SLUGS.has(step.slug),
  );

  const anmeldungStep = allSteps.find((step) => step.slug === "anmeldung") ?? null;
  const anmeldungDone = Boolean(progress["anmeldung"]);
  const countdown =
    profile.moveInDate && !anmeldungDone
      ? daysBetween(profile.moveInDate)
      : null;

  const hrefFor = (step: Step) =>
    step.city_variable && profile.citySlug
      ? `/cities/${profile.citySlug}/${step.slug}`
      : `/guide/${step.slug}`;

  const commitRecord = (stepId: string) => {
    if (!session) return;
    const rec = recordsRef.current[stepId];
    getBrowserClient()
      .from("user_notes")
      .upsert({
        user_id: session.user.id,
        step_id: stepId,
        note: rec?.note?.trim() ? rec.note.trim() : null,
        reference_number: rec?.reference_number?.trim()
          ? rec.reference_number.trim()
          : null,
      })
      .then(({ error }) => {
        if (error) console.error("Saving record failed:", error);
      });
  };

  if (!ready) {
    return (
      <div aria-hidden className="animate-pulse">
        <div className="h-5 w-28 rounded-full bg-card-muted" />
        <div className="mt-4 h-10 w-2/3 rounded-2xl bg-card-muted" />
        <div className="mt-8 h-32 rounded-3xl bg-card-muted" />
        <div className="mt-4 h-32 rounded-3xl bg-card-muted" />
      </div>
    );
  }

  if (!session) return <SignedOut />;

  const email = session.user.email ?? "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <Kicker>My account</Kicker>
      <h1 className="mt-3 font-display text-4xl font-bold">
        Your command center.
      </h1>
      <p className="mt-2 text-muted">
        Signed in as <span className="font-medium text-foreground">{email}</span>
        {" "}— everything here syncs across your devices.
      </p>

      {/* Anmeldung countdown — the deadline that actually fines people. */}
      {countdown && (
        <div
          className={cn(
            "mt-8 flex items-start gap-4 rounded-3xl border p-6",
            countdown.daysLeft < 0
              ? "border-primary/40 bg-primary-soft"
              : countdown.daysLeft <= 5
                ? "border-primary/30 bg-primary-soft"
                : "border-gold/40 bg-gold-soft",
          )}
        >
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              countdown.daysLeft <= 5
                ? "bg-primary text-primary-foreground"
                : "bg-card text-gold",
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-bold">
              {countdown.daysLeft < 0
                ? `Your Anmeldung window closed ${Math.abs(countdown.daysLeft)} day${Math.abs(countdown.daysLeft) === 1 ? "" : "s"} ago`
                : countdown.daysLeft === 0
                  ? "Register your address today"
                  : `${countdown.daysLeft} day${countdown.daysLeft === 1 ? "" : "s"} left to register your address`}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              German law expects your Anmeldung within 14 days of moving in — by{" "}
              <span className="font-semibold text-foreground">
                {formatDate(countdown.dueDate)}
              </span>{" "}
              based on your move-in date.
            </p>
            {anmeldungStep && (
              <ButtonLink href={hrefFor(anmeldungStep)} size="sm" className="mt-4">
                How to register
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
          </div>
        </div>
      )}

      {/* Move-in date — anchors the countdown above. */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <CalendarClock className="h-5 w-5 text-primary" />
          Your move-in date
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Set the day you move into your German address and we&apos;ll count down
          your legal deadlines for you.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={profile.moveInDate ?? ""}
            onChange={(event) =>
              setProfile({ moveInDate: event.target.value || null })
            }
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-[15px] outline-none focus:border-primary"
          />
          {profile.moveInDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProfile({ moveInDate: null })}
            >
              Clear
            </Button>
          )}
        </div>
      </section>

      {/* Journey snapshot. */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <ListChecks className="h-5 w-5 text-success" />
            Your journey
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {city ? city.name : "No city set"}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
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
        {nextStep && (
          <Link
            href={hrefFor(nextStep)}
            className="mt-4 flex items-center gap-3 rounded-2xl bg-card-muted/60 p-4 transition-colors hover:bg-card-muted"
          >
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Next up
              </span>
              <span className="block font-medium">{nextStep.title}</span>
            </span>
          </Link>
        )}
        <ButtonLink href="/journey" variant="secondary" size="sm" className="mt-4">
          Open my full journey
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </section>

      {/* Deadlines at a glance. */}
      {deadlines.length > 0 && (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <CalendarClock className="h-5 w-5 text-primary" />
            Deadlines to watch
          </p>
          <ul className="mt-4 space-y-3">
            {deadlines.map((step) => (
              <li key={step.slug} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    step.deadline_urgency === "hard"
                      ? "bg-primary"
                      : "bg-gold",
                  )}
                />
                <span className="text-[15px]">
                  <Link
                    href={hrefFor(step)}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {step.title}
                  </Link>
                  <span className="block text-sm text-muted">
                    {step.deadline_rule}
                  </span>
                </span>
                {progress[step.slug] && (
                  <ShieldCheck className="ml-auto h-4 w-4 shrink-0 text-success" />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Records vault — the reference numbers you must never lose. */}
      {recordSteps.length > 0 && (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6">
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <KeyRound className="h-5 w-5 text-gold" />
            Your records vault
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Stash the case numbers and dates each office hands you — the
            Aktenzeichen, your tax ID, appointment dates. They&apos;re private to
            you and synced to your devices.
          </p>
          <div className="mt-5 space-y-4">
            {recordSteps.map((step) => {
              const rec = records[step.id] ?? { note: "", reference_number: "" };
              return (
                <div
                  key={step.id}
                  className="rounded-2xl border border-border bg-card-muted/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={hrefFor(step)}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {step.title}
                    </Link>
                    {progress[step.slug] && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Done
                      </span>
                    )}
                  </div>
                  <label className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                    <Hash className="h-4 w-4 shrink-0 text-muted" />
                    <input
                      type="text"
                      placeholder="Reference / case number"
                      value={rec.reference_number}
                      onChange={(event) =>
                        setRecords((prev) => ({
                          ...prev,
                          [step.id]: {
                            note: prev[step.id]?.note ?? "",
                            reference_number: event.target.value,
                          },
                        }))
                      }
                      onBlur={() => commitRecord(step.id)}
                      className="w-full bg-transparent text-[15px] outline-none"
                    />
                  </label>
                  <div className="mt-2 flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2">
                    <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    <textarea
                      rows={2}
                      placeholder="Notes — appointment date, office, what's left to do…"
                      value={rec.note}
                      onChange={(event) =>
                        setRecords((prev) => ({
                          ...prev,
                          [step.id]: {
                            reference_number:
                              prev[step.id]?.reference_number ?? "",
                            note: event.target.value,
                          },
                        }))
                      }
                      onBlur={() => commitRecord(step.id)}
                      className="w-full resize-y bg-transparent text-[15px] outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <p className="mt-8 flex items-center gap-2 text-xs text-muted">
        <FileText className="h-3.5 w-3.5" />
        Your full document checklist lives on your{" "}
        <Link href="/journey" className="font-medium text-primary hover:underline">
          journey
        </Link>
        .
      </p>
    </motion.div>
  );
}

function SignedOut() {
  const benefits = [
    {
      icon: AlertTriangle,
      title: "Deadline countdowns",
      body: "Set your move-in date and see exactly how long you have to register — before a missed deadline costs you a fine.",
    },
    {
      icon: KeyRound,
      title: "A records vault",
      body: "Keep every case number, tax ID and appointment date in one private place instead of scattered screenshots.",
    },
    {
      icon: ListChecks,
      title: "Progress that follows you",
      body: "Tick steps on your laptop, pick up on your phone — your whole journey stays in sync.",
    },
  ];
  return (
    <div>
      <Kicker>My account</Kicker>
      <h1 className="mt-3 font-display text-4xl font-bold">
        Make Germany feel manageable.
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-muted">
        The guide is free to everyone. An account adds the personal layer — your
        deadlines, your paperwork, your reference numbers — kept private and
        synced across your devices.
      </p>
      <div className="mt-8 grid gap-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="flex items-start gap-4 rounded-3xl border border-border bg-card p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <b.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-bold">{b.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{b.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ButtonLink href="/signin">
          Sign in — it&apos;s free
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <ButtonLink href="/plan" variant="secondary">
          Build my plan first
        </ButtonLink>
      </div>
      <p className="mt-4 text-sm text-muted">
        No password to remember — we email you a one-tap magic link.
      </p>
    </div>
  );
}
