import {
  Clock,
  ExternalLink,
  HeartPulse,
  Home,
  Landmark,
  ShieldCheck,
  Sunrise,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CITY_FACT_CATEGORIES,
  CITY_FACT_LABELS,
  parseLinks,
  type CityFact,
  type CityFactCategory,
} from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { Kicker } from "@/components/ui/kicker";
import { Reveal } from "@/components/motion/reveal";

const CATEGORY_ICON: Record<CityFactCategory, LucideIcon> = {
  first_days: Sunrise,
  housing: Home,
  insurance: HeartPulse,
  banking: Landmark,
  while_waiting: Clock,
};

/**
 * The city hub's reference sections — the local info that isn't a task:
 * housing & rent, dorms, insurance & bank offices, first days, while-waiting.
 * Every fact carries its source + last_verified, per the project rules.
 */
export function CityFactsSections({
  cityName,
  facts,
}: {
  cityName: string;
  facts: CityFact[];
}) {
  const byCategory = CITY_FACT_CATEGORIES.map((category) => ({
    category,
    items: facts.filter((f) => f.category === category),
  })).filter((group) => group.items.length > 0);

  if (byCategory.length === 0) return null;

  return (
    <div className="mt-16 space-y-14">
      <Reveal>
        <Kicker>Settling into {cityName}</Kicker>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
          Beyond the paperwork — living here.
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          The local things that aren&apos;t a form to file: where to live, who to
          insure with, which bank, and what to do while you wait.
        </p>
      </Reveal>

      {byCategory.map(({ category, items }) => {
        const Icon = CATEGORY_ICON[category];
        return (
          <Reveal key={category}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-2xl font-bold">
                {CITY_FACT_LABELS[category]}
              </h3>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {items.map((fact) => (
                <FactCard key={fact.id} fact={fact} />
              ))}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

function FactCard({ fact }: { fact: CityFact }) {
  const links = parseLinks(fact.links);
  return (
    <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
      <h4 className="font-display text-lg font-bold leading-snug">{fact.title}</h4>
      {fact.content_md && (
        <div className="mt-3 text-sm leading-relaxed text-foreground/85">
          <Markdown>{fact.content_md}</Markdown>
        </div>
      )}
      {links.length > 0 && (
        <ul className="mt-4 space-y-2">
          {links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {(fact.source || fact.last_verified) && (
        <p className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-5 text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
          {fact.source && <span>{fact.source}</span>}
          {fact.source && fact.last_verified && <span aria-hidden>·</span>}
          {fact.last_verified && (
            <span>
              verified{" "}
              {new Date(fact.last_verified).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </p>
      )}
    </article>
  );
}
