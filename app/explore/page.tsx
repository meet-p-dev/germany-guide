import type { Metadata } from "next";
import { getStatesWithCities } from "@/lib/queries/guide";
import { JourneySetup, type WizardCity } from "@/components/JourneySetup";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Build my plan",
  description:
    "Tell us your situation and your German city, and we'll build a personalised, step-by-step relocation roadmap.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; persona?: string }>;
}) {
  const { city: initialCity, persona: initialPersona } = await searchParams;
  const states = await getStatesWithCities();

  const cities: WizardCity[] = states
    .flatMap((s) =>
      s.cities
        .filter((c) => c.is_published)
        .map((c) => ({ slug: c.slug, name: c.name_en, state: s.name_en }))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="py-2">
      <div className="mx-auto max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Build my plan
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
          Two quick questions, then your roadmap.
        </h1>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">
          No account needed. Pick your situation and your city — you can change
          them anytime.
        </p>
      </div>
      <div className="mt-10">
        <JourneySetup
          cities={cities}
          initialCity={initialCity}
          initialPersona={initialPersona}
        />
      </div>
    </div>
  );
}
