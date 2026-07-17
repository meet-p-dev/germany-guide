"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Circle } from "lucide-react";
import { useVisitorProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";

/** Toggle a step done/undone from its own page — synced with My Journey. */
export function StepDoneButton({ stepSlug }: { stepSlug: string }) {
  const { ready, progress, toggleStep } = useVisitorProfile();
  const done = Boolean(progress[stepSlug]);

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
      {done ? "Done — nice work" : "Mark as done"}
    </motion.button>
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
        You set <span className="font-bold">{cityName}</span> as your city —
        see exactly how this works there.
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
    </Link>
  );
}
