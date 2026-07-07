import * as React from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dimmed / locked list item (Increment 0) — enforces Part-1 Rule 2
 * (progressive disclosure). A future item the user cannot act on yet:
 * visibly present so the path feels mapped, but receded and non-interactive
 * so it never competes with the current step.
 */
export function LockedListItem({
  label,
  sublabel,
  className,
}: {
  label: string;
  sublabel?: string;
  className?: string;
}) {
  return (
    <div
      aria-disabled="true"
      className={cn(
        "pointer-events-none flex select-none items-center gap-3 rounded-[10px] border border-gg-border/70 bg-gg-card px-4 py-3 opacity-55",
        className
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-gg-border text-gg-muted">
        <Lock className="size-3" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="gg-body-sm block truncate font-medium text-gg-ink">
          {label}
        </span>
        {sublabel && (
          <span className="gg-caption block truncate text-gg-muted">
            {sublabel}
          </span>
        )}
      </span>
      <span className="gg-caption ml-auto shrink-0 text-gg-muted">Locked</span>
    </div>
  );
}
