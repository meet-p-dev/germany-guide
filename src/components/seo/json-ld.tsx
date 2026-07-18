/** Renders a <script type="application/ld+json"> block. Data is our own
 * server-fetched content, never user input, so this is safe to serialize
 * directly — no HTML/script injection surface. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE_URL = "https://germanyguide.net";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Germany Guide",
    url: BASE_URL,
    logo: `${BASE_URL}/logo-icon.svg`,
    description:
      "A clear, personalised checklist for moving to Germany that knows how your exact city works.",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Germany Guide",
    url: BASE_URL,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function howToJsonLd(params: {
  name: string;
  description: string;
  totalCostCents?: number | null;
  steps: Array<{ name: string; text: string; url?: string }>;
}) {
  const { name, description, totalCostCents, steps } = params;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalCostCents
      ? {
          estimatedCost: {
            "@type": "MonetaryAmount",
            currency: "EUR",
            value: (totalCostCents / 100).toFixed(2),
          },
        }
      : {}),
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
    })),
  };
}
