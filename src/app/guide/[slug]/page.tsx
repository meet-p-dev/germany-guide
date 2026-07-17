import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStepSlugs, getStepBySlug } from "@/lib/content";
import { StepView } from "@/components/step/step-view";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllStepSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const step = await getStepBySlug(slug);
  if (!step) return {};
  return {
    title: step.title,
    description: step.summary ?? undefined,
  };
}

export default async function StepPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const step = await getStepBySlug(slug);
  if (!step) notFound();

  return <StepView step={step} activeCitySlug={null} />;
}
