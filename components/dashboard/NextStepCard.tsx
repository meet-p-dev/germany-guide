"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { StepCard } from "@/components/ds";
import { Markdown } from "@/components/Markdown";
import { autoGloss, type GlossaryEntry } from "@/lib/auto-gloss";
import { deadlineFor, docsLabel } from "@/lib/dashboard";
import { getGuidedStepData, type GuidedStepData } from "@/app/dashboard/actions";

/**
 * The single dominant "your next step" card (Increment 4). Wraps the shared
 * StepCard in its `current` state and hydrates it with city-specific facts —
 * office, typical wait, and the city's rule text — fetched for THIS step only
 * via a read-only server action. Deadlines are honest (shown only where a real
 * one exists, e.g. Anmeldung), never invented.
 */
export function NextStepCard({
  index,
  titleDe,
  titleEn,
  summary,
  taskSlug,
  citySlug,
  glossary,
  onMarkDone,
  journeyNote,
  parallelLabel,
}: {
  index: number;
  titleDe: string;
  titleEn: string;
  summary: string | null;
  taskSlug: string;
  citySlug: string | null;
  glossary: GlossaryEntry[];
  onMarkDone: () => void;
  /** Honest per-step journey note (e.g. nationality/embassy hint). */
  journeyNote?: string | null;
  /** "Can be done around the same time as …" hint, or undefined. */
  parallelLabel?: string | null;
}) {
  const [data, setData] = React.useState<GuidedStepData | null>(null);
  const [, startTransition] = React.useTransition();

  React.useEffect(() => {
    let live = true;
    setData(null);
    startTransition(async () => {
      try {
        const d = await getGuidedStepData(taskSlug, citySlug);
        if (live) setData(d);
      } catch {
        if (live) setData(null);
      }
    });
    return () => {
      live = false;
    };
  }, [taskSlug, citySlug]);

  // "Why it matters" — auto-gloss any bare German term in the DB summary
  // (Rule 3), skipping the term already glossed in this card's title.
  const why = summary
    ? autoGloss(summary, glossary, { skipTerms: [titleDe] })
    : undefined;

  const cityNote = (
    <>
      {parallelLabel && (
        <p className="gg-body-sm mt-4 rounded-[12px] border border-gg-border bg-gg-surface p-3 text-gg-muted">
          {parallelLabel}
        </p>
      )}
      {journeyNote && (
        <div className="gg-body-sm mt-3 rounded-[12px] border border-gg-border bg-gg-surface p-4 text-gg-muted">
          <Markdown>{journeyNote}</Markdown>
        </div>
      )}
      {renderCityNote(data)}
    </>
  );

  return (
    <StepCard
      state="current"
      index={index}
      title={titleDe}
      gloss={titleEn}
      why={why}
      deadline={deadlineFor(taskSlug)}
      wait={data?.waitTime ?? undefined}
      docs={docsLabel(data?.docCount)}
      cityNote={cityNote}
      primaryLabel="Show me how, step by step"
      primaryHref={data?.detailHref}
      secondaryLabel="Mark as done"
      onSecondaryClick={onMarkDone}
    />
  );
}

/** City-specific rule text block inside the current card (Done-when: "city
 *  rule text appears inside the current step"). Honest when unverified. */
function renderCityNote(data: GuidedStepData | null): React.ReactNode {
  if (!data || !data.cityName) return null;

  if (!data.hasCityVariant) {
    return (
      <p className="gg-body-sm mt-4 rounded-[12px] border border-gg-border bg-gg-surface p-4 text-gg-muted">
        City-specific details for {data.cityName} aren’t verified yet — the
        standard nationwide process applies. Open the full guide for the general
        steps.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-[12px] border border-gg-border bg-gg-surface p-4">
      <p className="gg-caption inline-flex items-center gap-1.5 font-semibold text-gg-brand-ink">
        <MapPin className="size-3.5" aria-hidden="true" /> In {data.cityName}
      </p>
      {data.officeName && (
        <p className="gg-body-sm mt-1.5 text-gg-ink">
          Handled at <span className="font-medium">{data.officeName}</span>
        </p>
      )}
      {data.cityNoteMd && (
        <div className="gg-body-sm mt-2 text-gg-muted">
          <Markdown>{data.cityNoteMd}</Markdown>
        </div>
      )}
    </div>
  );
}
