import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCities,
  getCityBySlug,
  getCityFacts,
  getCityStepPairs,
  getStepBySlug,
  parseDocuments,
  resolveStepMeta,
  STEP_FACT_CATEGORY,
} from "@/lib/content";
import { cityStepDescription, cityStepFaq, cityStepTitle } from "@/lib/seo";
import { CompactStepView } from "@/components/step/compact-step-view";
import {
  JsonLd,
  howToJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/components/seo/json-ld";

const BASE_URL = "https://www.germanyguide.net";

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
  const title = cityStepTitle(step.slug, step.title, cityName, variant?.method);
  const description = cityStepDescription({
    stepSlug: step.slug,
    stepTitle: step.title,
    cityName,
    method: variant?.method,
    methodNote: variant?.method_note,
    address: variant?.address,
    fallback: step.seo_description ?? step.summary,
  });
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
  const factCategory = STEP_FACT_CATEGORY[slug];
  const [step, cities, facts, cityDetail] = await Promise.all([
    getStepBySlug(slug),
    getCities(),
    // Only this step's relevant local facts (e.g. rents on the housing step).
    factCategory ? getCityFacts(city) : Promise.resolve([]),
    // Siblings, so every city step links on to the rest of that city's plan.
    getCityBySlug(city),
  ]);
  if (!step) notFound();
  const cityRow = cities.find((c) => c.slug === city);
  if (!cityRow) notFound();

  // The local override when we have one; otherwise the compact view falls back
  // to the universal quick_action + base figures (never a broken card).
  const variant =
    step.city_steps.find((cs) => cs.cities?.slug === city) ?? null;

  // The city facts that belong on THIS step (rents on housing, offices on
  // insurance…) so the local detail sits where the visitor needs it.
  const relatedFacts = factCategory
    ? facts.filter((f) => f.category === factCategory)
    : [];

  const cityName = cityRow.name;
  const documents = parseDocuments(step.documents);
  const meta = resolveStepMeta(step, variant);

  // Q&A drawn entirely from this row's verified fields — no generated answers.
  // The same pairs render visibly below, which is what makes the FAQPage
  // markup honest: it describes content that is actually on the page.
  const faq = cityStepFaq({
    stepSlug: step.slug,
    stepTitle: step.title,
    cityName,
    variant,
    meta,
    step,
  });

  // The other steps documented for this city, in journey order — descriptive
  // anchors ("Anmeldung in Munich") rather than a bare "next".
  const siblings = (cityDetail?.city_steps ?? [])
    .filter((cs) => cs.steps && cs.steps.slug !== step.slug)
    .sort(
      (a, b) =>
        (a.steps!.phases?.sort_order ?? 0) - (b.steps!.phases?.sort_order ?? 0) ||
        (a.steps!.sort_order ?? 0) - (b.steps!.sort_order ?? 0),
    )
    .slice(0, 3)
    .map((cs) => ({
      slug: cs.steps!.slug,
      title: cs.steps!.title,
      href: `/cities/${city}/${cs.steps!.slug}`,
    }));

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
                text: doc.note ? `${doc.name} (${doc.note})` : doc.name,
              }))
            : [
                {
                  name: `${step.title} in ${cityName}`,
                  text: variant?.method_note ?? step.summary ?? step.title,
                },
              ],
        })}
      />
      {faq.length > 0 && <JsonLd data={faqPageJsonLd(faq)} />}
      <CompactStepView
        step={step}
        cityName={cityName}
        citySlug={city}
        city={variant}
        facts={relatedFacts}
        faq={faq}
        siblings={siblings}
      />
    </>
  );
}
