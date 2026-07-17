import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPinPlus } from "lucide-react";
import { CITIES } from "@/lib/site-config";
import { Kicker } from "@/components/ui/kicker";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export function CitiesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>Cities covered</Kicker>
          <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold sm:text-[2.75rem] sm:leading-[1.1]">
            Every city plays by its own rules.
          </h2>
        </div>
        <Link
          href="/cities"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          View all cities
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CITIES.map((city) => (
          <StaggerItem key={city.slug} className="h-full">
            <Link
              href={`/cities/${city.slug}`}
              className="group block h-full overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={city.image}
                  alt={`${city.name} — ${city.tagline}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <p className="font-display text-xl font-bold">{city.name}</p>
                  <p className="text-xs text-white/80">{city.state}</p>
                </div>
              </div>
              <p className="p-5 text-sm leading-relaxed text-muted">
                {city.tagline}
              </p>
            </Link>
          </StaggerItem>
        ))}

        <StaggerItem className="h-full">
          <div className="flex h-full min-h-[15rem] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card-muted/60 p-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <MapPinPlus className="h-5 w-5" />
            </span>
            <p className="font-display font-bold">More cities coming soon</p>
            <p className="text-sm leading-relaxed text-muted">
              Everywhere else still gets the full Germany-wide guide.
            </p>
          </div>
        </StaggerItem>
      </Stagger>
    </section>
  );
}
