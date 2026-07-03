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
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          / {task.task_categories?.name_en}
        </p>
        <h1 className="text-3xl font-bold">
          {task.title_en}{" "}
          <span className="text-xl font-normal text-muted-foreground">
            ({task.title_de})
          </span>
        </h1>
        {task.summary && (
          <p className="max-w-2xl text-muted-foreground">{task.summary}</p>
        )}
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="mb-2 font-medium">
          Rules differ by city — see your local version:
        </p>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/germany/${city.slug}/${task.slug}`}
              className="rounded-full border bg-background px-3 py-1 hover:bg-accent"
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
          className="block rounded-lg border bg-muted/40 p-4 text-sm hover:bg-accent"
        >
          <span className="font-medium underline">
            Anmeldung deadline calculator — when must you register? →
          </span>
        </Link>
      )}

      {getCompareTopic(task.slug) && (
        <Link
          href={`/compare/${task.slug}`}
          className="block rounded-lg border bg-muted/40 p-4 text-sm hover:bg-accent"
        >
          <span className="font-medium underline">
            Compare providers for {task.title_en.toLowerCase()} →
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
