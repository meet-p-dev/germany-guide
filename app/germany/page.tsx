import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getStatesWithCities } from "@/lib/queries/guide";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All cities",
  description:
    "Choose your German city to see local rules for Anmeldung, residence permits and more.",
};

const CITY_GRADIENTS = [
  "from-primary/85 to-primary/50",
  "from-accent/80 to-accent/40",
  "from-primary/70 to-accent/50",
  "from-accent/70 to-primary/50",
  "from-primary/80 to-primary/40",
  "from-accent/75 to-accent/45",
];

export default async function GermanyPage() {
  const states = await getStatesWithCities();

  // Flatten to published cities, largest first, carrying the state label.
  const cities = states
    .flatMap((s) =>
      s.cities
        .filter((c) => c.is_published)
        .map((c) => ({
          slug: c.slug,
          name: c.name_en,
          state: s.name_en,
          population: c.population ?? 0,
        }))
    )
    .sort((a, b) => b.population - a.population);

  return (
    <div className="space-y-10">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Explore by city
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          Pick your German city
        </h1>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">
          Registration, offices and waiting times all change by city. Choose
          yours for the local rules.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city, i) => (
          <Link
            key={city.slug}
            href={`/germany/${city.slug}`}
            className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
          >
            <div
              className={`relative flex h-36 items-end bg-gradient-to-br ${CITY_GRADIENTS[i % CITY_GRADIENTS.length]}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="relative p-4 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  {city.state}
                </div>
                <div className="text-2xl font-extrabold">{city.name}</div>
              </div>
            </div>
            <p className="flex items-center gap-1 p-4 text-sm font-medium text-primary">
              See the process{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Your city missing? We are adding cities continuously — the generic
        guides under{" "}
        <Link href="/" className="underline">
          tasks
        </Link>{" "}
        apply everywhere in Germany.
      </p>
    </div>
  );
}
