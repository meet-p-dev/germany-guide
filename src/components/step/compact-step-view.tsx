import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Check,
  Clock,
  Coins,
  ExternalLink,
  Footprints,
  Globe,
  Lightbulb,
  MapPin,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import {
  formatCost,
  getPhasesWithSteps,
  parseDocuments,
  parseLinks,
  parseTips,
  renderQuickAction,
  resolveStepMeta,
} from "@/lib/content";
import { Kicker } from "@/components/ui/kicker";
import {
  NextStepButton,
  StepBreadcrumb,
  StepDoneButton,
} from "@/components/step/step-actions";
import { cn } from "@/lib/utils";

type StepWithRelations = Tables<"steps"> & {
  phases: Tables<"phases"> | null;
  city_steps: (Tables<"city_steps"> & { cities: Tables<"cities"> | null })[];
};

const METHOD_META: Record<
  string,
  { icon: LucideIcon; label: string; className: string }
> = {
  walk_in: {
    icon: Footprints,
    label: "Walk-in",
    className: "border-success/30 bg-success-soft text-success",
  },
  appointment: {
    icon: CalendarClock,
    label: "Appointment needed",
    className: "border-gold/30 bg-gold-soft text-gold",
  },
  email: {
    icon: Mail,
    label: "By email",
    className: "border-primary/25 bg-primary-soft text-primary",
  },
  online: {
    icon: Globe,
    label: "Online",
    className: "border-primary/25 bg-primary-soft text-primary",
  },
  post: {
    icon: Send,
    label: "By post",
    className: "border-gold/30 bg-gold-soft text-gold",
  },
};

type CityVariant = Tables<"city_steps"> & { cities: Tables<"cities"> | null };

/**
 * The compact "Build my plan" lens on a step, for a visitor who has committed
 * to a city. Action-only: the one thing to do here, what to bring, what it
 * costs — with a link out to the full Germany-wide guide for the whole story.
 *
 * `city` is the local override when one exists. When it's null (a federal step
 * with no per-city variant, or a city we haven't detailed yet) the card falls
 * back to the universal quick_action + base figures — never a broken page.
 */
export async function CompactStepView({
  step,
  cityName,
  citySlug,
  city,
}: {
  step: StepWithRelations;
  cityName: string;
  citySlug: string;
  city: CityVariant | null;
}) {
  const meta = resolveStepMeta(step, city);
  const costLabel = formatCost(meta.costCents, meta.costType);
  const costNote =
    meta.costNote &&
    meta.costNote.trim().toLowerCase() !== costLabel?.trim().toLowerCase()
      ? meta.costNote
      : null;

  const method = city?.method && METHOD_META[city.method] ? city.method : null;
  const methodMeta = method ? METHOD_META[method] : null;

  const documents = parseDocuments(step.documents);
  const cityLinks = city ? parseLinks(city.links) : [];
  const officialLinks = parseLinks(step.official_links);
  const primaryAction = cityLinks[0] ?? officialLinks[0] ?? null;
  // Extra local links (e.g. WG-Gesucht, Kleinanzeigen alongside the dorm site)
  // surface as a compact "where to look" list under the primary action.
  const secondaryLinks = cityLinks.slice(1);
  const tips = city ? parseTips(city.tips) : [];

  // Fill the hand-written compact template from this city's real figures.
  // A persona-neutral render: navigation personalises per profile client-side.
  const action = step.quick_action
    ? renderQuickAction(step.quick_action, {
        city: cityName,
        cost: costLabel,
        method: methodMeta?.label.toLowerCase(),
        leadTime: meta.leadTime,
        deadline: meta.deadlineRule,
        address: city?.address,
      })
    : (city?.method_note ?? step.summary ?? "");

  // For the "next step" button, in walking order.
  const phases = await getPhasesWithSteps();
  const orderedSteps = phases.flatMap((phase) => phase.steps);
  const stepIndex = orderedSteps.findIndex((s) => s.slug === step.slug);
  const upcoming = orderedSteps.slice(stepIndex + 1).map((s) => ({
    slug: s.slug,
    title: s.title,
    cityVariable: s.city_variable,
    appliesTo: s.applies_to,
  }));

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <StepBreadcrumb phaseTitle={step.phases?.title ?? null} />

      <div className="mt-6 flex items-center justify-between gap-3">
        <Kicker className="text-primary">Your plan · {cityName}</Kicker>
        <Link
          href={`/cities/${citySlug}`}
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          All of {cityName}
        </Link>
      </div>

      <div className="mt-3 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <header className="border-b border-border p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {step.title}
          </h1>

          {/* The one thing to do — the compact hero. */}
          {action && (
            <p className="mt-4 text-lg leading-relaxed text-foreground/90">
              {action}
            </p>
          )}

          {/* At-a-glance chips: how, cost, deadline, lead time. */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {methodMeta && (
              <Chip icon={methodMeta.icon} className={cn("border", methodMeta.className)}>
                {city?.method_note ?? methodMeta.label}
              </Chip>
            )}
            {costLabel && (
              <Chip
                icon={Coins}
                className="border border-border bg-card-muted/60 text-foreground/80"
              >
                <span className="font-semibold">{costLabel}</span>
                {costNote && <span className="text-muted"> — {costNote}</span>}
              </Chip>
            )}
            {meta.deadlineRule && (
              <Chip
                icon={meta.deadlineUrgency === "hard" ? AlertTriangle : CalendarClock}
                className={cn(
                  "border",
                  meta.deadlineUrgency === "hard"
                    ? "border-primary/25 bg-primary-soft text-primary"
                    : "border-gold/30 bg-gold-soft text-gold",
                )}
              >
                {meta.deadlineUrgency === "hard" && (
                  <span className="font-semibold">Deadline:</span>
                )}{" "}
                {meta.deadlineRule}
              </Chip>
            )}
            {meta.leadTime && (
              <Chip icon={Clock} className="border border-border bg-card-muted/60 text-muted">
                {meta.leadTime}
              </Chip>
            )}
          </div>
        </header>

        <div className="space-y-7 p-6 sm:p-8">
          {city?.address && (
            <p className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/85">
              <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{city.address}</span>
            </p>
          )}

          {/* What to bring — the counter-day pack. */}
          {documents.length > 0 && (
            <section>
              <Kicker className="flex items-center gap-2">
                <Check className="h-4 w-4" aria-hidden />
                What to bring
              </Kicker>
              <ul className="mt-3.5 space-y-2.5">
                {documents.map((doc) => (
                  <li key={doc.name} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      <span className="font-medium">{doc.name}</span>
                      {doc.note && <span className="text-muted"> — {doc.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* One local tip is plenty on the compact card. */}
          {tips.length > 0 && (
            <p className="flex items-start gap-2.5 rounded-2xl border border-gold/30 bg-gold-soft/40 p-4 text-sm leading-relaxed text-foreground/85">
              <Lightbulb aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{tips[0]}</span>
            </p>
          )}

          {primaryAction && (
            <div className="space-y-3">
              <a
                href={primaryAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                <ExternalLink className="h-4 w-4" />
                {primaryAction.label}
              </a>
              {secondaryLinks.length > 0 && (
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {secondaryLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* The bridge to the full guide — the whole idea of the split. */}
          <Link
            href={`/guide/${step.slug}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card-muted/40 px-5 py-4 transition-colors hover:border-foreground/25"
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              <span className="font-display font-bold">Read the full guide</span>
              <span className="hidden text-sm text-muted sm:inline">
                — how this works everywhere, all cases
              </span>
            </span>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-muted" aria-hidden />
          </Link>

          {city?.last_verified && (
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              Verified for {cityName} on {formatDate(city.last_verified)}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card-muted/50 px-6 py-5 sm:px-8">
          <StepDoneButton stepSlug={step.slug} />
          <NextStepButton stepSlug={step.slug} upcoming={upcoming} />
        </footer>
      </div>

      <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        General information, not legal advice. Procedures change — verify with
        the official source before acting.
      </p>
    </article>
  );
}

function Chip({
  icon: Icon,
  className,
  children,
}: {
  icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm leading-snug",
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
