import type { Metadata } from "next";
import { getCities } from "@/lib/content";
import { CITIES as CITY_CARDS } from "@/lib/site-config";
import { CityPhoto } from "@/components/city/city-photo";
import { CityBrowser, type BrowserCity } from "@/components/city/city-browser";
import { Kicker } from "@/components/ui/kicker";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

const BASE_URL = "https://germanyguide.net";

export const metadata: Metadata = {
  title: "German Cities: Bureaucracy, City by City",
  description:
    "The same federal paperwork works differently at every counter. Pick your city and see exactly how registration, residence permits and visa extensions run there.",
  alternates: { canonical: `${BASE_URL}/cities` },
};

export const revalidate = 3600;

export default async function CitiesPage() {
  const cities = await getCities();
  const cardImage = (slug: string) =>
    CITY_CARDS.find((c) => c.slug === slug)?.image ?? null;

  const liveCities: BrowserCity[] = cities
    .filter((city) => city.status === "live")
    .map((city) => ({
      slug: city.slug,
      name: city.name,
      state: city.state,
      tagline: city.tagline,
      image: cardImage(city.slug),
    }));
  const comingCities = cities.filter((city) => city.status === "coming_soon");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Kicker>Cities</Kicker>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">
        Every city plays by its own rules.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        {liveCities.length} cities covered so far. The same federal law, wildly
        different counters — search or browse A–Z to see how the paperwork
        actually works where you live, verified and dated.
      </p>

      <CityBrowser cities={liveCities} />

      {comingCities.length > 0 && (
        <div className="mt-20">
          <Kicker>On the way</Kicker>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
            More cities, verified next.
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">
            These cities are next in line. We add each one only after checking
            its registration, residence-permit and extension process first-hand.
            Until then, every step&apos;s Germany-wide guide has you covered.
          </p>

          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {comingCities.map((city) => {
              const card = CITY_CARDS.find((c) => c.slug === city.slug);
              return (
                <StaggerItem key={city.slug} className="h-full">
                  <div className="h-full overflow-hidden rounded-3xl border border-dashed border-border bg-card/50">
                    <div className="relative h-40 overflow-hidden">
                      <CityPhoto
                        image={card?.image ?? null}
                        alt={`${city.name} — ${city.tagline ?? city.state}`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <span className="absolute right-3 top-3 rounded-full border border-white/40 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        Coming soon
                      </span>
                      <div className="absolute bottom-3 left-4 text-white">
                        <p className="font-display text-lg font-bold">
                          {city.name}
                        </p>
                        <p className="text-xs text-white/80">{city.state}</p>
                      </div>
                    </div>
                    {city.tagline && (
                      <p className="p-4 text-sm leading-relaxed text-muted">
                        {city.tagline}
                      </p>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      )}
    </div>
  );
}
