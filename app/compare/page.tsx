import Link from "next/link";
import type { Metadata } from "next";
import { COMPARE_TOPICS } from "@/lib/compare";

export const metadata: Metadata = {
  title: "Compare — cities & services for newcomers in Germany",
  description:
    "Side-by-side comparisons for internationals in Germany: how Anmeldung differs city by city, plus the best blocked account, health insurance and bank account.",
};

// City-by-city comparisons (hand-listed; each is its own route).
const CITY_COMPARISONS = [
  {
    href: "/compare/anmeldung",
    title: "Anmeldung, city by city",
    blurb:
      "How address registration differs across 15 German cities — appointment vs walk-in, typical waits, booking portals and online options.",
  },
];

export default function CompareIndexPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Compare
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Decide faster, side by side
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Side-by-side comparisons to help you decide faster — how the same task
          differs from city to city, and which services newcomers actually use.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">City by city</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CITY_COMPARISONS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
            >
              <p className="font-semibold">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Choosing a service</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {COMPARE_TOPICS.map((t) => (
            <Link
              key={t.slug}
              href={`/compare/${t.slug}`}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
            >
              <p className="font-semibold">{t.h1}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
