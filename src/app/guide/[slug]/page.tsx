import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStepSlugs, getStepBySlug, parseDocuments } from "@/lib/content";
import { StepView } from "@/components/step/step-view";
import { JsonLd, howToJsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";

const BASE_URL = "https://www.germanyguide.net";

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
  const title = step.seo_title ?? step.title;
  const description = step.seo_description ?? step.summary ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/guide/${step.slug}` },
    openGraph: {
      title: `${title} · Germany Guide`,
      description,
      url: `${BASE_URL}/guide/${step.slug}`,
    },
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

  const documents = parseDocuments(step.documents);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Guide", url: `${BASE_URL}/process` },
          { name: step.title, url: `${BASE_URL}/guide/${step.slug}` },
        ])}
      />
      <JsonLd
        data={howToJsonLd({
          name: step.title,
          description: step.summary ?? step.title,
          totalCostCents: step.cost_cents,
          steps: documents.length
            ? documents.map((doc) => ({
                name: doc.name,
                text: doc.note ? `${doc.name} — ${doc.note}` : doc.name,
              }))
            : [{ name: step.title, text: step.summary ?? step.title }],
        })}
      />
      <StepView step={step} activeCitySlug={null} />
    </>
  );
}
