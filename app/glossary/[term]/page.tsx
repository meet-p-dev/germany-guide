import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Markdown } from "@/components/Markdown";
import {
  getGlossaryTermBySlug,
  getGlossaryTerms,
  getTasksByIds,
} from "@/lib/queries/content";

export const revalidate = 3600;

export async function generateStaticParams() {
  const terms = await getGlossaryTerms();
  return terms.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: slug } = await params;
  const term = await getGlossaryTermBySlug(slug);
  if (!term) return {};
  return {
    title: `${term.term_de} — meaning in English`,
    description: term.definition_md.replace(/[*_#`]/g, "").slice(0, 160),
    alternates: { canonical: `/glossary/${term.slug}` },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: slug } = await params;
  const term = await getGlossaryTermBySlug(slug);
  if (!term) notFound();

  const relatedTasks = await getTasksByIds(term.related_task_ids);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm">
        <Link
          href="/glossary"
          className="font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          ← Glossary
        </Link>
      </p>
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {term.term_de}
        </h1>
        <p className="text-lg text-muted-foreground">{term.term_en}</p>
      </div>
      <Markdown>{term.definition_md}</Markdown>
      {relatedTasks.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Related guides
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedTasks.map((t) => (
              <Link
                key={t.slug}
                href={`/tasks/${t.slug}`}
                className="rounded-full border border-border px-3 py-1 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary/60"
              >
                {t.title_en} ({t.title_de})
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
