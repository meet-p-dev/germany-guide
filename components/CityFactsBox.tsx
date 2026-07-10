import {
  MapPin,
  CalendarClock,
  Footprints,
  Euro,
  Clock,
  Hourglass,
  ExternalLink,
  Globe,
} from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { FreshnessNote } from "@/components/Disclaimer";
import type { Tables } from "@/lib/database.types";

// Ankommen mode badge — derived from our boolean columns. walk-in wins over
// appointment when both are possible; neither known → a neutral "hybrid" note.
const MODE_STYLES = {
  "walk-in": {
    icon: Footprints,
    label: "Walk-in possible",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  appointment: {
    icon: CalendarClock,
    label: "Appointment required",
    cls: "bg-accent/15 text-accent border-accent/40",
  },
  hybrid: {
    icon: MapPin,
    label: "Check the office",
    cls: "bg-primary/10 text-primary border-primary/30",
  },
} as const;

export function CityFactsBox({
  cityName,
  variant,
}: {
  cityName: string;
  variant: Tables<"city_task_variants">;
}) {
  const mode: keyof typeof MODE_STYLES = variant.walk_in_possible
    ? "walk-in"
    : variant.appointment_required
      ? "appointment"
      : "hybrid";
  const ms = MODE_STYLES[mode];
  const ModeIcon = ms.icon;

  const fees =
    variant.fees_eur === 0
      ? "Free of charge"
      : variant.fees_eur != null
        ? `€${variant.fees_eur}${variant.fees_note ? ` — ${variant.fees_note}` : ""}`
        : (variant.fees_note ?? null);

  return (
    <div className="rounded-2xl border border-accent/40 bg-accent/[0.06] p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          In {cityName}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${ms.cls}`}
        >
          <ModeIcon className="h-3.5 w-3.5" /> {ms.label}
        </span>
        {variant.online_possible === true && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Globe className="h-3.5 w-3.5" /> Online option
          </span>
        )}
      </div>

      {variant.office_name && (
        <h4 className="mt-3 text-lg font-bold">{variant.office_name}</h4>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {variant.office_address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(variant.office_address)}`}
              target="_blank"
              rel="noopener nofollow"
              className="hover:underline"
            >
              {variant.office_address}
            </a>
          </div>
        )}
        {variant.office_hours && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{variant.office_hours}</span>
          </div>
        )}
        {variant.typical_wait_time && (
          <div className="flex items-start gap-2 text-sm">
            <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Typical wait: {variant.typical_wait_time}</span>
          </div>
        )}
        {fees && (
          <div className="flex items-start gap-2 text-sm">
            <Euro className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{fees}</span>
          </div>
        )}
        {variant.booking_url && (
          <a
            href={variant.booking_url}
            target="_blank"
            rel="noopener nofollow"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Official booking page <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {variant.city_notes_md && (
        <div className="mt-4 border-t border-accent/30 pt-4 text-sm">
          <Markdown>{variant.city_notes_md}</Markdown>
        </div>
      )}

      <div className="mt-4">
        <FreshnessNote
          lastVerifiedAt={variant.last_verified_at}
          sources={variant.sources}
        />
      </div>
    </div>
  );
}
