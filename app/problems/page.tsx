import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { getProblems } from "@/lib/queries/content";
import { getStatesWithCities, getTasksByCategory } from "@/lib/queries/guide";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Common problems at German offices — and how to solve them",
  description:
    "No appointment slots, German-only forms, missing documents, silent immigration offices: practical solutions to the problems internationals face with German bureaucracy.",
};

const SEVERITY_TONE: Record<string, StatusTone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; task?: string }>;
}) {
  const { category, task } = await searchParams;
  const [problems, categories, states] = await Promise.all([
    getProblems(),
    getTasksByCategory(),
    getStatesWithCities(),
  ]);
  void states;

  const allTasks = categories.flatMap((c) => c.tasks);
  const taskBySlug = new Map(allTasks.map((t) => [t.slug, t]));
  const filterTask = task ? taskBySlug.get(task) : undefined;

  const filtered = problems.filter((p) => {
    if (category && p.task_categories?.slug !== category) return false;
    if (filterTask && !p.related_task_ids.includes(filterTask.id)) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Problems &amp; solutions
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          When German offices push back
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          The walls internationals actually hit at German offices — and the
          official routes, workarounds and escalations that get past them.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/problems"
          className={`rounded-full border px-3 py-1 font-medium transition-colors ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40 hover:bg-secondary/60"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/problems?category=${c.slug}`}
            className={`rounded-full border px-3 py-1 font-medium transition-colors ${category === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40 hover:bg-secondary/60"}`}
          >
            {c.name_en}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
          No problems in this category yet — more content is on the way.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/problems/${p.slug}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{p.title_en}</span>
                  {p.severity && (
                    <StatusBadge tone={SEVERITY_TONE[p.severity] ?? "neutral"}>
                      {p.severity}
                    </StatusBadge>
                  )}
                  {p.task_categories && (
                    <Badge variant="outline">{p.task_categories.name_en}</Badge>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {p.description_md.replace(/[*_#`]/g, "")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
