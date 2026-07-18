import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckSquare,
  Clock,
  Coins,
  ExternalLink,
  Footprints,
  Globe,
  KeyRound,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tables } from "@/lib/supabase/types";
import {
  formatCost,
  getPhasesWithSteps,
  getStepGraph,
  isPayableFee,
  parseDocuments,
  parseLinks,
  parsePersonaPoints,
  parseTips,
  resolveStepMeta,
  stepAppliesTo,
  type CostType,
  type Persona,
  type StepLink,
} from "@/lib/content";
import { PersonaCompare } from "@/components/step/persona-compare";
import { VisaQuiz } from "@/components/step/visa-quiz";
import {
  CostEstimator,
  type PersonaCostTotals,
} from "@/components/step/cost-estimator";
import { StepAsk } from "@/components/ai/assist";
import { Markdown } from "@/components/markdown";
import { Kicker } from "@/components/ui/kicker";
import {
  StepBreadcrumb,
  StepDoneButton,
  YourCityHint,
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

export async function StepView({
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

  // City variant (when set) overrides the base cost / timing figures.
  const meta = resolveStepMeta(step, active);
  const costLabel = formatCost(meta.costCents, meta.costType);

  // Resolve prerequisite and "unlocks" titles from the step graph.
  const graph = await getStepGraph();
  const titleFor = (slug: string) =>
    graph.find((n) => n.slug === slug)?.title ?? slug;
  // Guard the arrays: right after a schema change PostgREST can briefly serve
  // rows without the new column, and a crash here would fail the whole build.
  const prerequisites = (step.depends_on ?? []).map((slug) => ({
    slug,
    title: titleFor(slug),
  }));
  const unlocks = graph
    .filter(
      (n) => n.slug !== step.slug && (n.depends_on ?? []).includes(step.slug),
    )
    .map((n) => ({ slug: n.slug, title: n.title }));

  const personaPoints = parsePersonaPoints(step.persona_points);

  // "Do it now": the single most relevant official link — the city's own
  // page when a city is active, otherwise the step's first official source.
  const activeLinks = active ? parseLinks(active.links) : [];
  const primaryAction = activeLinks[0] ?? officialLinks[0] ?? null;

  // The costs-of-living page carries the interactive first-year estimator,
  // fed by the cost fields across the whole journey.
  let estimatorTotals: Record<Persona, PersonaCostTotals> | null = null;
  if (step.slug === "costs-of-living") {
    const phases = await getPhasesWithSteps();
    const allSteps = phases.flatMap((phase) => phase.steps);
    const totalsFor = (persona: Persona): PersonaCostTotals => {
      let oneOffCents = 0;
      let monthlyCents = 0;
      let proofCents = 0;
      for (const s of allSteps) {
        if (!stepAppliesTo(s, persona) || !s.cost_cents) continue;
        const type = s.cost_type as CostType | null;
        if (isPayableFee(type)) oneOffCents += s.cost_cents;
        if (type === "monthly") monthlyCents += s.cost_cents;
        if (type === "proof_of_funds") proofCents += s.cost_cents;
      }
      return { oneOffCents, monthlyCents, proofCents };
    };
    estimatorTotals = {
      student: totalsFor("student"),
      worker: totalsFor("worker"),
    };
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <StepBreadcrumb phaseTitle={step.phases?.title ?? null} />

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

      {/* At-a-glance facts: cost, hard/soft deadline, and lead time. */}
      {(costLabel || meta.deadlineRule || meta.leadTime) && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {costLabel && (
            <FactChip
              icon={Coins}
              className="bg-card text-foreground/80 border border-border"
            >
              <span className="font-semibold">{costLabel}</span>
              {meta.costNote && (
                <span className="text-muted"> — {meta.costNote}</span>
              )}
            </FactChip>
          )}
          {meta.deadlineRule && (
            <FactChip
              icon={meta.deadlineUrgency === "hard" ? AlertTriangle : CalendarClock}
              className={cn(
                meta.deadlineUrgency === "hard"
                  ? "bg-primary-soft text-primary"
                  : "bg-gold-soft text-gold",
              )}
            >
              {meta.deadlineUrgency === "hard" && (
                <span className="font-semibold">Deadline:</span>
              )}{" "}
              {meta.deadlineRule}
            </FactChip>
          )}
          {meta.leadTime && (
            <FactChip icon={Clock} className="bg-card text-muted border border-border">
              {meta.leadTime}
            </FactChip>
          )}
        </div>
      )}

      {/* Dependency map — the chicken-and-egg ordering made explicit. */}
      {(prerequisites.length > 0 || unlocks.length > 0) && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {prerequisites.length > 0 && (
            <DependencyCard
              icon={Lock}
              tone="prereq"
              title="Finish these first"
              items={prerequisites}
              linkFor={(slug) => `/guide/${slug}`}
            />
          )}
          {unlocks.length > 0 && (
            <DependencyCard
              icon={KeyRound}
              tone="unlock"
              title="This unlocks"
              items={unlocks}
              linkFor={(slug) => `/guide/${slug}`}
            />
          )}
        </div>
      )}

      {/* The step at a glance, split by path — spares half-irrelevant prose. */}
      {personaPoints && <PersonaCompare points={personaPoints} />}

      {step.slug === "understand-your-paths" && <VisaQuiz />}
      {estimatorTotals && <CostEstimator totals={estimatorTotals} />}

      {/* One unmistakable action: the official site to actually do this on. */}
      {primaryAction && (
        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-primary/30 bg-primary-soft/50 p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Do it now
            </p>
            <p className="mt-0.5 font-display font-bold">
              {active
                ? `The official page for ${active.cities!.name}`
                : "The official source for this step"}
            </p>
          </div>
          <a
            href={primaryAction.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <ExternalLink className="h-4 w-4" />
            {primaryAction.label}
          </a>
        </section>
      )}

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

      <StepAsk stepSlug={step.slug} />

      <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        General information, not legal advice. Procedures change — verify with
        the official source before acting.
      </p>
    </article>
  );
}

function FactChip({
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

function DependencyCard({
  icon: Icon,
  tone,
  title,
  items,
  linkFor,
}: {
  icon: LucideIcon;
  tone: "prereq" | "unlock";
  title: string;
  items: { slug: string; title: string }[];
  linkFor: (slug: string) => string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "prereq"
          ? "border-border bg-card-muted/60"
          : "border-primary/25 bg-primary-soft/50",
      )}
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Icon
          className={cn(
            "h-4 w-4",
            tone === "prereq" ? "text-muted" : "text-primary",
          )}
        />
        {title}
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={linkFor(item.slug)}
              className="text-sm font-medium text-foreground/85 hover:text-primary hover:underline"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
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
