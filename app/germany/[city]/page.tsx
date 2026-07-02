import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import {
  getCityBySlug,
  getStatesWithCities,
  getTasksByCategory,
  getVariantsForCity,
} from "@/lib/queries/guide";

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
    title: `Bureaucracy guide for ${city.name_en}`,
    description: `How to handle German bureaucracy in ${city.name_en}: Anmeldung, residence permit, health insurance, tax ID — local offices, appointment rules and official links.`,
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const [categories, variants] = await Promise.all([
    getTasksByCategory(),
    getVariantsForCity(city.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/germany" className="hover:underline">
            Germany
          </Link>{" "}
          / {city.states?.name_en}
        </p>
        <h1 className="text-3xl font-bold">
          {city.name_en}
          {city.name_de !== city.name_en && (
            <span className="ml-2 text-xl font-normal text-muted-foreground">
              ({city.name_de})
            </span>
          )}
        </h1>
        {city.hero_note && (
          <p className="max-w-2xl text-muted-foreground">{city.hero_note}</p>
        )}
        {city.official_portal_url && (
          <a
            href={city.official_portal_url}
            target="_blank"
            rel="noopener nofollow"
            className="inline-block text-sm underline"
          >
            Official city portal →
          </a>
        )}
      </div>

      {categories.map((category) => (
        <section key={category.id} className="space-y-3">
          <h2 className="text-xl font-semibold">{category.name_en}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {category.tasks.map((task) => {
              const variant = variants.get(task.id);
              return (
                <Link
                  key={task.id}
                  href={`/germany/${city.slug}/${task.slug}`}
                  className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{task.title_en}</span>
                    <span className="text-xs text-muted-foreground">
                      {task.title_de}
                    </span>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {variant?.appointment_required === true && (
                      <Badge variant="destructive">
                        Appointment
                        {variant.typical_wait_time
                          ? ` · ${variant.typical_wait_time}`
                          : " required"}
                      </Badge>
                    )}
                    {variant?.walk_in_possible === true && (
                      <Badge className="bg-green-600 text-white">
                        Walk-in possible
                      </Badge>
                    )}
                    {variant?.online_possible === true && (
                      <Badge variant="secondary">Online option</Badge>
                    )}
                    {!variant && (
                      <Badge variant="outline">General guide</Badge>
                    )}
                  </div>
                  {task.summary && (
                    <p className="text-sm text-muted-foreground">
                      {task.summary}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
