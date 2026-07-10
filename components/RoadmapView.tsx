"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RoadmapStep = {
  slug: string;
  titleEn: string;
  titleDe: string;
  summary: string | null;
};
export type RoadmapPhase = {
  slug: string;
  name: string;
  framing: string;
  steps: RoadmapStep[];
};
export type RoadmapCity = { slug: string; name: string; state: string } | null;

/**
 * Interactive relocation roadmap (Ankommen funnel). Renders the persona's
 * tasks grouped by phase as checkable steps with a live progress bar.
 * Completion is stored in localStorage keyed by persona+city — guest-friendly,
 * no account required (server-side per-account persistence is a later step).
 */
export function RoadmapView({
  persona,
  personaLabel,
  city,
  phases,
}: {
  persona: string;
  personaLabel: string;
  city: RoadmapCity;
  phases: RoadmapPhase[];
}) {
  const storageKey = `gg:roadmap:${persona}:${city?.slug ?? "generic"}`;
  const allSlugs = useMemo(
    () => phases.flatMap((p) => p.steps.map((s) => s.slug)),
    [phases]
  );

  const [done, setDone] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Load saved progress once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setDone(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* ignore corrupt/unavailable storage */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const toggle = (slug: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const total = allSlugs.length;
  const completed = allSlugs.filter((s) => done.has(s)).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  // City-aware guide link: full city guide when a city is chosen, else the
  // generic nationwide task guide.
  const stepHref = (slug: string) =>
    city ? `/germany/${city.slug}/${slug}` : `/tasks/${slug}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      {/* Progress sidebar */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-6">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Your progress
          </span>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-extrabold text-primary">
              {hydrated ? pct : 0}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${hydrated ? pct : 0}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {hydrated ? completed : 0} of {total} steps complete
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-5 w-full gap-2 rounded-full font-semibold"
          >
            <Link href="/explore">
              <Pencil className="h-4 w-4" /> Change situation / city
            </Link>
          </Button>
        </div>
      </aside>

      {/* Steps */}
      <div className="space-y-10">
        {phases.map((phase, pi) => (
          <section key={phase.slug}>
            <div className="flex items-baseline gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {pi + 1}
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{phase.name}</h2>
                <p className="text-sm text-muted-foreground">{phase.framing}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-3 pl-10">
              {phase.steps.map((step) => {
                const isDone = done.has(step.slug);
                return (
                  <li
                    key={step.slug}
                    className={cn(
                      "rounded-2xl border bg-card p-4 transition-colors",
                      isDone ? "border-primary/30" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggle(step.slug)}
                        aria-pressed={isDone}
                        aria-label={
                          isDone ? "Mark as not done" : "Mark as done"
                        }
                        className={cn(
                          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                          isDone
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {isDone && <Check className="h-4 w-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-semibold",
                            isDone && "text-muted-foreground line-through"
                          )}
                        >
                          {step.titleEn}{" "}
                          <span className="font-normal text-muted-foreground">
                            ({step.titleDe})
                          </span>
                        </p>
                        {step.summary && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {step.summary}
                          </p>
                        )}
                        <Link
                          href={stepHref(step.slug)}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          {city ? (
                            <>
                              <MapPin className="h-3.5 w-3.5" /> How to do this in{" "}
                              {city.name}
                            </>
                          ) : (
                            <>
                              See how <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
