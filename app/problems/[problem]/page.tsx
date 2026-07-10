import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { Disclaimer, FreshnessNote } from "@/components/Disclaimer";
import { Markdown } from "@/components/Markdown";
import {
  getProblemBySlug,
  getProblems,
  getTasksByIds,
} from "@/lib/queries/content";

export const revalidate = 3600;

const EFFECTIVENESS_LABEL: Record<string, { label: string; tone: StatusTone }> =
  {
    official: { label: "Official route", tone: "success" },
    workaround: { label: "Workaround", tone: "warning" },
    "last-resort": { label: "Last resort", tone: "danger" },
  };

export async function generateStaticParams() {
  const problems = await getProblems();
  return problems.map((p) => ({ problem: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ problem: string }>;
}): Promise<Metadata> {
  const { problem: slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) return {};
  return {
    title: problem.title_en,
    description: problem.description_md.replace(/[*_#`]/g, "").slice(0, 160),
    alternates: { canonical: `/problems/${problem.slug}` },
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ problem: string }>;
}) {
  const { problem: slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  const relatedTasks = await getTasksByIds(problem.related_task_ids);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: problem.title_en,
        acceptedAnswer: {
          "@type": "Answer",
          text: problem.solutions
            .map((s) => `${s.title_en}: ${s.body_md}`)
            .join("\n\n")
            .replace(/[*_#`]/g, ""),
        },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="space-y-2">
        <p className="text-sm">
          <Link
            href="/problems"
            className="font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            ← Problems &amp; solutions
          </Link>
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {problem.title_en}
        </h1>
        {relatedTasks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 text-sm">
            {relatedTasks.map((t) => (
              <Link
                key={t.slug}
                href={`/tasks/${t.slug}`}
                className="rounded-full border border-border px-3 py-1 font-medium transition-colors hover:border-primary/40 hover:bg-secondary/60"
              >
                {t.title_en} ({t.title_de})
              </Link>
            ))}
          </div>
        )}
      </div>

      <Markdown>{problem.description_md}</Markdown>

      <Disclaimer />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Solutions</h2>
        {problem.solutions.map((solution) => {
          const eff = EFFECTIVENESS_LABEL[solution.effectiveness];
          return (
            <div
              key={solution.id}
              className="space-y-2 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{solution.title_en}</h3>
                {eff && <StatusBadge tone={eff.tone}>{eff.label}</StatusBadge>}
                {solution.cities && (
                  <Badge variant="secondary">
                    {solution.cities.name_en} only
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <Markdown>{solution.body_md}</Markdown>
              </div>
            </div>
          );
        })}
      </section>

      <FreshnessNote
        lastVerifiedAt={problem.last_verified_at}
        sources={problem.sources}
      />
    </div>
  );
}
