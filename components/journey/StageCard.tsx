"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { JargonGloss } from "@/components/ds";
import { autoGloss, type GlossaryEntry } from "@/lib/auto-gloss";

/**
 * Explore-mode stage in the six-stage journey (Increment 1). Collapsed by
 * default; expanding reveals the stage's tasks IN PLACE (no navigation) —
 * Part-1 Rule 2 (progressive disclosure). Each task shows its German term with
 * a plain-English gloss (Rule 3) and a quiet one-tap link to the full guide.
 * Built entirely on the locked Increment 0 tokens; the numbered node sits on
 * the shared vertical connector drawn by the parent stepper.
 */
export type StageTask = {
  slug: string;
  title_en: string;
  title_de: string;
  summary: string | null;
};

export function StageCard({
  index,
  name,
  framing,
  tasks,
  glossary,
  emptyNote,
  status,
  defaultOpen = false,
}: {
  index: number;
  name: string;
  framing: string;
  tasks: StageTask[];
  glossary: GlossaryEntry[];
  /** Shown (instead of an expandable panel) when no task applies to this
   *  persona — keeps the six-stage map intact while being honest that this
   *  stage doesn't apply. */
  emptyNote?: string;
  /** Plan mode (Increment 3): mark the numbered node done / now / upcoming.
   *  Omitted in explore/journey mode → the neutral brand-soft node. */
  status?: "done" | "now" | "upcoming";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const nodeBase =
    "z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold";
  const node =
    status === "done" ? (
      <span className={cn(nodeBase, "bg-gg-progress text-white")}>
        <Check className="size-4" aria-hidden="true" />
      </span>
    ) : status === "now" ? (
      <span className={cn(nodeBase, "bg-gg-brand text-gg-brand-fg")}>
        {index}
      </span>
    ) : status === "upcoming" ? (
      <span className={cn(nodeBase, "bg-gg-secondary text-gg-muted")}>
        {index}
      </span>
    ) : (
      <span className={cn(nodeBase, "bg-gg-brand-soft text-gg-brand-ink")}>
        {index}
      </span>
    );
  const panelId = `stage-panel-${index}`;

  // Empty stage: static, non-interactive, honest note. The stage still shows
  // (the map stays whole), just clearly marked as not applicable.
  if (tasks.length === 0) {
    return (
      <li className="relative flex gap-4">
        <span className="z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-gg-secondary text-[15px] font-semibold text-gg-muted">
          {index}
        </span>
        <div className="flex-1 rounded-[14px] border border-gg-border bg-gg-card px-5 py-4">
          <span className="gg-h3 block text-gg-muted">{name}</span>
          <span className="gg-body-sm mt-1 block text-gg-muted">
            {emptyNote ?? "Nothing in this stage applies to your situation."}
          </span>
        </div>
      </li>
    );
  }

  return (
    <li className="relative flex gap-4">
      {/* Numbered node — sits on the connector line drawn by the parent */}
      {node}

      <div className="flex-1 rounded-[14px] border border-gg-border bg-gg-card">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-start justify-between gap-4 rounded-[14px] px-5 py-4 text-left outline-none transition-[filter] hover:brightness-[0.99] focus-visible:ring-2 focus-visible:ring-gg-brand focus-visible:ring-offset-2 focus-visible:ring-offset-gg-surface"
        >
          <span>
            <span className="gg-h3 block text-gg-ink">{name}</span>
            <span className="gg-body-sm mt-1 block text-gg-muted">{framing}</span>
          </span>
          <ChevronDown
            className={cn(
              "mt-1 size-5 shrink-0 text-gg-muted transition-transform",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div
            id={panelId}
            className="border-t border-gg-border px-5 py-4"
          >
            <ul className="space-y-5">
              {tasks.map((t) => (
                <li key={t.slug}>
                  <p className="gg-body font-medium text-gg-ink">
                    <JargonGloss term={t.title_de} gloss={t.title_en} />
                  </p>
                  {t.summary && (
                    <p className="gg-body-sm mt-1 text-gg-muted">
                      {/* Auto-gloss bare German terms in the DB summary; skip
                          the term already hand-glossed in this row's title. */}
                      {autoGloss(t.summary, glossary, {
                        skipTerms: [t.title_de],
                      })}
                    </p>
                  )}
                  <Link
                    href={`/tasks/${t.slug}`}
                    className="gg-body-sm mt-1.5 inline-flex items-center gap-1 font-medium text-gg-brand-ink hover:underline"
                  >
                    See how <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}
