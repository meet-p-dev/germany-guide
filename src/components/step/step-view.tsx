import Link from "next/link";
import {
  CalendarClock,
  CheckSquare,
  ExternalLink,
  Footprints,
  Globe,
  Lightbulb,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import {
  parseDocuments,
  parseLinks,
  parseTips,
  type StepLink,
} from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { Kicker } from "@/components/ui/kicker";
import { StepDoneButton, YourCityHint } from "@/components/step/step-actions";
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
    className: "bg-success-soft text-success",
  },
  appointment: {
    icon: CalendarClock,
    label: "Appointment",
    className: "bg-gold-soft text-gold",
  },
  email: {
    icon: Mail,
    label: "By email",
    className: "bg-primary-soft text-primary",
  },
  online: {
    icon: Globe,
    label: "Online",
    className: "bg-primary-soft text-primary",
  },
  post: {
    icon: Send,
    label: "By post",
    className: "bg-gold-soft text-gold",
  },
};

export function StepView({
  step,
  activeCitySlug,
}: {
  step: StepWithRelations;
  activeCitySlug: string | null;
}) {
  const documents = parseDocuments(step.documents);
  const officialLinks = parseLinks(step.official_links);
  const cityVariants = step.city_steps
    .filter((cs) => cs.cities)
    .sort((a, b) => (a.cities!.name > b.cities!.name ? 1 : -1));
  const active = activeCitySlug
    ? (cityVariants.find((cs) => cs.cities!.slug === activeCitySlug) ?? null)
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
        <Link href="/process" className="hover:text-foreground">
          The process
        </Link>
        <span aria-hidden>/</span>
        <span>{step.phases?.title}</span>
      </nav>

      <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
        {step.title}
      </h1>
      {step.summary && (
        <p className="mt-4 text-lg leading-relaxed text-muted">{step.summary}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <StepDoneButton stepSlug={step.slug} />
        {step.applies_to !== "both" && (
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm capitalize text-muted">
            {step.applies_to}s only
          </span>
        )}
      </div>

      {/* City switcher — links, not state: every variant is its own SEO page */}
      {step.city_variable && (
        <div className="mt-10">
          <Kicker>How it works in your city</Kicker>
          <div className="mt-3 flex flex-wrap gap-2" role="tablist">
            <CityTab
              href={`/guide/${step.slug}`}
              label="Germany-wide"
              active={!active}
            />
            {cityVariants.map((cs) => (
              <CityTab
                key={cs.id}
                href={`/cities/${cs.cities!.slug}/${step.slug}`}
                label={cs.cities!.name}
                active={active?.id === cs.id}
              />
            ))}
          </div>
          {!active && <YourCityHint stepSlug={step.slug} cityVariants={cityVariants.map((cs) => cs.cities!.slug)} />}
        </div>
      )}

      {/* Active city section */}
      {active && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="border-b border-border bg-card-muted/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                In {active.cities!.name}
              </p>
              {active.method && METHOD_META[active.method] && (
                <MethodChip
                  method={active.method}
                  note={active.method_note}
                />
              )}
            </div>
            {active.last_verified && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Last verified {formatDate(active.last_verified)}
              </p>
            )}
          </div>
          <div className="p-6">
            <Markdown>{active.content_md}</Markdown>

            {active.address && (
              <p className="mt-6 rounded-2xl bg-card-muted/70 p-4 text-sm leading-relaxed">
                <span className="font-semibold">Where:</span> {active.address}
              </p>
            )}

            {parseTips(active.tips).length > 0 && (
              <div className="mt-6 rounded-2xl border border-gold/30 bg-gold-soft/50 p-5">
                <p className="flex items-center gap-2 font-display font-bold">
                  <Lightbulb className="h-4 w-4 text-gold" />
                  Local tips
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/85">
                  {parseTips(active.tips).map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span aria-hidden className="text-gold">
                        —
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <LinkList links={parseLinks(active.links)} />
          </div>
        </section>
      )}

      {/* General content */}
      <section className={cn("mt-10", active && "mt-12")}>
        {active && <Kicker className="mb-4">The Germany-wide basics</Kicker>}
        <Markdown>{step.content_md}</Markdown>
      </section>

      {/* Documents */}
      {documents.length > 0 && (
        <section className="mt-12 rounded-3xl border border-border bg-card p-6">
          <p className="font-display flex items-center gap-2 text-xl font-bold">
            <CheckSquare className="h-5 w-5 text-primary" />
            What to bring
          </p>
          <ul className="mt-4 space-y-3">
            {documents.map((doc) => (
              <li key={doc.name} className="flex items-start gap-3 text-[15px]">
                <span
                  aria-hidden
                  className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
                />
                <span>
                  <span className="font-medium">{doc.name}</span>
                  {doc.note && (
                    <span className="text-muted"> — {doc.note}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <LinkList links={officialLinks} heading="Official sources" />

      <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        General information, not legal advice. Procedures change — verify with
        the official source before acting.
      </p>
    </article>
  );
}

function CityTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted hover:border-foreground/25 hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function MethodChip({ method, note }: { method: string; note: string | null }) {
  const meta = METHOD_META[method];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold",
        meta.className,
      )}
    >
      <Icon className="h-4 w-4" />
      {note ?? meta.label}
    </span>
  );
}

function LinkList({
  links,
  heading = "Links",
}: {
  links: StepLink[];
  heading?: string;
}) {
  if (links.length === 0) return null;
  return (
    <section className="mt-8">
      <p className="font-display font-bold">{heading}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[15px] font-medium text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
