import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Progress indicator (Increment 0) — enforces Part-1 Rule 4 (constant reassurance).
 * The segmented variant is the default: a fixed number of segments makes the
 * journey feel FINITE ("only six stages"), which is the product's core calming
 * promise. A short label ("Stage 2 of 6 · 20% settled") sits above it.
 *
 * Segment states:
 *  - done     → filled (Progress Green)
 *  - current  → half-lit (in-progress)
 *  - upcoming → muted track
 */
export function ProgressBar({
  stage,
  total = 6,
  percent,
  variant = "segmented",
  showLabel = true,
  className,
}: {
  /** 1-based index of the stage the user is currently on */
  stage: number;
  total?: number;
  /** % settled, for the label and for the continuous variant */
  percent?: number;
  variant?: "segmented" | "continuous";
  showLabel?: boolean;
  className?: string;
}) {
  const pct =
    percent ?? Math.round(((Math.max(1, stage) - 1) / total) * 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="gg-body-sm font-semibold text-gg-ink">
            Stage {Math.min(stage, total)} of {total}
          </span>
          <span className="gg-caption text-gg-muted">{pct}% settled</span>
        </div>
      )}

      {variant === "segmented" ? (
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={stage - 1}
          aria-label={`Stage ${stage} of ${total}, ${pct}% settled`}
        >
          {Array.from({ length: total }).map((_, i) => {
            const done = i < stage - 1;
            const current = i === stage - 1;
            return (
              <span
                key={i}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "h-2.5 flex-1 rounded-full transition-colors",
                  done && "bg-gg-progress",
                  // current = its own state: Guide Blue "you are here", ringed so
                  // it's unmistakable against both green (done) and muted (upcoming)
                  current &&
                    "bg-gg-brand ring-2 ring-gg-brand/30 ring-offset-1 ring-offset-gg-card",
                  !done && !current && "bg-gg-border"
                )}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-gg-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`${pct}% complete`}
        >
          <span
            className="block h-full rounded-full bg-gg-progress transition-[width]"
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
      )}
    </div>
  );
}
