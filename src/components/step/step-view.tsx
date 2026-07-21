import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  CalendarClock,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  Coins,
  Compass,
  Euro,
  ExternalLink,
  FileCheck,
  Footprints,
  Globe,
  GraduationCap,
  HeartPulse,
  Home,
  KeyRound,
  Landmark,
  Languages,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Plane,
  Receipt,
  Send,
  ShieldCheck,
  Smartphone,
  Stamp,
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
  NextStepButton,
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
    label: "Walk-in available",
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

/** The card's header icon, resolved from what the step is about. */
const STEP_ICONS: [RegExp, LucideIcon][] = [
  [/anmeldung|register|meld/, MapPin],
  [/visa|permit|aufenthalt|auslaender|behoerde/, Stamp],
  [/university|admission|uni-assist|study|enrol/, GraduationCap],
  [/bank|blocked|sperrkonto|account|fund/, Landmark],
  [/insurance|health|kranken/, HeartPulse],
  [/housing|apartment|flat|wohnung|accommodation/, Home],
  [/job|work|employ/, Briefcase],
  [/language|german|deutsch/, Languages],
  [/cost|living|budget/, Coins],
  [/phone|sim|mobile/, Smartphone],
  [/tax|steuer/, Receipt],
  [/flight|travel|arriv|pack/, Plane],
  [/path|understand|choose/, Compass],
  [/document|apostille|translat/, FileCheck],
];

function stepIcon(slug: string): LucideIcon {
  return STEP_ICONS.find(([re]) => re.test(slug))?.[1] ?? ClipboardList;
}

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
  // A note that just repeats the label ("Free — Free") adds nothing.
  const costNote =
    meta.costNote &&
    meta.costNote.trim().toLowerCase() !== costLabel?.trim().toLowerCase()
      ? meta.costNote
      : null;

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
  const activeTips = active ? parseTips(active.tips) : [];

  // The journey in walking order: feeds the "next step" button and, on the
  // costs page, the estimator.
  const phases = await getPhasesWithSteps();
  const orderedSteps = phases.flatMap((phase) => phase.steps);
  const stepIndex = orderedSteps.findIndex((s) => s.slug === step.slug);
  const upcoming = orderedSteps.slice(stepIndex + 1).map((s) => ({
    slug: s.slug,
    title: s.title,
    cityVariable: s.city_variable,
    appliesTo: s.applies_to,
  }));

  // The costs-of-living page carries the interactive first-year estimator,
  // fed by the cost fields across the whole journey.
  let estimatorTotals: Record<Persona, PersonaCostTotals> | null = null;
  if (step.slug === "costs-of-living") {
    const allSteps = orderedSteps;
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

      {/* City switcher — links, not state: every variant is its own SEO page */}
      {step.city_variable && (
        <div className="mt-6">
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
          {!active && (
            <YourCityHint
              stepSlug={step.slug}
              cityVariants={cityVariants.map((cs) => cs.cities!.slug)}
            />
          )}
        </div>
      )}

      {/* The step as one card: header, facts, city panel, checklists, action. */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Card header: icon tile + title + one-line promise */}
        <header className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <IconTile icon={stepIcon(step.slug)} />
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-bold sm:text-4xl">
                {step.title}
              </h1>
              {step.summary && (
                <p className="mt-2 text-base leading-relaxed text-muted sm:text-lg">
                  {step.summary}
                </p>
              )}
            </div>
          </div>

          {/* At-a-glance facts: cost, hard/soft deadline, and lead time. */}
          {(costLabel ||
            meta.deadlineRule ||
            meta.leadTime ||
            step.applies_to !== "both") && (
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {costLabel && (
                <FactChip
                  icon={Coins}
                  className="border border-border bg-card-muted/60 text-foreground/80"
                >
                  <span className="font-semibold">{costLabel}</span>
                  {costNote && (
                    <span className="text-muted"> — {costNote}</span>
                  )}
                </FactChip>
              )}
              {meta.deadlineRule && (
                <FactChip
                  icon={
                    meta.deadlineUrgency === "hard"
                      ? AlertTriangle
                      : CalendarClock
                  }
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
                </FactChip>
              )}
              {meta.leadTime && (
                <FactChip
                  icon={Clock}
                  className="border border-border bg-card-muted/60 text-muted"
                >
                  {meta.leadTime}
                </FactChip>
              )}
              {step.applies_to !== "both" && (
                <FactChip
                  icon={step.applies_to === "student" ? GraduationCap : Briefcase}
                  className="border border-border bg-card-muted/60 capitalize text-muted"
                >
                  {step.applies_to}s only
                </FactChip>
              )}
            </div>
          )}
        </header>

        <div className="space-y-8 px-6 pb-8 sm:px-8">
          {/* City panel — the local specifics, framed like a field note. */}
          {active && (
            <section className="rounded-2xl border border-gold/35 bg-gold-soft/40 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Kicker className="text-gold">
                  For this city — {active.cities!.name}
                </Kicker>
                {active.method && METHOD_META[active.method] && (
                  <MethodChip method={active.method} note={active.method_note} />
                )}
              </div>

              <div className="mt-4">
                <Markdown>{active.content_md}</Markdown>
              </div>

              {/* Fact grid: where, when, what it costs, where to do it. */}
              {(active.address || meta.leadTime || costLabel || primaryAction) && (
                <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-gold/25 pt-5 sm:grid-cols-2">
                  {active.address && (
                    <CityFact icon={MapPin}>{active.address}</CityFact>
                  )}
                  {meta.leadTime && (
                    <CityFact icon={Clock}>{meta.leadTime}</CityFact>
                  )}
                  {costLabel && (
                    <CityFact icon={Euro}>
                      <span className="font-semibold">{costLabel}</span>
                      {costNote && (
                        <span className="text-muted"> — {costNote}</span>
                      )}
                    </CityFact>
                  )}
                  {primaryAction && (
                    <a
                      href={primaryAction.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-2.5 text-sm font-semibold text-primary hover:underline"
                    >
                      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                      {primaryAction.label}
                    </a>
                  )}
                </div>
              )}

              {activeTips.length > 0 && (
                <ul className="mt-5 space-y-2.5 border-t border-gold/25 pt-5">
                  {activeTips.map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/85"
                    >
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {tip}
                    </li>
                  ))}
                </ul>
              )}

              {active.last_verified && (
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  Last verified {formatDate(active.last_verified)}
                </p>
              )}
            </section>
          )}

          {/* One unmistakable action when no city panel carries the link. */}
          {!active && primaryAction && (
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary-soft/50 p-5">
              <div className="min-w-0">
                <Kicker className="text-primary">Do it now</Kicker>
                <p className="mt-0.5 font-display font-bold">
                  The official source for this step
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

          {/* The step at a glance, split by path — spares half-irrelevant prose. */}
          {personaPoints && <PersonaCompare points={personaPoints} />}

          {step.slug === "understand-your-paths" && <VisaQuiz />}
          {estimatorTotals && <CostEstimator totals={estimatorTotals} />}

          {/* The full write-up. On city pages the local panel already carries
              the actionable part, so the basics fold away instead of piling
              a second essay onto the card. */}
          {active ? (
            <details className="group rounded-2xl border border-border bg-card-muted/30 px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden">
                <BookOpen className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span className="flex-1 font-display font-bold">
                  The Germany-wide basics
                </span>
                <span className="hidden text-sm text-muted sm:block">
                  how this works everywhere
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="pt-4">
                <Markdown>{step.content_md}</Markdown>
              </div>
            </details>
          ) : (
            <section>
              <Markdown>{step.content_md}</Markdown>
            </section>
          )}

          {/* Dependency map — the chicken-and-egg ordering, one slim strip. */}
          {(prerequisites.length > 0 || unlocks.length > 0) && (
            <div className="space-y-2.5 rounded-2xl border border-border bg-card-muted/40 p-4 text-sm">
              {prerequisites.length > 0 && (
                <DependencyRow
                  icon={Lock}
                  iconClass="text-muted"
                  label="Finish first:"
                  items={prerequisites}
                />
              )}
              {unlocks.length > 0 && (
                <DependencyRow
                  icon={KeyRound}
                  iconClass="text-primary"
                  label="Unlocks:"
                  items={unlocks}
                />
              )}
            </div>
          )}

          {/* Checklist columns: papers in one hand, sources in the other. */}
          {(documents.length > 0 || officialLinks.length > 0) && (
            <div className="grid gap-x-8 gap-y-6 border-t border-border pt-6 sm:grid-cols-2">
              {documents.length > 0 && (
                <section>
                  <Kicker className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" aria-hidden />
                    What to bring
                  </Kicker>
                  <ul className="mt-3.5 space-y-2.5">
                    {documents.map((doc) => (
                      <li
                        key={doc.name}
                        className="flex items-start gap-2.5 text-sm leading-relaxed"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
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
              {officialLinks.length > 0 && (
                <section>
                  <Kicker className="flex items-center gap-2">
                    <Globe className="h-4 w-4" aria-hidden />
                    Official sources
                  </Kicker>
                  <ul className="mt-3.5 space-y-2.5">
                    {officialLinks.map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-start gap-2.5 text-sm font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Card footer: tick it off, then walk straight on. */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card-muted/50 px-6 py-5 sm:px-8">
          <StepDoneButton stepSlug={step.slug} />
          <NextStepButton stepSlug={step.slug} upcoming={upcoming} />
        </footer>
      </div>

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

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      aria-hidden
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card-muted"
    >
      <Icon className="h-6 w-6 text-foreground/75" />
    </span>
  );
}

function CityFact({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <p className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/85">
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
      <span>{children}</span>
    </p>
  );
}

function DependencyRow({
  icon: Icon,
  iconClass,
  label,
  items,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  items: { slug: string; title: string }[];
}) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-relaxed">
      <Icon className={cn("h-4 w-4 shrink-0", iconClass)} aria-hidden />
      <span className="font-semibold">{label}</span>
      {items.map((item, index) => (
        <span key={item.slug} className="inline-flex items-center gap-x-2">
          <Link
            href={`/guide/${item.slug}`}
            className="font-medium text-foreground/85 hover:text-primary hover:underline"
          >
            {item.title}
          </Link>
          {index < items.length - 1 && (
            <span aria-hidden className="text-muted">
              ·
            </span>
          )}
        </span>
      ))}
    </p>
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
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold",
        meta.className,
      )}
    >
      <Icon className="h-4 w-4" />
      {note ?? meta.label}
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
