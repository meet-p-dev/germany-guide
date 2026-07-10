import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";
import { Markdown } from "@/components/Markdown";
import { PartnerOffers } from "@/components/PartnerOffers";
import { COMPARE_TOPICS, getCompareTopic } from "@/lib/compare";

export const revalidate = 3600;

export function generateStaticParams() {
  return COMPARE_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const t = getCompareTopic(topic);
  if (!t) return {};
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: `/compare/${t.slug}` },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const t = getCompareTopic(topic);
  if (!t) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / Compare
        </p>
        <h1 className="text-3xl font-bold">{t.h1}</h1>
      </div>

      <Disclaimer />

      <section className="space-y-3">
        <Markdown>{t.intro}</Markdown>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What to look for</h2>
        <ul className="space-y-2">
          {t.criteria.map((c) => (
            <li key={c} className="flex gap-2 text-sm">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-gg-progress"
                aria-hidden="true"
              />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <PartnerOffers taskSlug={t.taskSlug} />

      <section className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p>
          Want the full step-by-step, including city-specific details?{" "}
          <Link href={`/tasks/${t.taskSlug}`} className="font-medium underline">
            Read the complete guide →
          </Link>
        </p>
      </section>
    </div>
  );
}
