import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, GitCompareArrows, MapPin } from "lucide-react";
import { getJourney } from "@/lib/queries/journey";
import { getStatesWithCities } from "@/lib/queries/guide";
import { GuideJourney } from "@/components/GuideJourney";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The complete process — settling in Germany step by step",
  description:
    "The whole path through German bureaucracy, phase by phase: visa, Anmeldung, bank, tax ID, health insurance, residence permit and settling in. Pick your city for the exact local rules.",
};

export default async function ProcessPage() {
  const [{ phases }, states] = await Promise.all([
    getJourney("student"),
    getStatesWithCities(),
  ]);

  const cities = states
    .flatMap((s) =>
      s.cities
        .filter((c) => c.is_published)
        .map((c) => ({ slug: c.slug, name: c.name_en, population: c.population ?? 0 }))
    )
    .sort((a, b) => b.population - a.population);

  return (
    <div className="space-y-12">
      <header className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          The complete process
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          Settling in Germany, <span className="text-primary">step by step.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-foreground/80">
          Wherever you land in Germany, the journey is the same — get your visa,
          find a home, register your address, sort out money, health insurance
          and your residence permit. What changes is the{" "}
          <span className="font-semibold">local rulebook</span>: one city lets you
          walk in, the next demands an appointment booked weeks ahead.
        </p>
        <p className="mt-3 text-foreground/70">
          Read the process below. Whenever a step&apos;s rules depend on where you
          live, you&apos;ll see a{" "}
          <span className="font-semibold text-accent">&ldquo;varies by city&rdquo;</span>{" "}
          tag — pick your city to reveal the exact office, cost and waiting time.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg" className="gap-2 rounded-full font-semibold">
            <Link href="/explore">
              Build my personal plan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 rounded-full font-semibold"
          >
            <Link href="/compare">
              <GitCompareArrows className="h-4 w-4" /> Compare cities
            </Link>
          </Button>
        </div>
      </header>

      {cities.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Jump straight to your city
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/germany/${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium hover:border-primary/40"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {c.name}
              </Link>
            ))}
            {cities.length > 6 && (
              <Link
                href="/germany"
                className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-primary hover:underline"
              >
                +{cities.length - 6} more
              </Link>
            )}
          </div>
        </div>
      )}

      <GuideJourney
        phases={phases}
        cities={cities.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
