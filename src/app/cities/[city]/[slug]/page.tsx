import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCities,
  getCityStepPairs,
  getStepBySlug,
  parseDocuments,
} from "@/lib/content";
import { CompactStepView } from "@/components/step/compact-step-view";
import { JsonLd, howToJsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";

const BASE_URL = "https://germanyguide.net";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pairs = await getCityStepPairs();
  return pairs.map(({ city, step }) => ({ city, slug: step }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}): Promise<Metadata> {
  const { city, slug } = await params;
  const [step, cities] = await Promise.all([getStepBySlug(slug), getCities()]);
  const cityRow = cities.find((c) => c.slug === city);
  if (!step || !cityRow) return {};
  const variant = step.city_steps.find((cs) => cs.cities?.slug === city);
  const cityName = cityRow.name;
  const title = `${step.title} in ${cityName}`;
  const description = `Your ${cityName} plan for "${step.title}": ${
    variant?.method_note ?? step.seo_description ?? step.summary ?? ""
  }`.trim();
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/cities/${city}/${step.slug}` },
    openGraph: {
      title: `${title} · Germany Guide`,
      description,
      url: `${BASE_URL}/cities/${city}/${step.slug}`,
    },
  };
}

export default async function CityStepPage({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}) {
  const { city, slug } = await params;
  const [step, cities] = await Promise.all([getStepBySlug(slug), getCities()]);
  if (!step) notFound();
  const cityRow = cities.find((c) => c.slug === city);
  if (!cityRow) notFound();

  // The local override when we have one; otherwise the compact view falls back
  // to the universal quick_action + base figures (never a broken card).
  const variant =
    step.city_steps.find((cs) => cs.cities?.slug === city) ?? null;

  const cityName = cityRow.name;
  const documents = parseDocuments(step.documents);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Cities", url: `${BASE_URL}/cities` },
          { name: cityName, url: `${BASE_URL}/cities/${city}` },
          { name: step.title, url: `${BASE_URL}/cities/${city}/${step.slug}` },
        ])}
      />
      <JsonLd
        data={howToJsonLd({
          name: `${step.title} in ${cityName}`,
          description:
            variant?.method_note ??
            `Your ${cityName} plan for "${step.title}".`,
          totalCostCents: variant?.cost_cents ?? step.cost_cents,
          steps: documents.length
            ? documents.map((doc) => ({
                name: doc.name,
                text: doc.note ? `${doc.name} — ${doc.note}` : doc.name,
              }))
            : [
                {
                  name: `${step.title} in ${cityName}`,
                  text: variant?.method_note ?? step.summary ?? step.title,
                },
              ],
        })}
      />
      <CompactStepView
        step={step}
        cityName={cityName}
        citySlug={city}
        city={variant}
      />
    </>
  );
}
