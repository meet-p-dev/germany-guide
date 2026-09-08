import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeEuro,
  BookOpen,
  Briefcase,
  ExternalLink,
  FileCheck,
  Map,
  Rss,
  TramFront,
} from "lucide-react";
import { getUpdates, type Update } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { SubscribeForm } from "@/components/newsletter/subscribe-form";
import { Kicker } from "@/components/ui/kicker";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const BASE_URL = "https://www.germanyguide.net";

export const metadata: Metadata = {
  title: "What Changed in Germany for Internationals",
  description:
    "Fee changes, new rules and procedure updates that affect international students and workers in Germany: short, sourced and linked to the step they touch.",
  alternates: {
    canonical: `${BASE_URL}/updates`,
    types: { "application/rss+xml": `${BASE_URL}/updates/feed.xml` },
  },
};

export const revalidate = 3600;

const CATEGORY_META: Record<string, { label: string; icon: typeof BadgeEuro }> =
  {
    money: { label: "Money", icon: BadgeEuro },
    transport: { label: "Transport", icon: TramFront },
    visa: { label: "Visa", icon: FileCheck },
    study: { label: "Study", icon: BookOpen },
    work: { label: "Work", icon: Briefcase },
    guide: { label: "The guide", icon: Map },
  };

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}

function UpdateCard({ update }: { update: Update }) {
  const meta = CATEGORY_META[update.category];
  const Icon = meta?.icon ?? Map;
  return (
    <article
      id={update.slug}
      className="rounded-3xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 font-semibold text-primary">
          <Icon className="h-3.5 w-3.5" />
          {meta?.label ?? "Update"}
        </span>
        <time dateTime={update.published_at} className="font-medium text-muted">
          {formatDate(update.published_at)}
        </time>
      </div>
      <h2 className="font-display mt-3 text-xl font-bold leading-snug sm:text-2xl">
        {update.title}
      </h2>
      <Markdown className="mt-2 text-[15px]">{update.body_md}</Markdown>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {update.step_slug && (
          <Link
            href={`/guide/${update.step_slug}`}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            The step this affects
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        {update.source_url && (
          <a
            href={update.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-muted transition-colors hover:text-foreground"
          >
            Source: {update.source_name ?? "official site"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

export default async function UpdatesPage() {
  const updates = await getUpdates();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Kicker>Updates</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        What changed in Germany.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        Fees rise, rules shift, cities change their procedures. Everything here
        is a change that actually affects internationals: short, sourced, and
        linked to the step it touches. No general news.
      </p>
      <a
        href="/updates/feed.xml"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <Rss className="h-4 w-4" />
        Subscribe via RSS
      </a>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-7">
        <h2 className="font-display text-xl font-bold text-foreground">
          Get these by email
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
          One short email when something on this page changes, roughly monthly and
          never more. No news roundups, no marketing, no passing your address to
          anyone.
        </p>
        <SubscribeForm source="updates" className="mt-5 max-w-lg" />
      </section>

      <Stagger className="mt-10 grid gap-4">
        {updates.map((update) => (
          <StaggerItem key={update.slug}>
            <UpdateCard update={update} />
          </StaggerItem>
        ))}
      </Stagger>

      <p className="mt-10 rounded-2xl border border-border bg-card-muted/60 p-5 text-sm leading-relaxed text-muted">
        Spotted a change we missed: a fee, a rule, a city switching to
        appointment-only? The guide gets better when people tell us. Every item
        above is checked against an official source before it appears here.
      </p>
    </div>
  );
}
