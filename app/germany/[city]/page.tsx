import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, GitCompareArrows, ExternalLink } from "lucide-react";
import { getCityBySlug, getStatesWithCities } from "@/lib/queries/guide";
import { getJourney } from "@/lib/queries/journey";
import { GuideJourney } from "@/components/GuideJourney";
import { CommuterAreas } from "@/components/CommuterAreas";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export async function generateStaticParams() {
  const states = await getStatesWithCities();
  return states.flatMap((s) =>
    s.cities.filter((c) => c.is_published).map((c) => ({ city: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) return {};
  return {
    title: `Settling in ${city.name_en} — the full bureaucracy guide`,
    description: `The whole process for newcomers in ${city.name_en}, phase by phase: Anmeldung, residence permit, health insurance, tax ID — with the local offices, appointment rules and official links.`,
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const { phases, city } = await getJourney("student", citySlug);
  if (!city) notFound();

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          <Link href="/germany" className="hover:underline">
            Germany
          </Link>{" "}
          / {city.states?.name_en}
        </p>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {city.states?.name_en}
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Settling in {city.name_en}
        </h1>
        {city.hero_note && (
          <p className="max-w-2xl text-lg text-foreground/80">{city.hero_note}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild size="lg" className="gap-2 rounded-full font-semibold">
            <Link href={`/explore?city=${city.slug}`}>
              Build my {city.name_en} plan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2 rounded-full font-semibold"
          >
            <Link href="/compare">
              <GitCompareArrows className="h-4 w-4" /> Compare with other cities
            </Link>
          </Button>
          {city.official_portal_url && (
            <a
              href={city.official_portal_url}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Official city portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <GuideJourney phases={phases} cityName={city.name_en} />

      <CommuterAreas cityId={city.id} cityName={city.name_en} />
    </div>
  );
}
