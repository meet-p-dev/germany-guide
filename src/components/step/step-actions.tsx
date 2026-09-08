"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Circle, Lock } from "lucide-react";
import { useVisitorProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";

/**
 * Breadcrumb that respects which spine the visitor is travelling on. Steps are
 * reached from two places — the generic "The process" overview and a visitor's
 * personalised journey — so a fixed link back to /process ejects committed
 * visitors out of their own flow. Once the profile has hydrated and shows a
 * saved plan, the crumb leads back to /journey instead. Before hydration we
 * render the neutral /process link so server and first client paint agree.
 */
export function StepBreadcrumb({ phaseTitle }: { phaseTitle: string | null }) {
  const { ready, profile } = useVisitorProfile();
  const hasPlan =
    ready &&
    (profile.stage !== null ||
      profile.persona !== null ||
      profile.citySlug !== null);
  const back = hasPlan
    ? { href: "/journey", label: "My journey" }
    : { href: "/process", label: "The process" };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-muted"
    >
      <Link href={back.href} className="hover:text-foreground">
        {back.label}
      </Link>
      {phaseTitle && (
        <>
          <span aria-hidden>/</span>
          <span>{phaseTitle}</span>
        </>
      )}
    </nav>
  );
}

/**
 * Toggle a step done/undone from its own page — synced with My Journey.
 * Progress is an account feature (the journey itself is behind sign-in), so a
 * signed-out visitor is invited to sign in rather than ticking a checkbox that
 * has nowhere to live and nothing to sync to.
 */
export function StepDoneButton({ stepSlug }: { stepSlug: string }) {
  const { ready, session, progress, toggleStep } = useVisitorProfile();
  const done = Boolean(progress[stepSlug]);

  if (ready && !session) {
    return (
      <Link
        href="/signin"
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-[15px] font-medium transition-all hover:border-foreground/30 hover:shadow-sm"
      >
        <Lock className="h-4 w-4 text-muted" />
        Sign in to track this
      </Link>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => toggleStep(stepSlug)}
      disabled={!ready}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition-all",
        done
          ? "border-success bg-success-soft text-success"
          : "border-border bg-card hover:border-foreground/30 hover:shadow-sm",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span
            key="done"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="todo"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <Circle className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {done ? "Done" : "Mark as done"}
    </motion.button>
  );
}

export interface UpcomingStep {
  slug: string;
  title: string;
  cityVariable: boolean;
  appliesTo: string;
}

/**
 * "Next step" companion to the done button: always present so the journey can
 * be walked page by page, and promoted to the primary action the moment the
 * current step is ticked. Skips steps that don't apply to the visitor's path
 * and steps already done; respects the visitor's city on city-variable steps.
 */
export function NextStepButton({
  stepSlug,
  upcoming,
}: {
  stepSlug: string;
  upcoming: UpcomingStep[];
}) {
  const { ready, profile, progress } = useVisitorProfile();
  if (!ready) return null;

  const next = upcoming.find(
    (s) =>
      (s.appliesTo === "both" ||
        profile.persona === null ||
        s.appliesTo === profile.persona) &&
      !progress[s.slug],
  );
  if (!next) return null;

  const done = Boolean(progress[stepSlug]);
  const href =
    next.cityVariable && profile.citySlug
      ? `/cities/${profile.citySlug}/${next.slug}`
      : `/guide/${next.slug}`;

  return (
    <motion.span
      key={done ? "done" : "todo"}
      initial={{ scale: 0.95, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="inline-flex max-w-full"
    >
      <Link
        href={href}
        className={cn(
          "inline-flex h-11 max-w-full items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition-all",
          done
            ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover"
            : "border-border bg-card text-foreground hover:border-foreground/30 hover:shadow-sm",
        )}
      >
        <span className="truncate">
          <span className={done ? "" : "text-muted"}>Next:</span> {next.title}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </Link>
    </motion.span>
  );
}

/**
 * On the Germany-wide view of a city-variable step: if the visitor has set a
 * city with a local variant, nudge them to it.
 */
export function YourCityHint({
  stepSlug,
  cityVariants,
}: {
  stepSlug: string;
  cityVariants: string[];
}) {
  const { ready, profile } = useVisitorProfile();
  if (!ready || !profile.citySlug || !cityVariants.includes(profile.citySlug)) {
    return null;
  }
  const cityName =
    profile.citySlug.charAt(0).toUpperCase() + profile.citySlug.slice(1);
  return (
    <Link
      href={`/cities/${profile.citySlug}/${stepSlug}`}
      className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-4 text-sm font-medium transition-all hover:shadow-md"
    >
      <span>
        You set <span className="font-bold">{cityName}</span> as your city. See
        exactly how this works there.
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
    </Link>
  );
}
