import * as React from "react";
import { Check, Lock, Clock, Hourglass, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { JargonGloss } from "./JargonGloss";

/**
 * Step card (Increment 0). One card per journey step. Its three states carry
 * two of the Part-1 rules on their own:
 *  - current   → lit, elevated, Guide-Blue accent, ONE primary action (Rule 1).
 *  - completed → folded to a single quiet row with a green check (Rule 2).
 *  - locked    → dimmed and non-interactive; visible but receded (Rule 2).
 * The title uses <JargonGloss> so no bare German term ever appears (Rule 3).
 */
type StepState = "current" | "completed" | "locked";

/** The deadline is the anxiety-relevant fact — it gets a prominent chip so the
 *  eye lands on it first. */
function DeadlineChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="gg-caption inline-flex items-center gap-1.5 rounded-full border border-gg-amber-ui/45 bg-gg-amber-soft px-2.5 py-1 font-semibold text-gg-amber">
      <Clock className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Wait time and documents are informational — quiet muted meta, no pill, so
 *  they read as secondary detail beside the deadline, not as equal chips. */
function MetaItem({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="gg-caption inline-flex items-center gap-1.5 text-gg-muted">
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}

export function StepCard({
  state,
  index,
  title,
  gloss,
  why,
  deadline,
  wait,
  docs,
  primaryLabel = "Show me how, step by step",
  secondaryLabel,
  className,
}: {
  state: StepState;
  index: number;
  title: string;
  gloss?: string;
  why?: string;
  deadline?: string;
  wait?: string;
  docs?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
}) {
  // ── Completed: folded to one quiet row ────────────────────────────────
  if (state === "completed") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-[14px] border border-gg-border bg-gg-card px-4 py-3",
          className
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gg-progress text-white">
          <Check className="size-4" aria-hidden="true" />
        </span>
        <span className="gg-body-sm min-w-0 truncate font-medium text-gg-muted">
          {gloss ? <JargonGloss term={title} gloss={gloss} /> : title}
        </span>
        <span className="gg-caption ml-auto shrink-0 font-medium text-gg-progress-text">
          Done
        </span>
      </div>
    );
  }

  // ── Locked: dimmed, non-interactive ───────────────────────────────────
  if (state === "locked") {
    return (
      <div
        aria-disabled="true"
        className={cn(
          "pointer-events-none select-none rounded-[14px] border border-gg-border bg-gg-card p-6 opacity-55",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gg-border text-gg-muted">
            <Lock className="size-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="gg-h3 text-gg-ink">
              {gloss ? <JargonGloss term={title} gloss={gloss} /> : title}
            </h3>
            <p className="gg-caption mt-1 text-gg-muted">
              Unlocks after the previous step
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Current: the one lit, dominant card ───────────────────────────────
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] border border-gg-border bg-gg-card p-6 shadow-md",
        // slim Guide-Blue accent bar down the left edge
        "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gg-brand",
        className
      )}
    >
      <div className="flex items-start gap-3 pl-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gg-brand text-[15px] font-semibold text-gg-brand-fg">
          {index}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="gg-h3 text-gg-ink">
            {gloss ? <JargonGloss term={title} gloss={gloss} /> : title}
          </h3>
          {why && <p className="gg-body-sm mt-1.5 text-gg-muted">{why}</p>}

          {(deadline || wait || docs) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              {deadline && <DeadlineChip>{deadline}</DeadlineChip>}
              {(wait || docs) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {wait && <MetaItem icon={Hourglass}>{wait}</MetaItem>}
                  {docs && <MetaItem icon={FileText}>{docs}</MetaItem>}
                </div>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button variant="primary">{primaryLabel}</Button>
            {secondaryLabel && (
              <Button variant="secondary" size="sm">
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
