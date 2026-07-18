import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  Footprints,
  Globe,
  Mail,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCities, getCityBySlug } from "@/lib/content";
import { CITIES as CITY_CARDS } from "@/lib/site-config";
import { CityPhoto } from "@/components/city/city-photo";
import { Kicker } from "@/components/ui/kicker";
import { SetCityButton } from "@/components/city/set-city-button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 3600;
export const dynamicParams = true;

const METHOD_META: Record<string, { icon: LucideIcon; label: string }> = {
  walk_in: { icon: Footprints, label: "Walk-in" },
  appointment: { icon: CalendarClock, label: "Appointment" },
  email: { icon: Mail, label: "By email" },
  online: { icon: Globe, label: "Online" },
  post: { icon: Send, label: "By post" },
};

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((city) => ({ city: city.slug }));
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
    title: `Moving to ${city.name}`,
    description: `How German bureaucracy actually works in ${city.name}: registration, residence permits and visa extensions — verified local knowledge.`,
  };
}

export default async function CityHubPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const card = CITY_CARDS.find((c) => c.slug === city.slug);
  const citySteps = city.city_steps
    .filter((cs) => cs.steps)
    .sort((a, b) => {
      const pa = a.steps!.phases?.sort_order ?? 0;
      const pb = b.steps!.phases?.sort_order ?? 0;
      return pa === pb ? a.steps!.sort_order - b.steps!.sort_order : pa - pb;
    });

  const lastVerified = citySteps
    .map((cs) => cs.last_verified)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem]">
        <div className="relative h-72 sm:h-96">
          <CityPhoto
            image={card?.image ?? null}
            alt={`${city.name} — ${city.tagline ?? city.state}`}
            sizes="(max-width: 1152px) 100vw, 1152px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            {city.state}
          </p>
          <h1 className="font-display mt-1 text-4xl font-extrabold sm:text-5xl">
            {city.name}
          </h1>
          {city.tagline && (
            <p className="mt-2 max-w-xl text-white/85">{city.tagline}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <SetCityButton citySlug={city.slug} cityName={city.name} />
        {lastVerified && (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <ShieldCheck className="h-4 w-4 text-success" />
            Local details last verified{" "}
            {new Date(lastVerified).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* How this city works */}
      <Reveal className="mt-14">
        <Kicker>How {city.name} works</Kicker>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold sm:text-4xl">
          The local way of doing the big three.
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          These are the steps where {city.name} does things its own way — each
          card opens the full local guide.
        </p>
      </Reveal>

      <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {citySteps.map((cs) => {
          const meta = cs.method ? METHOD_META[cs.method] : null;
          const Icon = meta?.icon ?? Globe;
          return (
            <StaggerItem key={cs.id} className="h-full">
              <Link
                href={`/cities/${city.slug}/${cs.steps!.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  {cs.method_note && (
                    <span className="rounded-full bg-card-muted px-3 py-1 text-xs font-semibold text-muted">
                      {cs.method_note}
                    </span>
                  )}
                </div>
                <h3 className="font-display mt-5 text-xl font-bold leading-snug">
                  {cs.steps!.title}
                </h3>
                {cs.steps!.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {cs.steps!.summary}
                  </p>
                )}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary">
                  How it works here
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* Everything else */}
      <Reveal className="mt-16 rounded-[2.5rem] border border-border bg-card-muted/60 p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Everything else works the same as anywhere in Germany.
            </h2>
            <p className="mt-2 leading-relaxed text-muted">
              SIM cards, bank accounts, health insurance, taxes — the
              Germany-wide guides cover the rest of your journey, step by step.
            </p>
          </div>
          <Link
            href="/process"
            className="group inline-flex items-center gap-1.5 font-semibold text-primary"
          >
            Browse the full process
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
