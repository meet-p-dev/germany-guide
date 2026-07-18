import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityStepPairs, getStepBySlug, parseDocuments } from "@/lib/content";
import { StepView } from "@/components/step/step-view";
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
  const step = await getStepBySlug(slug);
  const variant = step?.city_steps.find((cs) => cs.cities?.slug === city);
  if (!step || !variant) return {};
  const cityName = variant.cities!.name;
  return {
    title: `${step.title} in ${cityName}`,
    description: `How "${step.title}" actually works in ${cityName}: ${
      variant.method_note ?? step.summary ?? ""
    }`,
  };
}

export default async function CityStepPage({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}) {
  const { city, slug } = await params;
  const step = await getStepBySlug(slug);
  if (!step) notFound();
  const variant = step.city_steps.find((cs) => cs.cities?.slug === city);
  if (!variant) notFound();

  const cityName = variant.cities!.name;
  const documents = parseDocuments(step.documents);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Cities", url: `${BASE_URL}/cities` },
          { name: cityName, url: `${BASE_URL}/cities/${city}` },
          {
            name: step.title,
            url: `${BASE_URL}/cities/${city}/${step.slug}`,
          },
        ])}
      />
      <JsonLd
        data={howToJsonLd({
          name: `${step.title} in ${cityName}`,
          description:
            variant.method_note ??
            `How "${step.title}" actually works in ${cityName}.`,
          totalCostCents: variant.cost_cents ?? step.cost_cents,
          steps: documents.length
            ? documents.map((doc) => ({
                name: doc.name,
                text: doc.note ? `${doc.name} — ${doc.note}` : doc.name,
              }))
            : [
                {
                  name: `${step.title} in ${cityName}`,
                  text: variant.method_note ?? step.summary ?? step.title,
                },
              ],
        })}
      />
      <StepView step={step} activeCitySlug={city} />
    </>
  );
}
