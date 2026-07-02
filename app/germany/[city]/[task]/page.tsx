import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Checklist } from "@/components/Checklist";
import { CityFactsBox } from "@/components/CityFactsBox";
import { Disclaimer, FreshnessNote } from "@/components/Disclaimer";
import { Markdown } from "@/components/Markdown";
import { PartnerOffers } from "@/components/PartnerOffers";
import {
  getCityBySlug,
  getStatesWithCities,
  getTasksByCategory,
  getTaskWithGuide,
  getVariant,
  mergeSteps,
} from "@/lib/queries/guide";

export const revalidate = 3600;

export async function generateStaticParams() {
  const [states, categories] = await Promise.all([
    getStatesWithCities(),
    getTasksByCategory(),
  ]);
  const cities = states.flatMap((s) =>
    s.cities.filter((c) => c.is_published).map((c) => c.slug)
  );
  const tasks = categories.flatMap((c) => c.tasks.map((t) => t.slug));
  return cities.flatMap((city) => tasks.map((task) => ({ city, task })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; task: string }>;
}): Promise<Metadata> {
  const { city: citySlug, task: taskSlug } = await params;
  const [city, task] = await Promise.all([
    getCityBySlug(citySlug),
    getTaskWithGuide(taskSlug),
  ]);
  if (!city || !task) return {};
  return {
    title: `${task.title_de} in ${city.name_en} (${task.title_en}) — Documents, Appointment, Guide`,
    description: `How to do the ${task.title_en} (${task.title_de}) in ${city.name_en}: required documents, appointment rules, office addresses and official links.`,
    alternates: { canonical: `/germany/${city.slug}/${task.slug}` },
  };
}

export default async function CityTaskPage({
  params,
}: {
  params: Promise<{ city: string; task: string }>;
}) {
  const { city: citySlug, task: taskSlug } = await params;
  const [city, task] = await Promise.all([
    getCityBySlug(citySlug),
    getTaskWithGuide(taskSlug),
  ]);
  if (!city || !task) notFound();

  const guide = task.guides[0] ?? null;
  const variant = guide ? await getVariant(city.id, task.id) : null;
  const steps = guide
    ? mergeSteps(guide.checklist_steps, variant?.city_step_overrides ?? [])
    : [];

  const howToJsonLd = guide
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `${task.title_en} (${task.title_de}) in ${city.name_en}`,
        description: task.summary ?? undefined,
        step: steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title,
          text: s.body ?? s.title,
        })),
      }
    : null;

  return (
    <div className="space-y-8">
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/germany" className="hover:underline">
            Germany
          </Link>{" "}
          /{" "}
          <Link href={`/germany/${city.slug}`} className="hover:underline">
            {city.name_en}
          </Link>{" "}
          / {task.title_en}
        </p>
        <h1 className="text-3xl font-bold">
          {task.title_en}{" "}
          <span className="text-xl font-normal text-muted-foreground">
            ({task.title_de})
          </span>{" "}
          in {city.name_en}
        </h1>
        {guide?.legal_basis && (
          <p className="text-sm text-muted-foreground">
            Legal basis: {guide.legal_basis}
          </p>
        )}
      </div>

      <Disclaimer />

      {!guide && (
        <p className="rounded-md border p-4 text-muted-foreground">
          The detailed guide for this task is still being reviewed. Check the
          official city portal in the meantime.
        </p>
      )}

      {guide && (
        <>
          {variant ? (
            <CityFactsBox cityName={city.name_en} variant={variant} />
          ) : (
            <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
              City-specific details for {city.name_en} are not yet verified —
              the general process below applies everywhere in Germany.
            </p>
          )}

          <section className="space-y-3">
            <Markdown>{guide.intro_md}</Markdown>
          </section>

          {guide.documents_md && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Documents you need</h2>
              <Markdown>{guide.documents_md}</Markdown>
            </section>
          )}

          <Checklist
            steps={steps}
            storageKey={`progress:${city.slug}:${task.slug}`}
            cityId={city.id}
            taskId={task.id}
          />

          {guide.after_md && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">What happens after</h2>
              <Markdown>{guide.after_md}</Markdown>
            </section>
          )}

          <PartnerOffers taskSlug={task.slug} />

          <FreshnessNote
            lastVerifiedAt={guide.last_verified_at}
            sources={guide.sources}
          />
        </>
      )}
    </div>
  );
}
