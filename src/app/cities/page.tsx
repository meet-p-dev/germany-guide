import type { Metadata } from "next";
import Link from "next/link";
import { MapPinPlus } from "lucide-react";
import { getCities } from "@/lib/content";
import { CITIES as CITY_CARDS } from "@/lib/site-config";
import { CityPhoto } from "@/components/city/city-photo";
import { Kicker } from "@/components/ui/kicker";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Cities",
  description:
    "Every German city plays by its own rules. See exactly how registration, residence permits and visa extensions work in yours.",
};

export const revalidate = 3600;

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Kicker>Cities</Kicker>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
        Every city plays by its own rules.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        The same federal law, wildly different counters. Pick your city to see
        how the paperwork actually works where you live — verified, with dates.
      </p>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cities
          .filter((city) => city.status === "live")
          .map((city) => {
            const card = CITY_CARDS.find((c) => c.slug === city.slug);
            return (
              <StaggerItem key={city.slug} className="h-full">
                <Link
                  href={`/cities/${city.slug}`}
                  className="group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-52 overflow-hidden">
                    <CityPhoto
                      image={card?.image ?? null}
                      alt={`${city.name} — ${city.tagline ?? city.state}`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-4 left-5 text-white">
                      <p className="font-display text-2xl font-bold">
                        {city.name}
                      </p>
                      <p className="text-xs text-white/80">{city.state}</p>
                    </div>
                  </div>
                  <p className="p-5 text-sm leading-relaxed text-muted">
                    {city.tagline}
                  </p>
                </Link>
              </StaggerItem>
            );
          })}

        <StaggerItem className="h-full">
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card-muted/60 p-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <MapPinPlus className="h-5 w-5" />
            </span>
            <p className="font-display font-bold">Your city is coming</p>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              We add cities as we verify their processes first-hand. Until
              then, every step&apos;s Germany-wide guide has you covered.
            </p>
          </div>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
