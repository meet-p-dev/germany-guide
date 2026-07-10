import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Checklist } from "@/components/Checklist";
import { Disclaimer, FreshnessNote } from "@/components/Disclaimer";
import { Markdown } from "@/components/Markdown";
import { PartnerOffers } from "@/components/PartnerOffers";
import { RelatedContent } from "@/components/RelatedContent";
import { getCompareTopic } from "@/lib/compare";
import {
  getStatesWithCities,
  getTasksByCategory,
  getTaskWithGuide,
  mergeSteps,
} from "@/lib/queries/guide";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await getTasksByCategory();
  return categories.flatMap((c) => c.tasks.map((t) => ({ task: t.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ task: string }>;
}): Promise<Metadata> {
  const { task: taskSlug } = await params;
  const task = await getTaskWithGuide(taskSlug);
  if (!task) return {};
  return {
    title: `${task.title_en} (${task.title_de}) in Germany — How it works`,
    description:
      task.summary ??
      `How the ${task.title_en} works in Germany: documents, steps and official links.`,
    alternates: { canonical: `/tasks/${task.slug}` },
  };
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ task: string }>;
}) {
  const { task: taskSlug } = await params;
  const [task, states] = await Promise.all([
    getTaskWithGuide(taskSlug),
    getStatesWithCities(),
  ]);
  if (!task) notFound();

  const guide = task.guides[0] ?? null;
  const steps = guide ? mergeSteps(guide.checklist_steps, []) : [];
  const cities = states
    .flatMap((s) => s.cities.filter((c) => c.is_published))
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm">
          <Link
            href="/"
            className="font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>{" "}
          <span className="text-muted-foreground">
            / {task.task_categories?.name_en}
          </span>
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {task.title_en}{" "}
          <span className="text-xl font-normal text-muted-foreground">
            ({task.title_de})
          </span>
        </h1>
        {task.summary && (
          <p className="max-w-2xl text-lg text-muted-foreground">
            {task.summary}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
        <p className="mb-2 font-semibold">
          Rules differ by city — see your local version:
        </p>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/germany/${city.slug}/${task.slug}`}
              className="rounded-full border border-border bg-card px-3 py-1 font-medium transition-colors hover:border-primary/40 hover:bg-secondary/60"
            >
              {city.name_en}
            </Link>
          ))}
        </div>
      </div>

      <Disclaimer />

      {task.slug === "anmeldung" && (
        <Link
          href="/tools/anmeldung-deadline"
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-secondary/40"
        >
          <span>Anmeldung deadline calculator — when must you register?</span>
          <span className="text-primary" aria-hidden="true">
            →
          </span>
        </Link>
      )}

      {getCompareTopic(task.slug) && (
        <Link
          href={`/compare/${task.slug}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 text-sm font-semibold transition-colors hover:border-primary/40 hover:bg-secondary/40"
        >
          <span>Compare providers for {task.title_en.toLowerCase()}</span>
          <span className="text-primary" aria-hidden="true">
            →
          </span>
        </Link>
      )}

      {!guide && (
        <p className="rounded-md border p-4 text-muted-foreground">
          The detailed guide for this task is still being reviewed.
        </p>
      )}

      {guide && (
        <>
          <section className="space-y-3">
            <Markdown>{guide.intro_md}</Markdown>
          </section>

          {guide.documents_md && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Documents you need</h2>
              <Markdown>{guide.documents_md}</Markdown>
            </section>
          )}

          <Checklist steps={steps} storageKey={`progress:generic:${task.slug}`} />

          {guide.after_md && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">What happens after</h2>
              <Markdown>{guide.after_md}</Markdown>
            </section>
          )}

          <PartnerOffers taskSlug={task.slug} />

          <FreshnessNote
            lastVerifiedAt={guide.last_verified_at}
            sources={guide.sources}
          />
        </>
      )}

      <RelatedContent taskId={task.id} />
    </div>
  );
}
