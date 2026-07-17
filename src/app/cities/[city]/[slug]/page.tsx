import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCityStepPairs, getStepBySlug } from "@/lib/content";
import { StepView } from "@/components/step/step-view";

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

  return <StepView step={step} activeCitySlug={city} />;
}
