import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * One shared status pill for the whole content side (letters urgency, problem
 * severity, solution effectiveness, city mode, …). Maps a semantic tone onto
 * the Ankommen `gg-*` status tokens so nothing hardcodes raw Tailwind palette
 * colors. Light + dark are handled by the tokens themselves.
 */
export type StatusTone = "danger" | "warning" | "success" | "info" | "neutral";

const TONE_CLASS: Record<StatusTone, string> = {
  danger: "bg-gg-brand-soft text-gg-brand-ink",
  warning: "bg-gg-amber-soft text-gg-amber",
  success: "bg-gg-progress-soft text-gg-progress-text",
  info: "bg-accent/15 text-accent",
  neutral: "bg-gg-secondary text-gg-muted",
};

export function StatusBadge({
  tone = "neutral",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { tone?: StatusTone }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASS[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
