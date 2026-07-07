import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Inline jargon gloss (Increment 0) — enforces Part-1 Rule 3.
 * Renders a German bureaucratic term with a plain-English gloss right beside it,
 * every time, e.g.  Anmeldung (register your address).
 * Inline by default so it flows inside a heading or a sentence.
 */
export function JargonGloss({
  term,
  gloss,
  className,
}: {
  term: string;
  gloss: string;
  className?: string;
}) {
  return (
    <span className={cn("inline", className)}>
      <span className="border-b border-dotted border-gg-teal/60 font-medium text-gg-ink">
        {term}
      </span>{" "}
      <span className="font-normal text-gg-muted">({gloss})</span>
    </span>
  );
}
