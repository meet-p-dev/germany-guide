import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LifeBuoy, Lightbulb } from "lucide-react";
import { getProblemBySlug, getProblems } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { markdownToText } from "@/lib/utils";
import {
  JsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
} from "@/components/seo/json-ld";

const BASE_URL = "https://germanyguide.net";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const problems = await getProblems();
  return problems.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) return {};
  const description = markdownToText(problem.problem_md, 155);
  return {
    title: problem.title,
    description,
    openGraph: {
      title: `${problem.title} · Germany Guide`,
      description,
      url: `${BASE_URL}/problems/${problem.slug}`,
    },
  };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  const answer = markdownToText(
    `${problem.problem_md} ${problem.solution_md}`,
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Problems & solutions", url: `${BASE_URL}/problems` },
          {
            name: problem.title,
            url: `${BASE_URL}/problems/${problem.slug}`,
          },
        ])}
      />
      <JsonLd
        data={faqPageJsonLd([{ question: problem.title, answer }])}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/problems" className="hover:text-foreground">
          Problems &amp; solutions
        </Link>
      </nav>

      <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
        {problem.title}
      </h1>

      <section className="mt-8 rounded-3xl border border-primary/25 bg-primary-soft/60 p-6">
        <p className="font-display flex items-center gap-2 font-bold">
          <LifeBuoy className="h-5 w-5 text-primary" />
          The situation
        </p>
        <Markdown className="mt-3">{problem.problem_md}</Markdown>
      </section>

      <section className="mt-8">
        <p className="font-display flex items-center gap-2 text-xl font-bold">
          <Lightbulb className="h-5 w-5 text-gold" />
          The way out
        </p>
        <Markdown className="mt-4">{problem.solution_md}</Markdown>
      </section>

      <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        General information, not legal advice. If your case has deadlines or
        legal stakes, free migration counselling (Migrationsberatung) exists in
        every city — use it.
      </p>
    </article>
  );
}
