import {
  Lightbulb, MapPin, CalendarClock, Footprints, Euro, Clock, ExternalLink,
} from "lucide-react";

export const modeStyles = {
  "walk-in": { icon: Footprints, cls: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
  appointment: { icon: CalendarClock, cls: "bg-accent/15 text-accent border-accent/40" },
  hybrid: { icon: MapPin, cls: "bg-primary/10 text-primary border-primary/30" },
};

export const CityInfo = ({ info, cityName }) => {
  if (!info) return null;
  const ms = modeStyles[info.mode] || modeStyles.hybrid;
  const ModeIcon = ms.icon;
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/[0.06] p-5" data-testid="city-info-block">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {cityName ? `In ${cityName}` : "For this city"}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${ms.cls}`} data-testid="city-mode-badge">
          <ModeIcon className="h-3.5 w-3.5" /> {info.mode_label}
        </span>
      </div>
      <h4 className="mt-3 font-display text-lg font-bold">{info.office}</h4>
      <p className="mt-1 text-sm text-foreground/80">{info.detail}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{info.address}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{info.processing_time}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Euro className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{info.cost}</span>
        </div>
        {info.booking_url && (
          <a
            href={info.booking_url}
            target="_blank"
            rel="noreferrer"
            data-testid="city-booking-link"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Official page <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {info.local_tips?.length > 0 && (
        <ul className="mt-4 space-y-2">
          {info.local_tips.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
