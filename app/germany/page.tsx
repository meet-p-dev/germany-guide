import Link from "next/link";
import type { Metadata } from "next";
import { getStatesWithCities } from "@/lib/queries/guide";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All cities",
  description:
    "Choose your German city to see local rules for Anmeldung, residence permits and more.",
};

export default async function GermanyPage() {
  const states = await getStatesWithCities();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Choose your city</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {states.map((state) => (
          <div key={state.id}>
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {state.name_en}
            </h2>
            <ul className="space-y-1">
              {state.cities
                .filter((c) => c.is_published)
                .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
                .map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/germany/${city.slug}`}
                      className="font-medium hover:underline"
                    >
                      {city.name_en}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
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
