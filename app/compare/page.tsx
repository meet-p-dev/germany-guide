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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Compare</h1>
        <p className="max-w-2xl text-muted-foreground">
          Side-by-side comparisons to help you decide faster — how the same task
          differs from city to city, and which services newcomers actually use.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">City by city</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CITY_COMPARISONS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <p className="font-medium">{c.title}</p>
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
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <p className="font-medium">{t.h1}</p>
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
